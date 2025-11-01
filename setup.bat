@echo off
color 0A
title Beatra - Setup
cd /d "%~dp0"

echo.
echo ==========================================
echo    BEATRA SETUP
echo ==========================================
echo.
echo Installing dependencies...
echo.

npm install

echo.
echo ==========================================
echo    SETUP COMPLETE!
echo ==========================================
echo.
echo Next: Edit .env file and run start.bat
echo.
pause
