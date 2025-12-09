# 🛍️ AppSale - E-Commerce Mobile Application

> Ứng dụng thương mại điện tử được xây dựng bằng React Native và Node.js

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [Quy Trình Làm Việc Nhóm](#-quy-trình-làm-việc-nhóm)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Git Workflow](#-git-workflow)

---

## 🎯 Giới Thiệu

AppSale là ứng dụng thương mại điện tử di động cho phép người dùng:
- 🛒 Mua sắm sản phẩm đa dạng
- 💰 Bán sản phẩm của riêng mình
- 📦 Quản lý đơn hàng
- ⭐ Đánh giá và review sản phẩm
- 👤 Quản lý hồ sơ cá nhân

## 🛠️ Công Nghệ Sử Dụng

### Frontend (Mobile App)
- **React Native** - Framework phát triển mobile app
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Điều hướng trong app
- **Zustand** - State management

### Backend (API Server)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication

## 💻 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** >= 16.x ([Tải tại đây](https://nodejs.org/))
- **npm** >= 8.x (đi kèm với Node.js)
- **Git** ([Tải tại đây](https://git-scm.com/))
- **MySQL** >= 8.0 ([Tải tại đây](https://dev.mysql.com/downloads/))
- **React Native CLI** hoặc **Expo CLI**
- **Android Studio** (cho Android) hoặc **Xcode** (cho iOS)

### Kiểm Tra Phiên Bản
```bash
node --version    # Phải >= 16.x
npm --version     # Phải >= 8.x
git --version     # Bất kỳ phiên bản nào
mysql --version   # Phải >= 8.0
```

---

## 📥 Hướng Dẫn Cài Đặt

### Bước 1: Clone Repository

```bash
# Clone dự án từ GitHub
git clone https://github.com/manh15102004/se2025-13.3.git

# Di chuyển vào thư mục dự án
cd se2025-13.3
```

### Bước 2: Cài Đặt Dependencies

#### 2.1. Cài đặt Frontend Dependencies
```bash
# Cài đặt các package cho React Native app
npm install
```

#### 2.2. Cài đặt Backend Dependencies
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các package cho backend
npm install

# Quay lại thư mục gốc
cd ..
```

### Bước 3: Cấu Hình Database

#### 3.1. Tạo Database MySQL
```sql
-- Mở MySQL và chạy lệnh sau:
CREATE DATABASE appsale_db;
```

#### 3.2. Cấu Hình Kết Nối Database
Tạo file `.env` trong thư mục `backend/`:

```bash
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=appsale_db
DB_PORT=3306

JWT_SECRET=your_secret_key_here
PORT=3000
```

⚠️ **Lưu ý:** Thay `your_mysql_password` bằng mật khẩu MySQL của bạn.

#### 3.3. Chạy Migration và Seed Data
```bash
cd backend
node setup-database.js
cd ..
```

### Bước 4: Cấu Hình API URL (React Native)

Cập nhật API URL trong file `src/api/client.ts`:

```typescript
// Nếu chạy trên Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// Nếu chạy trên thiết bị thật, thay bằng IP máy tính
// const API_BASE_URL = 'http://192.168.1.x:3000/api';
```

---

## 🚀 Chạy Ứng Dụng

### Chạy Backend Server

```bash
# Mở terminal 1 - Chạy backend
cd backend
npm run dev

# Server sẽ chạy tại: http://localhost:3000
```

### Chạy React Native App

```bash
# Mở terminal 2 - Chạy React Native
npm start

# Sau đó chọn:
# - Nhấn 'a' để chạy trên Android
# - Nhấn 'i' để chạy trên iOS (chỉ trên macOS)
```

### Hoặc Chạy Trực Tiếp

```bash
# Android
npm run android

# iOS (chỉ trên macOS)
npm run ios
```

---

## 👥 Quy Trình Làm Việc Nhóm

### Cấu Trúc Nhánh

```
main (production - code ổn định)
  └── develop (development - code đang phát triển)
        ├── feature/user-authentication
        ├── feature/product-management
        ├── feature/order-processing
        └── bugfix/price-display
```

### Quy Tắc Làm Việc

> ⚠️ **QUAN TRỌNG:**
> - ❌ **KHÔNG BAO GIỜ** push trực tiếp lên nhánh `main`
> - ❌ **KHÔNG BAO GIỜ** force push lên nhánh `develop` hoặc `main`
> - ✅ **LUÔN LUÔN** tạo nhánh feature mới từ `develop`
> - ✅ **LUÔN LUÔN** tạo Pull Request để merge code

---

## 🔄 Git Workflow - Hướng Dẫn Chi Tiết

### 1️⃣ Lần Đầu Tiên Clone Dự Án

```bash
# Clone repository
git clone https://github.com/manh15102004/se2025-13.3.git
cd se2025-13.3

# Xem tất cả các nhánh
git branch -a

# Checkout nhánh develop
git checkout develop

# Cài đặt dependencies
npm install
cd backend && npm install && cd ..
```

### 2️⃣ Bắt Đầu Làm Tính Năng Mới

```bash
# 1. Đảm bảo đang ở nhánh develop
git checkout develop

# 2. Cập nhật code mới nhất từ GitHub
git pull origin develop

# 3. Tạo nhánh feature mới
git checkout -b feature/ten-tinh-nang

# Ví dụ:
git checkout -b feature/user-profile
git checkout -b feature/payment-gateway
git checkout -b bugfix/cart-total-calculation
```

### 3️⃣ Làm Việc và Commit Code

```bash
# 1. Kiểm tra các file đã thay đổi
git status

# 2. Thêm file vào staging
git add .
# Hoặc thêm từng file cụ thể:
git add src/screens/ProfileScreen.tsx

# 3. Commit với message rõ ràng
git commit -m "feat(profile): Add user avatar upload feature"

# 4. Push lên GitHub
git push -u origin feature/user-profile
```

### 4️⃣ Tạo Pull Request (PR)

1. Truy cập: https://github.com/manh15102004/se2025-13.3
2. Click nút **"Compare & pull request"**
3. Điền thông tin:
   - **Base:** `develop`
   - **Compare:** `feature/user-profile`
   - **Title:** Tên tính năng (ví dụ: "Add user avatar upload feature")
   - **Description:** Mô tả chi tiết những gì đã làm
4. Click **"Create pull request"**
5. Chờ team review và approve

### 5️⃣ Sau Khi PR Được Merge

```bash
# 1. Chuyển về nhánh develop
git checkout develop

# 2. Cập nhật code mới nhất
git pull origin develop

# 3. Xóa nhánh feature đã merge (optional)
git branch -d feature/user-profile
```

### 6️⃣ Cập Nhật Code Khi Có Thay Đổi Từ Team

```bash
# Khi đang làm việc trên nhánh feature
git checkout develop
git pull origin develop

git checkout feature/your-feature
git merge develop

# Nếu có conflict, giải quyết conflict rồi:
git add .
git commit -m "merge: Resolve conflicts with develop"
git push
```

---

## 📁 Cấu Trúc Dự Án

```
se2025-13.3/
├── src/                          # Frontend source code
│   ├── api/                      # API client
│   ├── screens/                  # Màn hình ứng dụng
│   │   └── compoments/          # Components của từng màn hình
│   ├── store/                    # Zustand stores
│   ├── data/                     # Static data
│   ├── constants/                # Constants
│   └── types/                    # TypeScript types
│
├── backend/                      # Backend source code
│   ├── config/                   # Configuration files
│   ├── controllers/              # Route controllers
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   └── server.js                 # Entry point
│
├── android/                      # Android native code
├── ios/                          # iOS native code
├── node_modules/                 # Dependencies
├── package.json                  # Frontend dependencies
├── README.md                     # This file
└── .gitignore                    # Git ignore rules
```

---

## 📝 Commit Message Convention

Sử dụng format: `<type>(<scope>): <subject>`

### Types:
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Cập nhật documentation
- `style`: Format code (không ảnh hưởng logic)
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

### Ví Dụ:
```bash
feat(auth): Add Google login integration
fix(cart): Fix total price calculation error
docs(readme): Update installation guide
refactor(api): Simplify error handling
chore(deps): Update React Native to 0.72
```

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Cannot connect to backend"
```bash
# Kiểm tra backend đang chạy
cd backend
npm run dev

# Kiểm tra API URL trong src/api/client.ts
```

### Lỗi: "Database connection failed"
```bash
# Kiểm tra MySQL đang chạy
# Kiểm tra file backend/.env có đúng thông tin không
```

### Lỗi: "Module not found"
```bash
# Cài lại dependencies
rm -rf node_modules
npm install

cd backend
rm -rf node_modules
npm install
```

### Lỗi Git Conflict
```bash
# Khi gặp conflict
git status                    # Xem file bị conflict
# Mở file và sửa conflict thủ công
git add .
git commit -m "merge: Resolve conflicts"
git push
```

---

## 🤝 Đóng Góp

1. Fork repository
2. Tạo nhánh feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 📞 Liên Hệ

- **Repository:** https://github.com/manh15102004/se2025-13.3
- **Issues:** https://github.com/manh15102004/se2025-13.3/issues

---

## 📄 License

This project is licensed under the MIT License.

---

## 🎓 Team Members

Thêm tên các thành viên trong team tại đây:

- Member 1 - Role
- Member 2 - Role
- Member 3 - Role

---

**Happy Coding! 🚀**
