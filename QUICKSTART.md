# 🚀 Quick Start Guide - Dành Cho Team Members

## ⚡ Bắt Đầu Nhanh (5 Phút)

### 1. Clone và Cài Đặt
```bash
# Clone repository
git clone https://github.com/manh15102004/se2025-13.3.git
cd se2025-13.3

# Cài đặt dependencies
npm install
cd backend && npm install && cd ..
```

### 2. Setup Database
```bash
# Tạo database trong MySQL
CREATE DATABASE appsale_db;

# Tạo file backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=appsale_db
JWT_SECRET=secret123
PORT=3000

# Chạy migration
cd backend
node setup-database.js
cd ..
```

### 3. Chạy Ứng Dụng
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm start
# Nhấn 'a' cho Android hoặc 'i' cho iOS
```

---

## 📋 Quy Trình Làm Việc Hàng Ngày

### Bước 1: Cập Nhật Code Mới Nhất
```bash
git checkout develop
git pull origin develop
```

### Bước 2: Tạo Nhánh Feature
```bash
# Tạo nhánh mới từ develop
git checkout -b feature/ten-tinh-nang

# Ví dụ:
git checkout -b feature/user-authentication
git checkout -b feature/payment-integration
git checkout -b bugfix/cart-error
```

### Bước 3: Code và Commit
```bash
# Làm việc trên code...

# Kiểm tra thay đổi
git status

# Add và commit
git add .
git commit -m "feat(auth): Add login functionality"

# Push lên GitHub
git push -u origin feature/user-authentication
```

### Bước 4: Tạo Pull Request
1. Vào https://github.com/manh15102004/se2025-13.3
2. Click "Compare & pull request"
3. Base: `develop` ← Compare: `feature/user-authentication`
4. Viết mô tả và tạo PR
5. Chờ review và merge

### Bước 5: Sau Khi Merge
```bash
# Cập nhật develop
git checkout develop
git pull origin develop

# Xóa nhánh feature (optional)
git branch -d feature/user-authentication
```

---

## ⚠️ QUY TẮC QUAN TRỌNG

### ❌ KHÔNG BAO GIỜ:
- Push trực tiếp lên `main`
- Force push lên `develop` hoặc `main`
- Commit code chưa test
- Commit file có lỗi

### ✅ LUÔN LUÔN:
- Pull trước khi bắt đầu làm việc
- Tạo nhánh feature mới từ `develop`
- Viết commit message rõ ràng
- Tạo Pull Request để merge code
- Test code trước khi commit

---

## 📝 Commit Message Format

```bash
<type>(<scope>): <subject>

# Types:
feat     - Tính năng mới
fix      - Sửa bug
docs     - Cập nhật docs
style    - Format code
refactor - Refactor code
test     - Thêm test
chore    - Cập nhật dependencies

# Ví dụ:
git commit -m "feat(auth): Add Google login"
git commit -m "fix(cart): Fix total calculation"
git commit -m "docs(readme): Update setup guide"
```

---

## 🆘 Xử Lý Lỗi Thường Gặp

### Backend không kết nối được
```bash
# Kiểm tra backend đang chạy
cd backend
npm run dev

# Kiểm tra MySQL đang chạy
# Kiểm tra file .env
```

### Git Conflict
```bash
# Cập nhật develop
git checkout develop
git pull origin develop

# Merge vào nhánh feature
git checkout feature/your-feature
git merge develop

# Sửa conflict trong editor
git add .
git commit -m "merge: Resolve conflicts"
git push
```

### Module not found
```bash
# Cài lại dependencies
rm -rf node_modules
npm install

cd backend
rm -rf node_modules
npm install
```

---

## 🔗 Links Quan Trọng

- **Repository:** https://github.com/manh15102004/se2025-13.3
- **README Đầy Đủ:** [README.md](README.md)
- **Issues:** https://github.com/manh15102004/se2025-13.3/issues

---

## 📞 Cần Giúp Đỡ?

1. Đọc [README.md](README.md) đầy đủ
2. Tạo issue trên GitHub
3. Hỏi trong group chat

---

**Chúc code vui vẻ! 🎉**
