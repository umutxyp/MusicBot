@echo off
color 1F
title Beatra - Bot Launcher
cd /d "%~dp0"

echo.
echo ==========================================
echo    BEATRA BOT STARTING...
echo ==========================================
echo.
echo Choose startup mode:
echo [1] Normal Mode (without sharding - for bots with less than 1000 servers)
echo [2] Sharding Mode (with sharding - for bots with 1000+ servers)
echo.
set /p mode="Enter your choice (1 or 2): "

if "%mode%"=="1" (
    echo.
    echo Starting in Normal Mode...
    node index.js
) else if "%mode%"=="2" (
    echo.
    echo Starting in Sharding Mode...
    node shard.js
) else (
    echo.
    echo Invalid choice! Starting in Normal Mode by default...
    node index.js
)

echo.
echo ==========================================
echo    BOT STOPPED
echo ==========================================
echo.
pause
