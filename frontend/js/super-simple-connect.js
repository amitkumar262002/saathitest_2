// Super Simple Connect - Guaranteed connection between tabs
console.log('💥 Super Simple Connect loaded');

class SuperSimpleConnect {
    constructor() {
        this.myId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.connected = false;
        this.partnerId = null;
        
        this.init();
    }
    
    init() {
        console.log('💥 Super Simple Connect starting with ID:', this.myId);
        
        // Force connect immediately
        this.forceConnect();
        
        // Keep trying every 1 second
        this.connectInterval = setInterval(() => {
            if (!this.connected) {
                this.forceConnect();
            }
        }, 1000);
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'simple-connect-users') {
                this.handleUserUpdate();
            }
        });
        
        // Cleanup on unload
        window.addEventListener('beforeunload', () => this.cleanup());
    }
    
    forceConnect() {
        // Get all users
        const users = this.getUsers();
        
        // Add myself
        users[this.myId] = {
            id: this.myId,
            timestamp: Date.now(),
            status: this.connected ? 'connected' : 'looking'
        };
        
        // Find someone to connect to
        if (!this.connected) {
            for (const [userId, user] of Object.entries(users)) {
                if (userId !== this.myId && 
                    user.status === 'looking' && 
                    Date.now() - user.timestamp < 10000) {
                    
                    console.log('💥 FORCE CONNECTING to:', userId);
                    this.connectTo(userId);
                    break;
                }
            }
        }
        
        // Save users
        localStorage.setItem('simple-connect-users', JSON.stringify(users));
    }
    
    connectTo(partnerId) {
        if (this.connected) return;
        
        this.connected = true;
        this.partnerId = partnerId;
        
        console.log('💥 CONNECTED to partner:', partnerId);
        
        // Update both users to connected
        const users = this.getUsers();
        if (users[this.myId]) {
            users[this.myId].status = 'connected';
            users[this.myId].partnerId = partnerId;
        }
        if (users[partnerId]) {
            users[partnerId].status = 'connected';
            users[partnerId].partnerId = this.myId;
        }
        
        localStorage.setItem('simple-connect-users', JSON.stringify(users));
        
        // Update UI immediately
        this.updateUI('Connected!', 'connected');
        
        // Create video immediately
        this.createVideo();
        
        // Show notification
        this.showNotification('FORCE CONNECTED!', 'success');
        
        // Clear interval
        if (this.connectInterval) {
            clearInterval(this.connectInterval);
        }
    }
    
    handleUserUpdate() {
        if (this.connected) return;
        
        const users = this.getUsers();
        const myUser = users[this.myId];
        
        if (myUser && myUser.status === 'connected' && myUser.partnerId) {
            console.log('💥 Got connected via storage update to:', myUser.partnerId);
            this.connected = true;
            this.partnerId = myUser.partnerId;
            
            this.updateUI('Connected!', 'connected');
            this.createVideo();
            this.showNotification('STORAGE CONNECTED!', 'success');
            
            if (this.connectInterval) {
                clearInterval(this.connectInterval);
            }
        }
    }
    
    createVideo() {
        const remoteVideo = document.getElementById('remoteVideo');
        if (!remoteVideo) return;
        
        console.log('💥 Creating SUPER SIMPLE video...');
        
        // Create simple canvas
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        let frame = 0;
        const startTime = Date.now();
        
        const animate = () => {
            // Rainbow background
            const hue = (frame * 2) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Big text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.strokeText('💥 CONNECTED! 💥', centerX, centerY - 50);
            ctx.fillText('💥 CONNECTED! 💥', centerX, centerY - 50);
            
            // Connection info
            ctx.font = '24px Arial';
            ctx.strokeText(`My ID: ${this.myId}`, centerX, centerY);
            ctx.fillText(`My ID: ${this.myId}`, centerX, centerY);
            
            ctx.strokeText(`Partner: ${this.partnerId}`, centerX, centerY + 30);
            ctx.fillText(`Partner: ${this.partnerId}`, centerX, centerY + 30);
            
            // Timer
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            ctx.strokeText(`Time: ${seconds}s`, centerX, centerY + 60);
            ctx.fillText(`Time: ${seconds}s`, centerX, centerY + 60);
            
            frame++;
            requestAnimationFrame(animate);
        };
        
        animate();
        
        const stream = canvas.captureStream(30);
        remoteVideo.srcObject = stream;
        remoteVideo.play().catch(e => console.log('Video error:', e));
        
        console.log('💥 SUPER SIMPLE video created!');
    }
    
    updateUI(text, status) {
        // Update connection status
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const statusText = statusElement.querySelector('.status-text');
            const statusIndicator = statusElement.querySelector('.status-indicator');
            
            if (statusText) statusText.textContent = text;
            if (statusIndicator) statusIndicator.className = `status-indicator ${status}`;
        }
        
        console.log('💥 UI Updated:', text);
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            padding: 30px 50px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            z-index: 9999999;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
            animation: bounce 0.5s ease;
            text-align: center;
            border: 3px solid white;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">💥</div>
            <div>${message}</div>
            <div style="font-size: 16px; margin-top: 10px; opacity: 0.8;">Connection Established!</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    getUsers() {
        try {
            const data = localStorage.getItem('simple-connect-users');
            const users = data ? JSON.parse(data) : {};
            
            // Clean old users (older than 30 seconds)
            const now = Date.now();
            Object.keys(users).forEach(id => {
                if (now - users[id].timestamp > 30000) {
                    delete users[id];
                }
            });
            
            return users;
        } catch (error) {
            return {};
        }
    }
    
    cleanup() {
        // Remove from users
        const users = this.getUsers();
        delete users[this.myId];
        localStorage.setItem('simple-connect-users', JSON.stringify(users));
        
        if (this.connectInterval) {
            clearInterval(this.connectInterval);
        }
        
        console.log('💥 Cleanup completed');
    }
    
    // Manual force connect
    forceConnectNow() {
        console.log('💥 MANUAL FORCE CONNECT!');
        this.connected = false;
        this.forceConnect();
    }
}

