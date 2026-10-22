@echo off
cd /d %~dp0

echo.
echo   MoRead - portable demo
echo   Starting, please wait...
echo.

if not exist "Moread.exe" (
  echo   Cannot find Moread.exe. Please extract the whole zip first.
  pause
  exit /b 1
)

start "MoRead Service - close this window to stop" /min "%~dp0Moread.exe"
ping -n 16 127.0.0.1 >nul
start "" http://127.0.0.1:8080/

echo.
echo   Browser opened: http://127.0.0.1:8080/
echo   If it is not ready, refresh after a few seconds.
echo   Close the "MoRead Service" window to stop the server.
echo.
pause
