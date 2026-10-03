@echo off
title Beatra - Setup
cd /d "%~dp0"

echo Installing dependencies...
call npm install

if not exist ".env" copy ".env.example" ".env" >nul

echo.
echo Setup complete. Edit .env and run start.bat
pause
