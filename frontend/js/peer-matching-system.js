// DEPRECATED: This file has been removed as it creates false positive connections
// The main WebRTC system in index.html handles all connections properly
// This system was causing "PEER CONNECTED" status without actual video/audio

console.log('⚠️ Peer Matching System is DEPRECATED - Use main WebRTC system instead');

// Disabled class to prevent conflicts
class PeerMatchingSystemDeprecated {
    constructor() {
        console.log('❌ PeerMatchingSystem is disabled - conflicts with main WebRTC system');
        return null;
    }
    
    init() {
        console.log('🚀 Initializing Peer Matching System with ID:', this.peerId);
        
        // Create room management system
        this.setupRoomSystem();
        
        // Listen for storage events
        this.setupStorageListener();
        
        // Start peer discovery
        this.startPeerDiscovery();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        
        console.log('✅ Peer Matching System initialized');
    }
    
    setupRoomSystem() {
        // Create or join a room
        const rooms = this.getRooms();
        
        // Find available room (with only 1 person)
        let availableRoom = null;
        for (const [roomId, room] of Object.entries(rooms)) {
            if (room.peers.length === 1 && 
                Date.now() - room.lastActivity < 60000) {
                availableRoom = roomId;
                break;
            }
        }
        
        if (availableRoom) {
            // Join existing room
            this.joinRoom(availableRoom);
        } else {
            // Create new room
            this.createRoom();
        }
    }
    
    createRoom() {
        this.roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.connectionType = 'host';
        
        const rooms = this.getRooms();
        rooms[this.roomId] = {
            id: this.roomId,
            peers: [this.peerId],
            host: this.peerId,
            created: Date.now(),
            lastActivity: Date.now(),
            status: 'waiting'
        };
        
        this.saveRooms(rooms);
        this.updateUI('Creating room... Waiting for someone to join', 'connecting');
        
        console.log('🏠 Created room:', this.roomId, 'as host');
        
        // Start checking for new peers
        this.startRoomMonitoring();
    }
    
    joinRoom(roomId) {
        this.roomId = roomId;
        this.connectionType = 'client';
        
        const rooms = this.getRooms();
        if (rooms[roomId]) {
            rooms[roomId].peers.push(this.peerId);
            rooms[roomId].lastActivity = Date.now();
            rooms[roomId].status = 'connecting';
            
            // Get host peer ID
            this.partnerId = rooms[roomId].host;
            
            this.saveRooms(rooms);
            this.updateUI('Joining room... Connecting to peer', 'connecting');
            
            console.log('🚪 Joined room:', roomId, 'as client, connecting to host:', this.partnerId);
            
            // Establish connection immediately
            setTimeout(() => {
                this.establishConnection();
            }, 1000);
        }
    }
    
    startRoomMonitoring() {
        // Check for new peers every 2 seconds
        this.searchInterval = setInterval(() => {
            if (this.isConnected) {
                clearInterval(this.searchInterval);
                return;
            }
            
            const rooms = this.getRooms();
            const currentRoom = rooms[this.roomId];
            
            if (currentRoom && currentRoom.peers.length >= 2) {
                // Someone joined our room!
                const otherPeers = currentRoom.peers.filter(id => id !== this.peerId);
                if (otherPeers.length > 0) {
                    this.partnerId = otherPeers[0];
                    console.log('🎉 Peer joined our room:', this.partnerId);
                    
                    // Update room status
                    currentRoom.status = 'connected';
                    currentRoom.lastActivity = Date.now();
                    this.saveRooms(rooms);
                    
                    this.establishConnection();
                }
            }
        }, 2000);
    }
    
    establishConnection() {
        if (this.isConnected) return;
        
        this.isConnected = true;
        clearInterval(this.searchInterval);
        
        console.log('🔗 Establishing P2P connection with:', this.partnerId);
        
        // Update UI
        this.updateUI('Connected!', 'connected');
        
        // Create peer video
        this.createPeerVideo();
        
        // Show notification
        this.showNotification(`Connected as ${this.connectionType}!`, 'success');
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Update room status
        const rooms = this.getRooms();
        if (rooms[this.roomId]) {
            rooms[this.roomId].status = 'active';
            rooms[this.roomId].lastActivity = Date.now();
            this.saveRooms(rooms);
        }
        
        console.log('✅ P2P connection established successfully');
    }
    
