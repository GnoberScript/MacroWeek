@echo off
setlocal
cd /d "%~dp0"
set "PATH=%~dp0tools\node-v22.14.0-win-x64;%PATH%"

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing MacroWeek dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo MacroWeek is starting at http://localhost:5173
echo Keep this window open while using the app.
start "" "http://localhost:5173"
call npm.cmd run dev

