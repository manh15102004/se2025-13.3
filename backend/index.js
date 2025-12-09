require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// Import models and database
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// Sync database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully');
  })
  .catch((error) => {
    console.error('Database sync error:', error);
  });

// Routes
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Send message via socket
  socket.on('send_message', (data) => {
    const { conversationId, message } = data;
    io.to(`conversation_${conversationId}`).emit('receive_message', message);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, userId, username } = data;
    io.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      username,
    });
  });

  // Stop typing
  socket.on('stop_typing', (data) => {
    const { conversationId, userId } = data;
    io.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      userId,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const server2 = server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Access from: http://10.125.88.206:${PORT}`);
});

server2.on('error', (err) => {
  console.error('Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});