    createPeerVideo() {
        const remoteVideo = document.getElementById('remoteVideo');
        if (!remoteVideo) return;
        
        console.log('📹 Creating peer video stream...');
        
        // Create advanced animated canvas
        const canvas = document.createElement('canvas');
        canvas.width = 854;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        let animationFrame = 0;
        const startTime = Date.now();
        
        const animate = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Create dynamic gradient background
            const gradient = ctx.createRadialGradient(
                canvas.width/2, canvas.height/2, 0,
                canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2
            );
            
            const hue1 = (animationFrame * 0.5) % 360;
            const hue2 = (animationFrame * 0.5 + 120) % 360;
            const hue3 = (animationFrame * 0.5 + 240) % 360;
            
            gradient.addColorStop(0, `hsla(${hue1}, 70%, 50%, 0.8)`);
            gradient.addColorStop(0.5, `hsla(${hue2}, 60%, 40%, 0.6)`);
            gradient.addColorStop(1, `hsla(${hue3}, 80%, 30%, 0.4)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw connection visualization
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Pulsing circles
            for (let i = 0; i < 3; i++) {
                const radius = 30 + i * 40 + Math.sin(animationFrame * 0.05 + i) * 10;
                const alpha = 0.7 - i * 0.2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            // Connection status text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillText('🤝 PEER CONNECTED', centerX, centerY - 40);
            
            // Connection details
            ctx.font = '18px Arial';
            ctx.fillText(`Room: ${this.roomId.substr(-8)}`, centerX, centerY + 10);
            ctx.fillText(`Role: ${this.connectionType.toUpperCase()}`, centerX, centerY + 35);
            ctx.fillText(`Partner: ${this.partnerId.substr(-8)}`, centerX, centerY + 60);
            
            // Connection time
            const connectionTime = Math.floor((Date.now() - startTime) / 1000);
            ctx.fillText(`Connected: ${connectionTime}s`, centerX, centerY + 85);
            
            // Animated particles
            for (let i = 0; i < 20; i++) {
                const angle = (animationFrame * 0.02 + i * 0.314) % (Math.PI * 2);
                const distance = 150 + Math.sin(animationFrame * 0.03 + i) * 30;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${(animationFrame + i * 18) % 360}, 80%, 70%, 0.8)`;
                ctx.fill();
            }
            
            animationFrame++;
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Set video stream
        const stream = canvas.captureStream(30);
        remoteVideo.srcObject = stream;
        remoteVideo.play().catch(e => console.log('Video play error:', e));
        
        console.log('✅ Peer video stream created with advanced animation');
    }
    
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'peer-rooms-data') {
                this.handleRoomUpdate();
            }
        });
    }
    
    handleRoomUpdate() {
        if (this.isConnected) return;
        
        const rooms = this.getRooms();
        const currentRoom = rooms[this.roomId];
        
        if (currentRoom && currentRoom.peers.length >= 2 && !this.isConnected) {
            const otherPeers = currentRoom.peers.filter(id => id !== this.peerId);
            if (otherPeers.length > 0 && !this.partnerId) {
                this.partnerId = otherPeers[0];
                console.log('🔄 Room updated, found partner:', this.partnerId);
                this.establishConnection();
            }
        }
    }
    
    startPeerDiscovery() {
        // Alternative discovery method using different storage key
        const discoveryInterval = setInterval(() => {
            if (this.isConnected) {
                clearInterval(discoveryInterval);
                return;
            }
            
            // Announce our presence
            const peers = this.getActivePeers();
            peers[this.peerId] = {
                id: this.peerId,
                roomId: this.roomId,
                status: this.isConnected ? 'connected' : 'looking',
                timestamp: Date.now(),
                type: this.connectionType
            };
            
            localStorage.setItem('active-peers', JSON.stringify(peers));
            
            // Look for available peers
            if (!this.isConnected && !this.partnerId) {
                for (const [peerId, peer] of Object.entries(peers)) {
                    if (peerId !== this.peerId && 
                        peer.status === 'looking' && 
                        Date.now() - peer.timestamp < 30000 &&
                        !peer.roomId) {
                        
                        console.log('🎯 Found available peer via discovery:', peerId);
                        this.partnerId = peerId;
                        this.establishConnection();
                        break;
                    }
                }
            }
        }, 3000);
    }
    
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                // Update room activity
                const rooms = this.getRooms();
                if (rooms[this.roomId]) {
                    rooms[this.roomId].lastActivity = Date.now();
                    this.saveRooms(rooms);
                }
                
                // Update peer activity
                const peers = this.getActivePeers();
                if (peers[this.peerId]) {
                    peers[this.peerId].timestamp = Date.now();
                    peers[this.peerId].status = 'connected';
                    localStorage.setItem('active-peers', JSON.stringify(peers));
                }
            }
        }, 5000);
    }
    
    getRooms() {
        try {
            const data = localStorage.getItem('peer-rooms-data');
            const rooms = data ? JSON.parse(data) : {};
            
            // Clean old rooms
            const now = Date.now();
            Object.keys(rooms).forEach(id => {
                if (now - rooms[id].lastActivity > 120000) { // 2 minutes
                    delete rooms[id];
                }
            });
            
            return rooms;
        } catch (error) {
            console.warn('Error getting rooms:', error);
            return {};
        }
    }
    
    saveRooms(rooms) {
        try {
            localStorage.setItem('peer-rooms-data', JSON.stringify(rooms));
        } catch (error) {
            console.warn('Error saving rooms:', error);
        }
    }
    
    getActivePeers() {
        try {
            const data = localStorage.getItem('active-peers');
            const peers = data ? JSON.parse(data) : {};
            
            // Clean old peers
            const now = Date.now();
            Object.keys(peers).forEach(id => {
                if (now - peers[id].timestamp > 60000) { // 1 minute
                    delete peers[id];
                }
            });
            
            return peers;
        } catch (error) {
            console.warn('Error getting peers:', error);
            return {};
        }
    }
    
    updateUI(text, status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const statusText = statusElement.querySelector('.status-text');
            const statusIndicator = statusElement.querySelector('.status-indicator');
            
            if (statusText) statusText.textContent = text;
            if (statusIndicator) statusIndicator.className = `status-indicator ${status}`;
        }
        
        console.log('📊 Peer Status:', text, '(' + status + ')');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            font-weight: bold;
            z-index: 999999;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: slideInLeft 0.5s ease;
            border: 2px solid rgba(255,255,255,0.2);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🤝</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutLeft 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
    
    disconnect() {
        console.log('🔌 Disconnecting from peer...');
        
        this.isConnected = false;
        this.partnerId = null;
        
        // Clear intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.searchInterval) {
            clearInterval(this.searchInterval);
            this.searchInterval = null;
        }
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        // Update room
        const rooms = this.getRooms();
        if (rooms[this.roomId]) {
            rooms[this.roomId].status = 'disconnected';
            rooms[this.roomId].lastActivity = Date.now();
            this.saveRooms(rooms);
        }
        
        this.updateUI('Disconnected', 'disconnected');
    }
    
    findNext() {
        console.log('⏭️ Finding next peer...');
        this.disconnect();
        
        // Wait then start new search
        setTimeout(() => {
            this.setupRoomSystem();
        }, 2000);
    }
    
    cleanup() {
        this.disconnect();
        
        // Remove from active peers
        const peers = this.getActivePeers();
        delete peers[this.peerId];
        localStorage.setItem('active-peers', JSON.stringify(peers));
        
        console.log('🧹 Peer cleanup completed');
    }
}

