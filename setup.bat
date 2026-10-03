@echo off
title Beatra - Setup
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed.
    echo Download the LTS version from https://nodejs.org, install it, then run this file again.
    pause
    exit /b 1
)

call npm install
if not exist ".env" copy ".env.example" ".env" >nul

echo.
echo Setup complete. Put your bot token into .env and run start.bat
pause
