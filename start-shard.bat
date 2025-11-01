@echo off
color 1F
title Beatra - Sharding Mode
cd /d "%~dp0"

echo.
echo ==========================================
echo    BEATRA BOT - SHARDING MODE
echo ==========================================
echo.
echo Starting bot with automatic sharding...
echo This mode is recommended for bots in 1000+ servers
echo.

node shard.js

echo.
echo ==========================================
echo    BOT STOPPED
echo ==========================================
echo.
pause