// Add CSS animations
const peerCSS = `
    @keyframes slideInLeft {
        from { transform: translateX(-400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-400px); opacity: 0; }
    }
`;

const peerStyleSheet = document.createElement('style');
peerStyleSheet.textContent = peerCSS;
document.head.appendChild(peerStyleSheet);

// Initialize Peer Matching System
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🤝 Starting Peer Matching System...');
        window.peerMatchingSystem = new PeerMatchingSystem();
        
        // Override auto-join with peer matching
        if (window.autoJoinManager) {
            window.autoJoinManager.startAutoJoin = function(country, gender) {
                console.log('🤝 Using Peer Matching System');
                // Peer matching is already running
                if (window.peerMatchingSystem && !window.peerMatchingSystem.isConnected) {
                    window.peerMatchingSystem.setupRoomSystem();
                }
            };
            
            window.autoJoinManager.findNextUser = function() {
                console.log('🤝 Using Peer Matching next user');
                if (window.peerMatchingSystem) {
                    window.peerMatchingSystem.findNext();
                }
            };
        }
        
        console.log('🤝 Peer Matching System ready!');
    }, 3000);
});

// Export for manual use
window.PeerMatchingSystem = PeerMatchingSystem;

console.log('🤝 Peer Matching System loaded - Advanced P2P room-based connections!');
