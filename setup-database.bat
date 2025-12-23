@echo off
REM Script để tạo database MySQL cho AppSale (Windows)

echo ====================================
echo    AppSale Database Setup
echo ====================================
echo.

REM Kiểm tra MySQL đã cài chưa
echo [1] Kiểm tra MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL không được tìm thấy!
    echo Vui lòng cài đặt MySQL hoặc XAMPP trước.
    pause
    exit /b 1
)
echo MySQL đã được tìm thấy ✓

echo.
echo [2] Tạo database appsale...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS appsale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %errorlevel% equ 0 (
    echo Database tạo thành công ✓
) else (
    echo.
    echo ERROR: Không thể tạo database!
    echo Có thể bạn cần nhập password MySQL.
    echo.
    echo Thử lệnh này trong Terminal:
    echo   mysql -u root -p
    echo   CREATE DATABASE appsale CHARACTER SET utf8mb4;
    echo   EXIT;
    echo.
    pause
    exit /b 1
)

echo.
echo [3] Kiểm tra database...
mysql -u root -e "USE appsale; SHOW TABLES;" >nul 2>&1
if %errorlevel% equ 0 (
    echo Database appsale khả dụng ✓
) else (
    echo Database tạo xong nhưng chưa có bảng.
    echo Bảng sẽ được tạo tự động khi chạy server!
)

echo.
echo ====================================
echo    HOÀN THÀNH!
echo ====================================
echo.
echo Bước tiếp theo:
echo 1. Chỉnh sửa backend\.env nếu cần
echo 2. Chạy: cd backend && npm install
echo 3. Chạy: npm run dev
echo.
pause
