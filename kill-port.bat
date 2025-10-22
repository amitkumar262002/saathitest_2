@echo off
echo Killing processes on port 3000...

REM Kill any process using port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process ID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo Port 3000 is now free!
echo Starting Saathi TV server...

REM Start the backend server
cd backend
start "Saathi TV Backend" cmd /k "npm start"

REM Wait a moment then start frontend
timeout /t 3 /nobreak >nul
cd ../frontend
start "Saathi TV Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Saathi TV servers are starting!
echo ========================================
echo Backend will be available at: http://localhost:3000
echo Frontend will be available at: http://localhost:8080
echo.
echo Press any key to close this window...
pause >nul
