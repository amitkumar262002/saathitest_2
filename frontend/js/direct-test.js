// Direct Connection Test - No Dependencies
console.log('🧪 DIRECT CONNECTION TEST STARTING...');

// Test both ports
function testPorts() {
    console.log('🔍 Testing ports 3000 and 3001...');
    
    // Test port 3001 with proper error handling
    fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Port 3001 WORKING:', data);
            showSuccess('Connected to backend server on port 3001!');
            connectToPort3001();
        })
        .catch(error => {
            console.log('❌ Port 3001 failed:', error);
            
            // Try port 3000
            fetch('http://localhost:3000/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('✅ Port 3000 WORKING:', data);
                    showSuccess('Connected to backend server on port 3000!');
                    connectToPort3000();
                })
                .catch(error => {
                    console.log('❌ Port 3000 also failed:', error);
                    showError('Backend server not running on any port! Make sure to start the Node.js server.');
                });
        });
}

function connectToPort3001() {
    console.log('🔌 Connecting to port 3001...');
    
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
        console.log('🎉 CONNECTED TO 3001! Socket ID:', socket.id);
        updateStats('Connected to 3001!', 'green');
        
        // Test user stats
        socket.on('userStats', (stats) => {
            console.log('📊 Received stats from 3001:', stats);
            updateLiveStats(stats);
        });
        
        socket.on('userCount', (count) => {
            console.log('👥 User count from 3001:', count);
            updateUserCount(count);
        });
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ 3001 connection error:', error);
        showError('Failed to connect to 3001');
    });
}

function connectToPort3000() {
    console.log('🔌 Connecting to port 3000...');
    
    const socket = io('http://localhost:3000');
    
    socket.on('connect', () => {
        console.log('🎉 CONNECTED TO 3000! Socket ID:', socket.id);
        updateStats('Connected to 3000!', 'green');
        
        socket.on('userStats', (stats) => {
            console.log('📊 Received stats from 3000:', stats);
            updateLiveStats(stats);
        });
        
        socket.on('userCount', (count) => {
            console.log('👥 User count from 3000:', count);
            updateUserCount(count);
        });
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ 3000 connection error:', error);
        showError('Failed to connect to 3000');
    });
}

function updateStats(message, color) {
    // Create status indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: ${color};
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
    `;
    indicator.textContent = message;
    document.body.appendChild(indicator);
}

function updateUserCount(count) {
    const onlineCount = document.getElementById('onlineCount');
    if (onlineCount) {
        onlineCount.textContent = count;
        onlineCount.style.color = count > 0 ? 'green' : 'red';
    }
}

function updateLiveStats(stats) {
    const elements = {
        onlineCount: stats.onlineUsers || 0,
        roomCount: stats.usersInRooms || 0,
        waitingCount: stats.waitingUsers || 0,
        activeRooms: stats.activeRooms || 0
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            element.style.color = value > 0 ? 'green' : 'red';
        }
    });
}

function showError(message) {
    // Remove any existing status messages
    removeStatusMessages();
    
    const error = document.createElement('div');
    error.className = 'status-message error-message';
    error.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
        max-width: 400px;
        border-left: 4px solid #cc0000;
    `;
    error.textContent = message;
    document.body.appendChild(error);
}

function showSuccess(message) {
    // Remove any existing status messages
    removeStatusMessages();
    
    const success = document.createElement('div');
    success.className = 'status-message success-message';
    success.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        max-width: 400px;
        border-left: 4px solid #388E3C;
    `;
    success.textContent = message;
    document.body.appendChild(success);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
        if (success.parentElement) {
            success.remove();
        }
    }, 5000);
}

function removeStatusMessages() {
    const existingMessages = document.querySelectorAll('.status-message');
    existingMessages.forEach(msg => msg.remove());
}

// Start test after 3 seconds
setTimeout(testPorts, 3000);

console.log('✅ Direct test loaded - will start in 3 seconds');
