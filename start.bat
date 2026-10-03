@echo off
title Beatra
cd /d "%~dp0"

if not exist ".env" (
    echo .env not found. Copy .env.example to .env and fill in DISCORD_TOKEN and CLIENT_ID.
    pause
    exit /b 1
)

node index.js

echo.
echo Bot stopped.
pause
