@echo off
echo Starting Saathi TV Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install backend dependencies if node_modules doesn't exist
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo.
)

REM Install frontend dependencies if node_modules doesn't exist
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo.
)

echo Starting backend server...
start "Saathi TV Backend" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting frontend development server...
start "Saathi TV Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Saathi TV is starting up!
echo ========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo Test Page: http://localhost:8080/test.html
echo.
echo Opening test page in your browser...
timeout /t 2 /nobreak >nul
start http://localhost:8080/test.html
echo.
echo Press any key to close this window...
pause >nul
