@echo off
chcp 65001 >nul
echo ========================================
echo   Testing Auto-Update System
echo ========================================
echo.
echo [INFO] Enabling force update check in dev mode...
echo [INFO] Current version: 1.0.1
echo [INFO] Looking for updates on GitHub...
echo.

set FORCE_UPDATE_CHECK=true
npm run electron

pause
