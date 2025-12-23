const crypto = require('crypto');
const axios = require('axios');
const { Order } = require('../models');

// MoMo configuration
const MOMO_CONFIG = {
    partnerCode: 'MOMO_PARTNER_CODE', // Replace with actual partner code
    accessKey: 'MOMO_ACCESS_KEY',     // Replace with actual access key
    secretKey: 'MOMO_SECRET_KEY',     // Replace with actual secret key
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: 'http://localhost:3000/api/payment/momo/callback',
    ipnUrl: 'http://localhost:3000/api/payment/momo/ipn',
};

// Create MoMo payment
exports.createMoMoPayment = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        const userId = req.user.id;

        // Verify order exists
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Generate request ID and order info
        const requestId = `${orderId}_${Date.now()}`;
        const orderInfo = `Payment for order #${orderId}`;
        const requestType = 'captureWallet';
        const extraData = '';

        // Create raw signature
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Generate signature
        const signature = crypto
            .createHmac('sha256', MOMO_CONFIG.secretKey)
            .update(rawSignature)
            .digest('hex');

        // Request body
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

        // Send request to MoMo
        const response = await axios.post(MOMO_CONFIG.endpoint, requestBody);

        if (response.data.resultCode === 0) {
            // Update order with MoMo transaction info
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
            res.status(400).json({
                success: false,
                message: 'Failed to create MoMo payment',
                error: response.data
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// MoMo callback handler
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

        // Verify signature
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${MOMO_CONFIG.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const expectedSignature = crypto
            .createHmac('sha256', MOMO_CONFIG.secretKey)
            .update(rawSignature)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        // Extract actual order ID from requestId
        const actualOrderId = orderId.split('_')[0];

        // Update order payment status
        if (resultCode === '0') {
            await Order.update(
                {
                    paymentStatus: 'paid',
                    momoTransactionId: transId
                },
                { where: { id: actualOrderId } }
            );

            // Redirect to success page
            res.redirect(`/payment/success?orderId=${actualOrderId}`);
        } else {
            await Order.update(
                { paymentStatus: 'failed' },
                { where: { id: actualOrderId } }
            );

            // Redirect to failure page
            res.redirect(`/payment/failed?orderId=${actualOrderId}&message=${message}`);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// MoMo IPN (Instant Payment Notification) handler
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

        // Verify signature
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${MOMO_CONFIG.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const expectedSignature = crypto
            .createHmac('sha256', MOMO_CONFIG.secretKey)
            .update(rawSignature)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        // Extract actual order ID
        const actualOrderId = orderId.split('_')[0];

        // Update order payment status
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

        // Respond to MoMo
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

// Check payment status
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
