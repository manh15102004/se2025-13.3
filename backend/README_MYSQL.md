# AppSale Backend - MySQL Version

Backend API cho ứng dụng AppSale với authentication, chat, và quản lý user.

## Yêu Cầu

- Node.js (v14 trở lên)
- MySQL Server (local hoặc cloud)
- npm hoặc yarn

## Cài Đặt

1. **Cài đặt dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Cấu hình environment variables:**
   
   Sửa `.env`:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=appsale
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

## Chuẩn Bị MySQL

### Cách 1: Tạo Database Thủ Công

1. **Mở MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Tạo database:**
   ```sql
   CREATE DATABASE appsale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Thoát MySQL:**
   ```
   EXIT;
   ```

### Cách 2: Tự Động (Khuyến Nghị)

Server sẽ tự động tạo các bảng khi khởi động lần đầu.

## Chạy Server

### Development (có auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Server sẽ chạy trên `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user (cần token)
- `PUT /api/auth/profile` - Cập nhật profile (cần token)

### Chat
- `POST /api/chat/conversation` - Lấy/tạo conversation (cần token)
- `GET /api/chat/conversations` - Lấy tất cả conversations (cần token)
- `GET /api/chat/messages/:conversationId` - Lấy tin nhắn (cần token)
- `POST /api/chat/message` - Gửi tin nhắn (cần token)
- `PUT /api/chat/mark-as-read` - Đánh dấu đã đọc (cần token)

## Cấu Hình Frontend

Cập nhật API URL trong `src/api/client.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

Thay `YOUR_IP` bằng IP server thực của bạn.

## Cấu Trúc Database

### Bảng Users
- `id` - Khóa chính (tự động tăng)
- `username` - Tên đăng nhập (unique)
- `email` - Email (unique)
- `password` - Mật khẩu (hash)
- `fullName` - Họ tên
- `phone` - Điện thoại (tùy chọn)
- `avatar` - URL avatar
- `address` - Địa chỉ (tùy chọn)
- `createdAt`, `updatedAt` - Thời gian

### Bảng Conversations
- `id` - Khóa chính
- `lastMessage` - Tin nhắn cuối
- `lastMessageTime` - Thời gian tin nhắn cuối
- `createdAt`, `updatedAt`

### Bảng Messages
- `id` - Khóa chính
- `senderId` - ID người gửi (FK)
- `receiverId` - ID người nhận (FK)
- `conversationId` - ID conversation (FK)
- `content` - Nội dung tin nhắn
- `isRead` - Đã đọc?
- `createdAt`, `updatedAt`

### Bảng ConversationParticipants (Join table)
- `ConversationId` - ID conversation (FK)
- `UserId` - ID user (FK)

## Socket.IO Events

Cho chat real-time:

- `join_conversation` - Tham gia room chat
- `send_message` - Gửi tin nhắn real-time
- `receive_message` - Nhận tin nhắn
- `leave_conversation` - Rời khỏi room
- `typing` - Đang gõ
- `user_typing` - Nhận biết người khác đang gõ
- `stop_typing` - Dừng gõ
- `user_stop_typing` - Nhận biết người khác dừng gõ

## Định Dạng Response

Success:
```json
{
  "success": true,
  "message": "Thành công",
  "token": "...",
  "user": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

## Ghi Chú Bảo Mật

1. **Đổi JWT_SECRET** trước khi deploy
2. **Dùng HTTPS** trong production
3. **Dùng environment variables** cho dữ liệu nhạy cảm
4. **Implement rate limiting** cho production
5. **Validate input** trên backend
6. **Dùng MySQL authentication** với mật khẩu mạnh

## Troubleshooting

### Lỗi Kết Nối MySQL
- Kiểm tra MySQL service đang chạy không
- Kiểm tra chi tiết connection trong `.env`
- Kiểm tra database đã tạo chưa
- Kiểm tra user MySQL có permission

### CORS Issues
- Kiểm tra API URL ở frontend
- Kiểm tra CORS config backend

### Token Expired
- User cần đăng nhập lại
- Token mới sẽ tạo khi đăng nhập

## License

MIT
