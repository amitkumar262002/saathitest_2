@echo off
echo ========================================
echo    Saathi TV WebRTC Deployment Script
echo ========================================
echo.

echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo [2/6] Installing backend dependencies...
cd backend
if exist package-webrtc.json (
    copy package-webrtc.json package.json
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo WARNING: package-webrtc.json not found, skipping dependency installation
)

echo.
echo [3/6] Checking for conflicting processes...
netstat -an | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 is already in use
    echo Please stop any existing servers or change the port
)

echo.
echo [4/6] Starting signaling server...
echo Starting server in background...
start "Saathi TV Signaling Server" cmd /k "node signaling-server.js"
timeout /t 3 >nul

echo.
echo [5/6] Checking server status...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Signaling server is running
    echo 📊 Health check: http://localhost:3001/health
    echo 📈 Stats endpoint: http://localhost:3001/stats
) else (
    echo WARNING: Server may not be responding yet (this is normal)
    echo Please wait a few seconds and check manually
)

cd ..

echo.
echo [6/6] Integration instructions...
echo.
echo ========================================
echo    NEXT STEPS - IMPORTANT!
echo ========================================
echo.
echo 1. UPDATE YOUR index.html:
echo    - Remove these script tags:
echo      ^<script src="js/peer-matching-system.js"^>^</script^>
echo      ^<script src="js/instant-connect.js"^>^</script^>
echo      ^<script src="js/super-simple-connect.js"^>^</script^>
echo      ^<script src="js/real-webrtc-connection.js"^>^</script^>
echo      ^<script src="js/webrtc-fix.js"^>^</script^>
echo.
echo    - Add these NEW script tags before ^</body^>:
echo      ^<script src="js/webrtc-client.js"^>^</script^>
echo      ^<script src="js/saathi-tv-integration.js"^>^</script^>
echo.
echo 2. TEST THE SYSTEM:
echo    - Open test-webrtc.html in two browser tabs
echo    - Click "Start Video Chat" on both
echo    - Verify real video connection (not fake status)
echo.
echo 3. PRODUCTION DEPLOYMENT:
echo    - Set up TURN servers for NAT traversal
echo    - Configure Redis for scaling (optional)
echo    - Update CORS origins for your domain
echo    - Deploy signaling server to cloud service
echo.
echo ========================================
echo    TESTING URLS
echo ========================================
echo 📺 Test Page: file://%CD%\test-webrtc.html
echo 🏥 Health Check: http://localhost:3001/health
echo 📊 Server Stats: http://localhost:3001/stats
echo.
echo ========================================
echo    TROUBLESHOOTING
echo ========================================
echo - Check browser console for errors
echo - Ensure camera/microphone permissions
echo - Test with different browsers
echo - Check firewall settings
echo.
echo For detailed instructions, see:
echo 📖 WEBRTC_INTEGRATION_GUIDE.md
echo.
echo Press any key to open the test page...
pause >nul

echo Opening test page...
start "" "test-webrtc.html"

echo.
echo ✅ Deployment complete!
echo The signaling server is running in a separate window.
echo Use the test page to verify everything works.
echo.
pause
