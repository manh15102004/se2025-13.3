require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// Import các model và database
const { sequelize } = require('./models');

// Import TẤT CẢ các route
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const shipperRoutes = require('./routes/shipperRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Đồng bộ database
sequelize
  .sync({ force: false, alter: true })
  .then(() => {
    console.log('✅ Database synced successfully');
  })
  .catch((error) => {
    console.error('❌ Database sync error:', error.message);
  });

// Routes - Tất cả
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/shipper', shipperRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/users', require('./routes/userRoutes')); // Các hành động mạng xã hội

// Route Banner
const bannerController = require('./controllers/bannerController');
const { protect, authorize } = require('./middleware/auth');
const bannerRouter = express.Router();
bannerRouter.get('/', bannerController.getBanners);
bannerRouter.get('/all', protect, authorize('admin', 'system'), bannerController.getAllBanners); // Lấy tất cả cho admin
bannerRouter.get('/my', protect, bannerController.getMyBanners); // Đăng ký Route mới
bannerRouter.get('/pending', protect, authorize('admin', 'system'), bannerController.getPendingBanners);
bannerRouter.post('/', protect, bannerController.createBanner);
bannerRouter.put('/:id/approve', protect, authorize('admin', 'system'), bannerController.approveBanner);
bannerRouter.put('/:id/reject', protect, authorize('admin', 'system'), bannerController.rejectBanner); // Từ chối banner đang chờ
bannerRouter.delete('/:id', protect, authorize('admin', 'system'), bannerController.deleteBanner); // Xóa bất kỳ banner nào
app.use('/api/banners', bannerRouter);

// Kiểm tra trạng thái hệ thống
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running - FULL VERSION WITH SHIPPER & PAYMENT',
  });
});

// Sự kiện Socket.IO (đơn giản hóa)
// Socket.IO events
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connected: ${socket.id} (UserID: ${userId})`);

  // Tham gia phòng trò chuyện
  socket.on('join_room', (conversationId) => {
    if (!conversationId) return;
    const room = conversationId.toString();
    socket.join(room);
    console.log(`User ${userId} joined room ${room}`);
  });

  // Xử lý gửi tin nhắn
  socket.on('send_message', (message) => {
    if (!message || !message.conversationId) return;

    const room = message.conversationId.toString();
    // Phát tới mọi người trong phòng NGOẠI TRỪ người gửi
    socket.to(room).emit('receive_message', message);
    console.log(`Message sent to room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
  console.log(`✅ Shipper API: http://0.0.0.0:${PORT}/api/shipper`);
  console.log(`✅ Payment API: http://0.0.0.0:${PORT}/api/payment`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});
