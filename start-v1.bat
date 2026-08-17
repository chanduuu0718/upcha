@echo off
setlocal
start "Upcha Backend" cmd /k "cd /d %~dp0backend && npm install && npm run dev"
timeout /t 2 /nobreak >nul
start "Upcha Frontend" cmd /k "cd /d %~dp0frontend\product-selector && npm install && npm run dev"
echo.
echo Upcha is starting...
echo Frontend: http://127.0.0.1:5173
endlocal
