// User Stats Display System
console.log('📊 User Stats Display System Loading...');

class UserStatsDisplay {
    constructor() {
        this.stats = {
            onlineUsers: 0,
            usersInRooms: 0,
            waitingUsers: 0,
            activeRooms: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('📊 User Stats Display Initialized');
        this.createStatsDisplay();
        this.connectToSocket();
    }
    
    createStatsDisplay() {
        // Create stats display element
        const statsDisplay = document.createElement('div');
        statsDisplay.id = 'userStatsDisplay';
        statsDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 1000;
            min-width: 200px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        statsDisplay.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #4CAF50;">
                📊 Live Stats
            </div>
            <div id="statsContent">
                <div>🟢 Online Users: <span id="onlineCount">0</span></div>
                <div>💬 In Rooms: <span id="roomCount">0</span></div>
                <div>⏳ Waiting: <span id="waitingCount">0</span></div>
                <div>🏠 Active Rooms: <span id="activeRooms">0</span></div>
            </div>
        `;
        
        document.body.appendChild(statsDisplay);
        console.log('📊 Stats display created');
    }
    
    connectToSocket() {
        // Wait for main app socket connection
        const waitForSocket = () => {
            if (window.saathiTV && window.saathiTV.socket) {
                console.log('📊 Connected to socket for stats');
                this.setupSocketListeners();
            } else {
                setTimeout(waitForSocket, 1000);
            }
        };
        
        waitForSocket();
    }
    
    setupSocketListeners() {
        const socket = window.saathiTV.socket;
        
        // Listen for user stats updates
        socket.on('userStats', (stats) => {
            console.log('📊 Received stats update:', stats);
            this.updateStats(stats);
        });
        
        // Listen for user count updates
        socket.on('userCount', (count) => {
            this.stats.onlineUsers = count;
            this.updateDisplay();
        });
    }
    
    updateStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
        this.updateDisplay();
    }
    
    updateDisplay() {
        const onlineCount = document.getElementById('onlineCount');
        const roomCount = document.getElementById('roomCount');
        const waitingCount = document.getElementById('waitingCount');
        const activeRooms = document.getElementById('activeRooms');
        
        if (onlineCount) onlineCount.textContent = this.stats.onlineUsers || 0;
        if (roomCount) roomCount.textContent = this.stats.usersInRooms || 0;
        if (waitingCount) waitingCount.textContent = this.stats.waitingUsers || 0;
        if (activeRooms) activeRooms.textContent = this.stats.activeRooms || 0;
        
        // Update page title with online count
        document.title = `Saathi TV (${this.stats.onlineUsers || 0} online)`;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Starting User Stats Display...');
    window.userStatsDisplay = new UserStatsDisplay();
});

console.log('✅ User Stats Display System Loaded');