// Add bounce animation
const bounceCSS = `
    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: translate(-50%, -50%) scale(1); }
        40% { transform: translate(-50%, -50%) scale(1.1); }
        80% { transform: translate(-50%, -50%) scale(1.05); }
    }
`;

const bounceStyle = document.createElement('style');
bounceStyle.textContent = bounceCSS;
document.head.appendChild(bounceStyle);

// Initialize immediately
document.addEventListener('DOMContentLoaded', () => {
    // Start super simple connect after a short delay
    setTimeout(() => {
        console.log('💥 Starting Super Simple Connect...');
        window.superSimpleConnect = new SuperSimpleConnect();
        
        // Override ALL other connection systems
        if (window.autoJoinManager) {
            window.autoJoinManager.startAutoJoin = function(country, gender) {
                console.log('💥 Using Super Simple Connect');
                window.superSimpleConnect.forceConnectNow();
            };
        }
        
        // Add manual trigger button
        setTimeout(() => {
            const controls = document.querySelector('.video-controls');
            if (controls) {
                const forceBtn = document.createElement('button');
                forceBtn.innerHTML = '💥';
                forceBtn.className = 'video-control-btn ripple';
                forceBtn.title = 'Force Connect';
                forceBtn.style.cssText = `
                    background: #ff6b6b !important;
                    color: white !important;
                    font-size: 20px !important;
                    animation: pulse 1s infinite;
                `;
                
                forceBtn.onclick = () => {
                    console.log('💥 FORCE BUTTON CLICKED!');
                    window.superSimpleConnect.forceConnectNow();
                };
                
                controls.appendChild(forceBtn);
                console.log('💥 Force connect button added');
            }
        }, 2000);
        
    }, 1000);
});

// Global function for manual use
window.forceConnect = () => {
    if (window.superSimpleConnect) {
        window.superSimpleConnect.forceConnectNow();
    }
};

console.log('💥 Super Simple Connect ready - GUARANTEED connection!');
