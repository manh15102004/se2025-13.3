const crypto = require('crypto');
const axios = require('axios');
const { Order } = require('../models');

// Cấu hình MoMo
const MOMO_CONFIG = {
    partnerCode: 'MOMO_PARTNER_CODE', // Thay thế bằng mã đối tác thực tế
    accessKey: 'MOMO_ACCESS_KEY',     // Thay thế bằng access key thực tế
    secretKey: 'MOMO_SECRET_KEY',     // Thay thế bằng secret key thực tế
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: 'http://localhost:3000/api/payment/momo/callback',
    ipnUrl: 'http://localhost:3000/api/payment/momo/ipn',
};

// Đặt thành true để demo/test mà không cần thông tin xác thực MoMo thực
const USE_MOCK_MOMO = true;

// Tạo thanh toán MoMo
exports.createMoMoPayment = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        const userId = req.user.id;

        console.log('=== CREATE MOMO PAYMENT ===');
        console.log('Order ID:', orderId);
        console.log('Amount:', amount);
        console.log('User ID:', userId);
        console.log('Mock mode:', USE_MOCK_MOMO);

        // Kiểm tra đơn hàng có tồn tại không
        const order = await Order.findByPk(orderId);
        if (!order) {
            console.error('Order not found:', orderId);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // CHẾ ĐỘ DEMO/TEST - Giả lập URL thanh toán
        if (USE_MOCK_MOMO) {
            const mockPayUrl = `https://test-payment.momo.vn/gw_payment/payment/qr?partnerCode=DEMO&orderId=${orderId}&amount=${amount}&resultCode=0`;

            // Cập nhật thông tin thanh toán giả lập vào đơn hàng
            await order.update({
                paymentMethod: 'MoMo',
                paymentStatus: 'pending',
                momoTransactionId: `MOCK_${orderId}_${Date.now()}`
            });

            console.log('✅ Mock MoMo payment created');
            console.log('Pay URL:', mockPayUrl);

            return res.status(200).json({
                success: true,
                message: 'MoMo payment created successfully (DEMO MODE)',
                data: {
                    payUrl: mockPayUrl,
                    qrCodeUrl: mockPayUrl,
                    deeplink: `momo://payment?orderId=${orderId}`
                }
            });
        }

        // TÍCH HỢP MOMO THỰC TẾ (yêu cầu thông tin xác thực hợp lệ)
        const requestId = `${orderId}_${Date.now()}`;
        const orderInfo = `Payment for order #${orderId}`;
        const requestType = 'captureWallet';
        const extraData = '';

        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto
            .createHmac('sha256', MOMO_CONFIG.secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode: MOMO_CONFIG.partnerCode,
            accessKey: MOMO_CONFIG.accessKey,
            requestId: requestId,
            amount: amount,
            orderId: requestId,
            orderInfo: orderInfo,
            redirectUrl: MOMO_CONFIG.redirectUrl,
            ipnUrl: MOMO_CONFIG.ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'vi'
        };

        console.log('Sending request to MoMo...');
        const response = await axios.post(MOMO_CONFIG.endpoint, requestBody);
        console.log('MoMo response:', response.data);

        if (response.data.resultCode === 0) {
            await order.update({
                paymentMethod: 'MoMo',
                momoTransactionId: requestId
            });

            res.status(200).json({
                success: true,
                message: 'MoMo payment created successfully',
                data: {
                    payUrl: response.data.payUrl,
                    qrCodeUrl: response.data.qrCodeUrl,
                    deeplink: response.data.deeplink
                }
            });
        } else {
            console.error('MoMo error:', response.data);
            res.status(400).json({
                success: false,
                message: 'Failed to create MoMo payment',
                error: response.data
            });
        }
    } catch (error) {
        console.error('=== MOMO PAYMENT ERROR ===');
        console.error('Error:', error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xử lý callback từ MoMo
exports.momoCallback = async (req, res) => {
    try {
        const {
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.query;

        console.log('=== MOMO CALLBACK ===');
        console.log('Result code:', resultCode);
        console.log('Order ID:', orderId);

        // Trích xuất mã đơn hàng thực từ requestId
        const actualOrderId = orderId.split('_')[0];

        // Cập nhật trạng thái thanh toán đơn hàng
        if (resultCode === '0') {
            await Order.update(
                {
                    paymentStatus: 'paid',
                    momoTransactionId: transId
                },
                { where: { id: actualOrderId } }
            );

            console.log('✅ Payment successful');
            res.redirect(`/payment/success?orderId=${actualOrderId}`);
        } else {
            await Order.update(
                { paymentStatus: 'failed' },
                { where: { id: actualOrderId } }
            );

            console.log('❌ Payment failed');
            res.redirect(`/payment/failed?orderId=${actualOrderId}&message=${message}`);
        }
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xử lý MoMo IPN
exports.momoIPN = async (req, res) => {
    try {
        const {
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.body;

        console.log('=== MOMO IPN ===');
        console.log('Result code:', resultCode);

        const actualOrderId = orderId.split('_')[0];

        if (resultCode === '0') {
            await Order.update(
                {
                    paymentStatus: 'paid',
                    momoTransactionId: transId
                },
                { where: { id: actualOrderId } }
            );
        } else {
            await Order.update(
                { paymentStatus: 'failed' },
                { where: { id: actualOrderId } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'IPN processed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Kiểm tra trạng thái thanh toán
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                momoTransactionId: order.momoTransactionId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
