# 📚 AppSale - Hướng Dẫn Hoàn Chỉnh

## 📋 Mục Lục

1. [Chuẩn bị môi trường](#chuẩn-bị)
2. [Chạy Database](#database)
3. [Chạy Backend](#backend)
4. [Chạy Frontend](#frontend)
5. [Kiểm tra](#kiểm-tra)
6. [Gặp lỗi](#gặp-lỗi)

---

## 🔧 Chuẩn Bị Môi Trường {#chuẩn-bị}

### Kiểm tra cài đặt

```powershell
# Kiểm tra Node.js
node --version    # Phải >= 14.0

# Kiểm tra npm
npm --version     # Phải >= 6.0

# Kiểm tra git
git --version     # Để clone repo (nếu cần)
```

### Cài đặt nếu chưa có

- **Node.js**: https://nodejs.org/ (chọn LTS)
- **MySQL**: Dùng XAMPP (dễ nhất) hoặc MySQL standalone
  - XAMPP: https://www.apachefriends.org/
  - MySQL: https://dev.mysql.com/downloads/mysql/

---

## 🗄️ Chạy Database {#database}

### Cách 1: XAMPP (Khuyên dùng)

**Bước 1**: Cài XAMPP
- Tải từ https://www.apachefriends.org/
- Cài đặt và mở XAMPP Control Panel

**Bước 2**: Bật MySQL
- Tìm **MySQL** trong danh sách
- Click **Start** 
- Đợi thành xanh ✓

**Bước 3**: Tạo database
```powershell
# Vào folder project
cd d:\appsale

# Chạy script tự động (Windows)
.\setup-database.bat

# Hoặc chạy tay:
mysql -u root
CREATE DATABASE appsale CHARACTER SET utf8mb4;
EXIT;
```

### Cách 2: MySQL Standalone

```powershell
# Bật MySQL service
Start-Service MySQL80

# Tạo database
mysql -u root -p
CREATE DATABASE appsale CHARACTER SET utf8mb4;
EXIT;
```

### Cách 3: Cloud (Miễn phí)

1. Đăng ký: https://remotemysql.com/
2. Tạo database mới
3. Sao chép thông tin
4. Cập nhật `backend/.env` với host, user, password

### Kiểm tra

```powershell
mysql -u root -p
USE appsale;
SHOW TABLES;
EXIT;
```

---

## 🚀 Chạy Backend {#backend}

### Bước 1: Di chuyển vào folder backend

```powershell
cd d:\appsale\backend
```

### Bước 2: Cài đặt packages

```powershell
npm install
```

Nếu gặp lỗi, thử:
```powershell
npm install --legacy-peer-deps
```

### Bước 3: Cấu hình .env

Mở `backend/.env` và kiểm tra:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=appsale
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

Nếu MySQL có password hoặc dùng cloud, cập nhật các dòng:
- `DB_HOST`: localhost hoặc host của cloud
- `DB_USER`: root hoặc username của cloud
- `DB_PASSWORD`: password của bạn
- `DB_NAME`: appsale hoặc tên database của cloud

### Bước 4: Chạy server

```powershell
npm run dev
```

Bạn sẽ thấy:
```
Server is running on port 5000
Database synchronized successfully
```

✅ Backend chạy xong!

---

## 📱 Chạy Frontend {#frontend}

### Bước 1: Mở terminal mới (giữ terminal backend chạy)

```powershell
cd d:\appsale
```

### Bước 2: Cập nhật API URL

**Quan trọng!** Mở `src/api/client.ts` dòng 3:

```typescript
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

Thay `192.168.1.100` bằng **IP của máy tính chạy backend**:

- Tìm IP: Chạy `ipconfig` trong PowerShell
- Nếu chạy cùng máy: `http://localhost:5000/api`
- Nếu Android emulator: `http://10.0.2.2:5000/api`
- Nếu thiết bị thực: `http://[IP_MÁYTÍNH]:5000/api`

### Bước 3: Cài đặt packages

```powershell
npm install
```

### Bước 4: Chạy app

**Android:**
```powershell
npm run android
```

**iOS (macOS only):**
```powershell
npm run ios
```

---

## ✅ Kiểm Tra {#kiểm-tra}

### 1. Backend chạy?

```powershell
curl http://localhost:5000/api/health
```

Hoặc mở browser: http://localhost:5000/api/health

### 2. Database connect?

Xem output của backend, nên thấy:
```
Database synchronized successfully
```

### 3. Frontend connect?

1. Mở app
2. Vào tab Profile/Login
3. Thử **Đăng ký** tài khoản mới
   - Email: test@example.com
   - Password: 123456
4. Nếu thành công, API URL đúng ✓

### 4. Test các tính năng

- ✅ Home: Xem products, filter, search
- ✅ Product Detail: Add to cart, like
- ✅ Cart: View cart, checkout
- ✅ Favorites: View favorites
- ✅ Orders: View order history
- ✅ Profile: View user info

---

## 🐛 Gặp Lỗi? {#gặp-lỗi}

### Backend không chạy

**Lỗi**: "Error: Cannot find module 'mysql2'"
```powershell
cd backend
npm install mysql2 sequelize
```

**Lỗi**: "Error: connect ECONNREFUSED"
- MySQL chưa chạy (bật XAMPP hoặc MySQL service)
- .env có DB_HOST, DB_USER, DB_PASSWORD sai

**Lỗi**: "Error: Access denied for user"
```powershell
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
EXIT;
```

### Frontend không connect

**Lỗi**: "Network Error" hoặc "Can't reach server"
- Kiểm tra IP trong `src/api/client.ts` đúng chưa
- Kiểm tra backend chạy ở port 5000 chưa
- Kiểm tra firewall có block port 5000 không

**Test lại IP**:
```powershell
# Windows
curl http://192.168.1.100:5000/api/health
# hoặc
ipconfig  # Tìm IPv4 Address
```

### App không khởi động

**Lỗi**: "Unable to resolve module"
```powershell
# Xóa cache
npm start -- --reset-cache

# Hoặc cài lại
rm -r node_modules
npm install
npm run android
```

**Lỗi**: "Cannot find android device"
- Kết nối thiết bị USB hoặc bật Android emulator
- Chạy: `adb devices` để kiểm tra

---

## 📞 Hỗ Trợ Nhanh

| Vấn đề | Giải pháp |
|--------|----------|
| MySQL không chạy | Mở XAMPP Control Panel, click Start MySQL |
| Backend error | Kiểm tra `backend/.env`, chạy `npm install` |
| Frontend error | Cập nhật API URL, chạy `npm install` |
| Network error | Kiểm tra IP, test với curl |
| Build error | Xóa cache: `npm start -- --reset-cache` |

---

## 🎯 Workflow Hàng Ngày

```powershell
# Terminal 1: Chạy backend
cd d:\appsale\backend
npm run dev

# Terminal 2: Chạy frontend
cd d:\appsale
npm run android
```

Giữ cả 2 terminal chạy, app sẽ auto-reload khi bạn thay đổi code.

---

## 📚 Tài Liệu Thêm

- **Cấu hình Database**: Xem `DATABASE_SETUP.md`
- **Cấu hình API URL**: Xem `API_URL_SETUP.md`
- **Quick Start**: Xem `QUICK_START.md`
- **Project Structure**: Xem `README.md`

---

## ✨ Done!

Nếu tất cả các bước hoàn tất mà không lỗi, bạn đã có:

✅ Database MySQL chạy trên port 3306  
✅ Backend Express chạy trên port 5000  
✅ Frontend React Native chạy trên thiết bị/emulator  
✅ Authentication (register/login) hoạt động  
✅ Shopping features (cart, favorites, orders) hoạt động  
✅ Real-time messaging infrastructure sẵn sàng  

Tiếp theo có thể:
- 🎨 Tùy chỉnh giao diện
- 💬 Implement chat UI
- 🔐 Thêm bảo mật
- 🛒 Thêm payment
- 📦 Deploy production

Chúc bạn code vui vẻ! 🚀
