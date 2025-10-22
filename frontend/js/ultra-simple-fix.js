// Ultra Simple Fix - Direct Socket Connection
console.log('🚀 ULTRA SIMPLE FIX LOADING...');

class UltraSimpleFix {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.userCount = 0;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Ultra Simple Fix Starting...');
        
        // Wait a bit for page to load
        setTimeout(() => {
            this.connectDirectly();
        }, 2000);
    }
    
    connectDirectly() {
        console.log('🔌 Connecting directly to localhost:3000...');
        
        try {
            // Direct connection - try both ports
            console.log('🔍 Trying port 3001 first...');
            this.socket = io('http://localhost:3001', {
                forceNew: true,
                reconnection: true,
                timeout: 5000
            });
            
            this.setupEvents();
            
        } catch (error) {
            console.error('❌ Connection failed:', error);
            this.showError('Connection failed');
        }
    }
    
    setupEvents() {
        this.socket.on('connect', () => {
            console.log('✅ CONNECTED! Socket ID:', this.socket.id);
            this.connected = true;
            this.updateStats('Connected!');
            
            // Override main app socket
            if (window.saathiTV) {
                window.saathiTV.socket = this.socket;
                window.saathiTV.isConnected = true;
                console.log('🔄 Overrode main app socket');
            }
        });
        
        this.socket.on('disconnect', () => {
            console.log('❌ DISCONNECTED');
            this.connected = false;
            this.updateStats('Disconnected');
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error);
            this.updateStats('Connection Error');
        });
        
        this.socket.on('userCount', (count) => {
            console.log('👥 User count:', count);
            this.userCount = count;
            this.updateUserCount(count);
        });
        
        this.socket.on('userStats', (stats) => {
            console.log('📊 User stats:', stats);
            this.updateAllStats(stats);
        });
        
        // Test connection every 10 seconds
        setInterval(() => {
            if (this.connected) {
                console.log('💓 Heartbeat - Connected:', this.socket.id);
            } else {
                console.log('💔 Heartbeat - Disconnected, retrying...');
                this.connectDirectly();
            }
        }, 10000);
    }
    
    updateStats(message) {
        console.log('📊 Status:', message);
        
        // Update page title
        document.title = `Saathi TV - ${message}`;
        
        // Show notification
        this.showNotification(message);
    }
    
    updateUserCount(count) {
        // Update stats display
        const onlineCount = document.getElementById('onlineCount');
        if (onlineCount) {
            onlineCount.textContent = count;
            onlineCount.style.color = count > 0 ? '#4CAF50' : '#f44336';
        }
        
        // Update page title
        document.title = `Saathi TV (${count} online)`;
        
        console.log(`👥 Updated user count: ${count}`);
    }
    
    updateAllStats(stats) {
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
                element.style.color = value > 0 ? '#4CAF50' : '#666';
            }
        });
        
        console.log('📊 Updated all stats:', stats);
    }
    
    showNotification(message) {
        // Create notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-weight: bold;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    showError(message) {
        console.error('❌ Error:', message);
        
        // Show error notification
        const error = document.createElement('div');
        error.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-weight: bold;
        `;
        error.textContent = `Error: ${message}`;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            if (error.parentNode) {
                error.parentNode.removeChild(error);
            }
        }, 5000);
    }
}

// Start immediately
console.log('🚀 Starting Ultra Simple Fix...');
window.ultraSimpleFix = new UltraSimpleFix();

console.log('✅ Ultra Simple Fix Loaded');
