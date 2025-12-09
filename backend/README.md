# AppSale Backend

Backend API for the AppSale mobile application with authentication, chat, and user management features.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   
   Edit `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/appsale
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

   For MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appsale
   ```

3. **Start MongoDB:**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)
- `PUT /api/auth/profile` - Update user profile (requires token)

### Chat
- `POST /api/chat/conversation` - Get or create conversation (requires token)
- `GET /api/chat/conversations` - Get all conversations (requires token)
- `GET /api/chat/messages/:conversationId` - Get messages (requires token)
- `POST /api/chat/message` - Send a message (requires token)
- `PUT /api/chat/mark-as-read` - Mark messages as read (requires token)

## Frontend Configuration

Update the API base URL in `src/api/client.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_SERVER_IP:5000/api';
```

Replace `YOUR_SERVER_IP` with your actual server IP address.

## Database Schema

### User
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password
- `fullName` - User's full name
- `phone` - Phone number (optional)
- `avatar` - Avatar URL
- `address` - Address (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Conversation
- `participants` - Array of user IDs
- `lastMessage` - Last message content
- `lastMessageTime` - Timestamp of last message
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Message
- `senderId` - Sender user ID
- `receiverId` - Receiver user ID
- `conversationId` - Conversation ID
- `content` - Message content
- `isRead` - Read status
- `createdAt` - Creation timestamp

## Socket.IO Events

For real-time chat functionality:

- `join_conversation` - Join a conversation room
- `send_message` - Send a message in real-time
- `receive_message` - Receive a message
- `leave_conversation` - Leave a conversation room
- `typing` - User is typing
- `user_typing` - Receive typing indicator
- `stop_typing` - User stopped typing
- `user_stop_typing` - Receive stop typing notification

## Error Handling

All API responses follow this format:

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Notes

1. **Change JWT_SECRET** in production
2. **Enable HTTPS** in production
3. **Use environment variables** for sensitive data
4. **Implement rate limiting** for production
5. **Validate all inputs** on the backend
6. **Use MongoDB authentication** in production

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB service is running
- Verify connection string in `.env`
- Ensure MongoDB user credentials are correct

### CORS Issues
- Check frontend API URL configuration
- Ensure backend CORS settings match frontend origin

### Token Expired
- User needs to log in again
- Token will be refreshed on next login

## License

MIT
