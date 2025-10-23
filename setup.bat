@echo off
color 0A
title MusicMaker - Setup
cd /d "%~dp0"

echo.
echo ==========================================
echo    MUSICMAKER SETUP
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
