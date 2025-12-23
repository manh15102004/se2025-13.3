@echo off
echo ========================================
echo MySQL Database Restore Script
echo ========================================
echo.

REM Set your MySQL path (adjust if needed)
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe

REM Database credentials
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=appsale

REM Ask for backup file path
set /p BACKUP_FILE="Enter full path to your backup .sql file: "

if not exist "%BACKUP_FILE%" (
    echo ERROR: File not found: %BACKUP_FILE%
    pause
    exit /b 1
)

echo.
echo Restoring database from: %BACKUP_FILE%
echo.

REM Restore database
"%MYSQL_PATH%" -h %DB_HOST% -u %DB_USER% %DB_NAME% < "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database restored successfully
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR! Failed to restore database
    echo ========================================
)

echo.
pause
