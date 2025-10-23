// DEPRECATED: This file creates fake connections between browser tabs
// The main WebRTC system in index.html handles real P2P connections
// This system was causing false positive "CONNECTED" status

console.log('⚠️ Instant Connect System is DEPRECATED - Use main WebRTC system instead');

// Disabled class to prevent conflicts
class InstantConnectDeprecated {
    constructor() {
        console.log('❌ InstantConnect is disabled - creates fake tab connections');
        return null;
    }
    
    init() {
        console.log('⚡ Initializing Instant Connect with ID:', this.connectionId);
        
        // Check immediately for existing connections
        this.checkForExistingConnections();
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'instant-connect-data') {
                this.handleStorageChange(e);
            }
        });
        
        // Register this connection
        this.registerConnection();
        
        // Auto-cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        console.log('✅ Instant Connect initialized');
    }
    
    checkForExistingConnections() {
        const connections = this.getConnections();
        
        // Find available connection (not us)
        for (const [id, conn] of Object.entries(connections)) {
            if (id !== this.connectionId && 
                conn.status === 'waiting' && 
                Date.now() - conn.timestamp < 30000) {
                
                console.log('🎯 Found existing connection, joining as guest:', id);
                this.joinAsGuest(id);
                return;
            }
        }
        
        // No existing connection, become host
        console.log('👑 No existing connections, becoming host');
        this.becomeHost();
    }
    
    becomeHost() {
        this.isHost = true;
        this.updateConnectionStatus('waiting');
        this.updateUI('Waiting for someone to join...', 'connecting');
        
        console.log('👑 Became host, waiting for guest...');
    }
    
    joinAsGuest(hostId) {
        this.isGuest = true;
        this.partnerId = hostId;
        
        // Update host status to connected
        const connections = this.getConnections();
        if (connections[hostId]) {
            connections[hostId].status = 'connected';
            connections[hostId].partnerId = this.connectionId;
            connections[hostId].timestamp = Date.now();
        }
        
        // Update our status
        connections[this.connectionId] = {
            id: this.connectionId,
            status: 'connected',
            partnerId: hostId,
            timestamp: Date.now(),
            role: 'guest'
        };
        
        localStorage.setItem('instant-connect-data', JSON.stringify(connections));
        
        this.establishConnection();
        console.log('🎉 Joined as guest to host:', hostId);
    }
    
    handleStorageChange(event) {
        if (!event.newValue) return;
        
        try {
            const connections = JSON.parse(event.newValue);
            const ourConnection = connections[this.connectionId];
            
            if (ourConnection && ourConnection.status === 'connected' && !this.connected) {
                // We got connected by someone else
                this.partnerId = ourConnection.partnerId;
                this.establishConnection();
                console.log('🔗 Connected via storage change to:', this.partnerId);
            }
        } catch (error) {
            console.warn('Error handling storage change:', error);
        }
    }
    
    establishConnection() {
        if (this.connected) return;
        
        this.connected = true;
        this.updateUI('Connected!', 'connected');
        
        // Create fake remote video immediately
        this.createInstantRemoteVideo();
        
        // Show success notification
        this.showNotification('Instantly connected!', 'success');
        
        console.log('⚡ Instant connection established!');
        
        // Start heartbeat to maintain connection
        this.startHeartbeat();
    }
    
    createInstantRemoteVideo() {
        const remoteVideo = document.getElementById('remoteVideo');
        if (!remoteVideo) return;
        
        console.log('📹 Creating instant remote video...');
        
        // Create canvas for fake video
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // Animated gradient with "CONNECTED" text
        let frame = 0;
        const animate = () => {
            // Animated background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `hsl(${(frame * 2) % 360}, 70%, 40%)`);
            gradient.addColorStop(0.5, `hsl(${(frame * 2 + 120) % 360}, 70%, 50%)`);
            gradient.addColorStop(1, `hsl(${(frame * 2 + 240) % 360}, 70%, 40%)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Pulsing circle
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 50 + Math.sin(frame * 0.1) * 20;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
            
            // "CONNECTED" text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CONNECTED', centerX, centerY - 10);
            
            // Partner info
            ctx.font = '16px Arial';
            ctx.fillText(`Partner: ${this.partnerId ? this.partnerId.substr(-8) : 'Unknown'}`, centerX, centerY + 20);
            
            // Connection time
            const connTime = Math.floor((Date.now() - this.connectTime) / 1000) || 0;
            ctx.fillText(`${connTime}s`, centerX, centerY + 45);
            
            frame++;
            requestAnimationFrame(animate);
        };
        
        this.connectTime = Date.now();
        animate();
        
        // Set video stream
        const stream = canvas.captureStream(30);
        remoteVideo.srcObject = stream;
        remoteVideo.play().catch(e => console.log('Video play error:', e));
        
        console.log('✅ Instant remote video created');
    }
    
    registerConnection() {
        const connections = this.getConnections();
        connections[this.connectionId] = {
            id: this.connectionId,
            status: 'waiting',
            partnerId: null,
            timestamp: Date.now(),
            role: this.isHost ? 'host' : (this.isGuest ? 'guest' : 'unknown')
        };
        
        localStorage.setItem('instant-connect-data', JSON.stringify(connections));
    }
    
    updateConnectionStatus(status) {
        const connections = this.getConnections();
        if (connections[this.connectionId]) {
            connections[this.connectionId].status = status;
            connections[this.connectionId].timestamp = Date.now();
            localStorage.setItem('instant-connect-data', JSON.stringify(connections));
        }
    }
    
    getConnections() {
        try {
            const data = localStorage.getItem('instant-connect-data');
            const connections = data ? JSON.parse(data) : {};
            
            // Clean old connections (older than 1 minute)
            const now = Date.now();
            Object.keys(connections).forEach(id => {
                if (now - connections[id].timestamp > 60000) {
                    delete connections[id];
                }
            });
            
            return connections;
        } catch (error) {
            console.warn('Error getting connections:', error);
            return {};
        }
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
        
        console.log('📊 UI Updated:', text, '(' + status + ')');
    }
    
    showNotification(message, type) {
        // Create notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    startHeartbeat() {
        setInterval(() => {
            if (this.connected) {
                this.updateConnectionStatus('connected');
            }
        }, 5000);
    }
    
    disconnect() {
        this.connected = false;
        this.partnerId = null;
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        // Update status
        this.updateUI('Disconnected', 'disconnected');
        this.updateConnectionStatus('waiting');
        
        console.log('🔌 Disconnected, ready for new connection');
    }
    
    findNext() {
        console.log('⏭️ Finding next partner...');
        this.disconnect();
        
        // Wait a moment then check for new connections
        setTimeout(() => {
            this.checkForExistingConnections();
        }, 1000);
    }
    
    cleanup() {
        // Remove our connection from storage
        const connections = this.getConnections();
        delete connections[this.connectionId];
        localStorage.setItem('instant-connect-data', JSON.stringify(connections));
        
        console.log('🧹 Cleaned up connection:', this.connectionId);
    }
}

// Add CSS for animations
const animationCSS = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = animationCSS;
document.head.appendChild(styleSheet);

// Initialize Instant Connect
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('⚡ Starting Instant Connect System...');
        window.instantConnect = new InstantConnect();
        
        // Override auto-join with instant connect
        if (window.autoJoinManager) {
            const originalStartAutoJoin = window.autoJoinManager.startAutoJoin;
            window.autoJoinManager.startAutoJoin = function(country, gender) {
                console.log('⚡ Using Instant Connect instead of auto-join');
                // Instant connect is already running, just trigger connection check
                window.instantConnect.checkForExistingConnections();
            };
            
            const originalFindNextUser = window.autoJoinManager.findNextUser;
            window.autoJoinManager.findNextUser = function() {
                console.log('⚡ Using Instant Connect next user');
                window.instantConnect.findNext();
            };
        }
        
        console.log('⚡ Instant Connect System ready!');
    }, 2000);
});

// Export for manual use
window.InstantConnect = InstantConnect;

console.log('⚡ Instant Connect System loaded - tabs will connect instantly!');
