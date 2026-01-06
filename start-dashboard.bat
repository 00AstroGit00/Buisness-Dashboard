@echo off
setlocal enabledelayedexpansion

echo 🚀 Initializing Deepa Hotel Dashboard...

:: Find the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
)

if "!IP!"=="" (
    echo ❌ Error: Could not find Local IP. Check Wi-Fi connection.
    pause
    exit /b
)

echo 📡 Local Network IP found: !IP!
echo 🔗 Dashboard URL: http://!IP!:5173

:: Start the Vite server
:: Using npm run dev -- --host to ensure it binds to the IP
start /b npm run dev -- --host

:: Wait for server to start
timeout /t 5 /nobreak > nul

:: Open the browser
start http://localhost:5173

echo ✅ Dashboard is running! 
echo 📱 Scan the QR code in the Settings tab from your S23 Ultra or MI Pad 7 to connect.
echo.
echo Press any key to stop the server...
pause
