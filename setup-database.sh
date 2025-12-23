#!/bin/bash
# Script để tạo database MySQL cho AppSale (Mac/Linux)

echo "===================================="
echo "    AppSale Database Setup"
echo "===================================="
echo ""

# Kiểm tra MySQL đã cài chưa
echo "[1] Kiểm tra MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "ERROR: MySQL không được tìm thấy!"
    echo "Vui lòng cài đặt MySQL trước."
    echo "Mac: brew install mysql"
    echo "Linux: sudo apt-get install mysql-server"
    exit 1
fi
echo "MySQL đã được tìm thấy ✓"

echo ""
echo "[2] Tạo database appsale..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS appsale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Database tạo thành công ✓"
else
    echo ""
    echo "ERROR: Không thể tạo database!"
    echo "Có thể bạn cần nhập password MySQL."
    echo ""
    echo "Thử lệnh này trong Terminal:"
    echo "  mysql -u root -p"
    echo "  CREATE DATABASE appsale CHARACTER SET utf8mb4;"
    echo "  EXIT;"
    echo ""
    exit 1
fi

echo ""
echo "[3] Kiểm tra database..."
mysql -u root -p -e "USE appsale; SHOW TABLES;" &>/dev/null
if [ $? -eq 0 ]; then
    echo "Database appsale khả dụng ✓"
else
    echo "Database tạo xong nhưng chưa có bảng."
    echo "Bảng sẽ được tạo tự động khi chạy server!"
fi

echo ""
echo "===================================="
echo "    HOÀN THÀNH!"
echo "===================================="
echo ""
echo "Bước tiếp theo:"
echo "1. Chỉnh sửa backend/.env nếu cần"
echo "2. Chạy: cd backend && npm install"
echo "3. Chạy: npm run dev"
echo ""
