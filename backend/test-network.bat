@echo off
echo ========================================
echo Network Connection Test
echo ========================================
echo.
echo Your computer's IP: 10.106.5.206
echo Backend server: http://10.106.5.206:5000
echo.
echo Testing if server is accessible...
echo.

curl -X POST http://10.106.5.206:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"buyer1@test.com\",\"password\":\"123456\"}"

echo.
echo.
echo ========================================
echo If you see a token above, server is working!
echo If you see "connection refused", check:
echo 1. Backend server is running (npm run dev)
echo 2. Firewall is not blocking port 5000
echo 3. Phone and computer on same WiFi
echo ========================================
pause
