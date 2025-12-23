# AppSale Frontend - Setup Guide

## Database & Authentication Setup Complete ✅

Your AppSale app now has a complete authentication and chat infrastructure!

## What's Been Set Up

### Backend (Node.js + Express + MongoDB)
- User registration and login
- JWT token-based authentication
- User profile management
- Chat conversation system
- Real-time messaging with Socket.IO
- Message history and read status

### Frontend Updates
- New Login/Register screen with API integration
- AsyncStorage for token persistence
- API client for all requests
- Zustand stores for state management
- Cart, Favorites, and Orders management

## Getting Started

### 1. Install Frontend Dependencies

```bash
cd appsale
npm install
```

This will install the required packages:
- `@react-native-async-storage/async-storage` - Store auth token locally
- `axios` - HTTP client (optional, using fetch)
- `socket.io-client` - Real-time chat support

### 2. Set Up Backend

```bash
cd backend
npm install
```

### 3. Configure MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Update `.env`: `MONGODB_URI=mongodb://localhost:27017/appsale`
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `.env`: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appsale`

### 4. Configure API URL

Edit `src/api/client.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

Get your IP:
- **Windows**: Run `ipconfig` in cmd, use IPv4 Address
- **Mac/Linux**: Run `ifconfig`, use inet address

### 5. Start Backend

```bash
cd backend
npm run dev  # Development mode with auto-reload
```

Server will run on `http://localhost:5000`

### 6. Start Frontend

```bash
cd appsale
npm run android  # For Android
npm run ios      # For iOS
npm start        # Metro bundler only
```

## Login/Register Flow

1. **Register New Account**
   - Enter username, email, full name, phone (optional)
   - Set password (min 6 characters)
   - Token is saved to AsyncStorage
   - Auto-login after registration

2. **Login**
   - Enter email and password
   - Token is saved to AsyncStorage
   - Navigate to Home screen

3. **Token Management**
   - Token is automatically sent with API requests
   - Token expires after 7 days
   - User needs to login again after expiration

## Features Ready to Use

### Authentication
- ✅ Register new users
- ✅ Login with email/password
- ✅ View user profile
- ✅ Update profile

### Shopping
- ✅ View products
- ✅ Add to cart
- ✅ Add to favorites
- ✅ View order history

### Chat (Backend Ready, Frontend TBD)
- ✅ Create conversations
- ✅ Send/receive messages
- ✅ Real-time updates (Socket.IO)
- ✅ Mark messages as read

## Next Steps

1. **Test the API:**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/health
   ```

2. **Test Registration:**
   - Open the app
   - Switch to "Đăng Ký" (Register)
   - Fill in all fields and register

3. **Test Login:**
   - Use the account you just created
   - Login and navigate to Home

4. **Implement Chat UI (Optional)**
   - Create ChatScreen component
   - Use chatAPI functions from src/api/client.ts
   - Implement Socket.IO for real-time messaging

## Troubleshooting

### Cannot Connect to Backend
- Check backend is running: `npm run dev` in backend folder
- Verify API URL is correct in `src/api/client.ts`
- Ensure firewall allows port 5000
- Check your actual IP address (not localhost)

### MongoDB Connection Error
```
MongooseError: Cannot connect to database
```
- Check MongoDB is running
- Verify MONGODB_URI in `.env`
- Check internet connection (for Atlas)
- Verify credentials (for Atlas)

### Token Errors
```
Invalid token
```
- Clear AsyncStorage: Delete app and reinstall
- Or reset token: User needs to login again

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
- Change PORT in `.env`: `PORT=5001`
- Or kill process using port 5000

## API Response Examples

### Register Success
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

### Login Success
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

## Files Structure

```
appsale/
├── src/
│   ├── api/
│   │   └── client.ts          # API client functions
│   ├── screens/
│   │   └── compoments/
│   │       └── LoginScreen.tsx # Updated with registration
│   └── store/
│       ├── cartStore.ts
│       ├── favoritesStore.ts
│       └── ordersStore.ts
│
backend/
├── models/
│   ├── User.js
│   ├── Message.js
│   └── Conversation.js
├── controllers/
│   ├── authController.js
│   └── chatController.js
├── routes/
│   ├── authRoutes.js
│   └── chatRoutes.js
├── middleware/
│   └── auth.js
├── index.js                   # Main server file
├── package.json
├── .env
└── README.md
```

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Socket.IO Documentation](https://socket.io/)
- [JWT Documentation](https://jwt.io/)

## Support

For issues, check:
1. Backend console for error messages
2. Network tab in React DevTools
3. AsyncStorage data using React Native debugger
4. MongoDB collections in MongoDB Compass

Happy coding! 🚀
