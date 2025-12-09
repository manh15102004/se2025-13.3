# Hướng Dẫn Chạy Database MySQL cho AppSale

## 1️⃣ CÁCH 1: Sử Dụng XAMPP (Khuyến Nghị - Dễ Nhất)

### Bước 1: Cài Đặt XAMPP
- Tải XAMPP từ: https://www.apachefriends.org/index.html
- Chọn version PHP 8.0 trở lên
- Cài đặt vào ổ C:\xampp (mặc định)

### Bước 2: Khởi Động XAMPP
1. Mở **XAMPP Control Panel**
2. Bấm **Start** cho Apache (tùy chọn, dùng cho web server)
3. Bấm **Start** cho MySQL - **QUAN TRỌNG!** ✅

```
Module | Status | Action
MySQL  | Running | Stop (nếu đã chạy thì OK)
```

### Bước 3: Tạo Database
1. Mở trình duyệt, vào: http://localhost/phpmyadmin
2. Hoặc mở Terminal và chạy:
   ```bash
   mysql -u root -p
   ```
   (Nếu hỏi password, bấm Enter - mặc định không có password)

3. Chạy lệnh tạo database:
   ```sql
   CREATE DATABASE appsale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

### Bước 4: Cập Nhật .env
File: `d:\appsale\backend\.env`

```
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

**Lưu ý:** `DB_PASSWORD` để trống (XAMPP mặc định không có password)

### Bước 5: Chạy Server
```bash
cd d:\appsale\backend
npm install
npm run dev
```

**Nếu thành công bạn sẽ thấy:**
```
Database synchronized successfully
Server is running on port 5000
```

---

## 2️⃣ CÁCH 2: Sử Dụng MySQL Server (Standalone)

### Bước 1: Cài Đặt MySQL Server
- Tải từ: https://dev.mysql.com/downloads/mysql/
- Chọn Windows (msi installer)
- Cài đặt và nhớ mật khẩu

### Bước 2: Tạo Database
```bash
mysql -u root -p
```

Nhập mật khẩu đã cài đặt, sau đó:
```sql
CREATE DATABASE appsale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Bước 3: Cập Nhật .env
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=appsale
DB_PORT=3306
```

### Bước 4: Chạy Server
```bash
cd d:\appsale\backend
npm install
npm run dev
```

---

## 3️⃣ CÁCH 3: Sử Dụng MySQL Cloud (MongoDB Atlas Alternative)

### Bước 1: Tạo Tài Khoản
- Truy cập: https://www.freemysqlhosting.net/
- Hoặc: https://remotemysql.com/
- Hoặc: AWS RDS, DigitalOcean, Google Cloud SQL

### Bước 2: Tạo Database
- Theo hướng dẫn của service

### Bước 3: Cập Nhật .env
```
DB_HOST=your_host.remotemysql.com
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
```

### Bước 4: Chạy Server
```bash
npm run dev
```

---

## 🔧 Kiểm Tra Kết Nối

### Test 1: Kiểm tra MySQL chạy
```bash
mysql -u root -p
```
Nếu kết nối được → MySQL OK ✅

### Test 2: Kiểm tra database tồn tại
```bash
mysql -u root -p -e "SHOW DATABASES;"
```
Nên thấy `appsale` trong danh sách

### Test 3: Kiểm tra server backend
```bash
npm run dev
```
Nên thấy:
- `Database synchronized successfully`
- `Server is running on port 5000`

### Test 4: Test API
```bash
curl http://localhost:5000/api/health
```
Nên nhận được:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## ⚠️ Lỗi Thường Gặp & Cách Fix

### Lỗi 1: "Cannot connect to MySQL"
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Fix:**
- Kiểm tra MySQL đã start chưa (XAMPP hoặc services)
- Kiểm tra cấu hình `.env` đúng không
- Kiểm tra port 3306 đúng không

```bash
# Windows - kiểm tra MySQL service
sc query MySQL

# Nếu không chạy, start nó
net start MySQL
```

### Lỗi 2: "Access denied for user 'root'@'localhost'"
```
Error: Access denied for user 'root'@'localhost' (using password: YES)
```

**Fix:**
- Password sai trong `.env`
- XAMPP mặc định: password trống
- MySQL Server: nhập password đã cài

### Lỗi 3: "Unknown database 'appsale'"
```
Error: Unknown database 'appsale'
```

**Fix:**
- Database chưa được tạo
- Chạy lệnh tạo database ở Terminal

```bash
mysql -u root -p
CREATE DATABASE appsale CHARACTER SET utf8mb4;
EXIT;
```

### Lỗi 4: "EADDRINUSE: address already in use :::3306"
```
Error: EADDRINUSE: address already in use :::3306
```

**Fix:**
- MySQL đã chạy ở process khác
- Hoặc port 3306 bị chiếm
- Thử dùng port khác:

```
DB_PORT=3307
```

---

## 📋 Các Bước Tóm Tắt (Lần Đầu)

### Nếu dùng XAMPP:
```bash
# 1. Mở XAMPP Control Panel, click Start MySQL
# 2. Tạo database
mysql -u root
CREATE DATABASE appsale CHARACTER SET utf8mb4;
EXIT;

# 3. Cập nhật .env (DB_PASSWORD trống)
# 4. Cài dependencies
cd d:\appsale\backend
npm install

# 5. Chạy server
npm run dev
```

### Nếu dùng MySQL Server:
```bash
# 1. MySQL service tự động chạy
# 2. Tạo database
mysql -u root -p
CREATE DATABASE appsale CHARACTER SET utf8mb4;
EXIT;

# 3. Cập nhật .env với password
# 4. Cài dependencies
cd d:\appsale\backend
npm install

# 5. Chạy server
npm run dev
```

---

## ✅ Kiểm Tra Cuối Cùng

Nếu bạn thấy dòng này trong terminal → **THÀNH CÔNG**:
```
Database synchronized successfully
Server is running on port 5000
```

Bây giờ bạn có thể:
- Đăng ký tài khoản từ app
- Đăng nhập
- Gửi tin nhắn (sau khi implement chat UI)
- Xem dữ liệu trong database

---

## 🔍 Xem Dữ Liệu Database

### Dùng phpMyAdmin (XAMPP)
1. Truy cập: http://localhost/phpmyadmin
2. Chọn database `appsale`
3. Xem các bảng: Users, Messages, Conversations

### Dùng MySQL Command Line
```bash
mysql -u root -p
USE appsale;
SHOW TABLES;
SELECT * FROM Users;
EXIT;
```

### Dùng MySQL Workbench (GUI)
- Tải: https://dev.mysql.com/downloads/workbench/
- Connect tới localhost:3306
- Xem dữ liệu dễ dàng

---

## Cần Giúp?

Nếu có vấn đề, hãy cung cấp:
1. Error message đầy đủ
2. Output của `npm run dev`
3. Cấu hình `.env`
4. Output của `mysql -u root -p -e "SHOW DATABASES;"`
