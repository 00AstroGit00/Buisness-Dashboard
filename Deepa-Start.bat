@echo off
title Deepa Dashboard - Network Starter
color 0A

echo Checking Local Network Connection...
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0') do set IP=%%a
echo.
echo ======================================================
echo   DEEPA RESTAURANT & TOURIST HOME - DASHBOARD
echo ======================================================
echo.
echo Your HP Laptop IP: %IP%
echo Open this on your S23 Ultra: http://%IP%:5173
echo.
echo 1. Clearing Vite Cache...
if exist ".vite" rd /s /q ".vite"
if exist ".vite_cache" rd /s /q ".vite_cache"

echo 2. Starting Development Server...
echo (Please keep this window open while using the dashboard)
echo.
npm run dev -- --host --force
pause