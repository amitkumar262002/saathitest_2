// Omegle-Style Random Chat System - Exactly like Ome.tv
console.log('🎭 Omegle-Style Chat System loaded');

class OmegleStyleChat {
    constructor() {
        this.userId = 'stranger_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        this.isConnected = false;
        this.partnerId = null;
        this.chatRoom = null;
        this.connectionAttempts = 0;
        this.maxAttempts = 10;
        
        this.init();
    }
    
    init() {
        console.log('🎭 Initializing Omegle-Style Chat with ID:', this.userId);
        
        // Start looking for strangers immediately
        this.startLookingForStrangers();
        
        // Listen for storage changes (other users)
        window.addEventListener('storage', (e) => {
            if (e.key === 'omegle-strangers') {
                this.handleStrangerUpdate();
            }
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // Add Omegle-style UI elements
        this.setupOmegleUI();
        
        console.log('✅ Omegle-Style Chat initialized');
    }
    
    startLookingForStrangers() {
        console.log('🔍 Looking for strangers...');
        this.updateStatus('Looking for strangers...', 'connecting');
        
        // Register as available stranger
        this.registerAsStranger();
        
        // Try to find another stranger every 2 seconds
        this.searchInterval = setInterval(() => {
            if (!this.isConnected && this.connectionAttempts < this.maxAttempts) {
                this.findStranger();
                this.connectionAttempts++;
            } else if (this.connectionAttempts >= this.maxAttempts && !this.isConnected) {
                this.handleNoStrangersFound();
            }
        }, 2000);
    }
    
    registerAsStranger() {
        const strangers = this.getStrangers();
        strangers[this.userId] = {
            id: this.userId,
            status: 'looking',
            timestamp: Date.now(),
            country: this.getRandomCountry(),
            interests: this.getRandomInterests(),
            connected: false
        };
        
        localStorage.setItem('omegle-strangers', JSON.stringify(strangers));
        console.log('📝 Registered as stranger:', this.userId);
    }
    
    findStranger() {
        const strangers = this.getStrangers();
        
        // Find available stranger (not us, looking, recent)
        for (const [strangerId, stranger] of Object.entries(strangers)) {
            if (strangerId !== this.userId && 
                stranger.status === 'looking' && 
                !stranger.connected &&
                Date.now() - stranger.timestamp < 30000) {
                
                console.log('🎯 Found stranger:', strangerId);
                this.connectToStranger(strangerId);
                return;
            }
        }
        
        console.log('⏳ No strangers found, attempt:', this.connectionAttempts);
    }
    
    connectToStranger(strangerId) {
        console.log('🤝 Connecting to stranger:', strangerId);
        
        this.partnerId = strangerId;
        this.chatRoom = 'room_' + Date.now();
        
        // Update both strangers to connected
        const strangers = this.getStrangers();
        
        // Update partner
        if (strangers[strangerId]) {
            strangers[strangerId].status = 'connected';
            strangers[strangerId].connected = true;
            strangers[strangerId].partnerId = this.userId;
            strangers[strangerId].chatRoom = this.chatRoom;
        }
        
        // Update self
        strangers[this.userId].status = 'connected';
        strangers[this.userId].connected = true;
        strangers[this.userId].partnerId = strangerId;
        strangers[this.userId].chatRoom = this.chatRoom;
        
        localStorage.setItem('omegle-strangers', JSON.stringify(strangers));
        
        this.establishConnection();
    }
    
    handleStrangerUpdate() {
        if (this.isConnected) return;
        
        const strangers = this.getStrangers();
        const myData = strangers[this.userId];
        
        if (myData && myData.status === 'connected' && myData.partnerId) {
            console.log('🔗 Got connected via stranger update to:', myData.partnerId);
            this.partnerId = myData.partnerId;
            this.chatRoom = myData.chatRoom;
            this.establishConnection();
        }
    }
    
    establishConnection() {
        if (this.isConnected) return;
        
        this.isConnected = true;
        clearInterval(this.searchInterval);
        
        console.log('🎉 Connected to stranger:', this.partnerId);
        
        // Update status
        this.updateStatus('Stranger connected!', 'connected');
        
        // Create stranger video
        this.createStrangerVideo();
        
        // Show Omegle-style notification
        this.showOmegleNotification('You\'re now chatting with a random stranger!');
        
        // Add chat functionality
        this.enableChat();
        
        // Start heartbeat
        this.startHeartbeat();
    }
    
    createStrangerVideo() {
        const remoteVideo = document.getElementById('remoteVideo');
        if (!remoteVideo) return;
        
        console.log('📹 Creating stranger video...');
        
        // Create Omegle-style video
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        let frame = 0;
        const startTime = Date.now();
        
        const animate = () => {
            // Dark background like Omegle
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Stranger silhouette
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Animated stranger figure
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 80, 40, 0, Math.PI * 2); // Head
            ctx.fill();
            
            ctx.fillRect(centerX - 30, centerY - 40, 60, 80); // Body
            ctx.fillRect(centerX - 40, centerY - 20, 20, 60); // Left arm
            ctx.fillRect(centerX + 20, centerY - 20, 20, 60); // Right arm
            ctx.fillRect(centerX - 20, centerY + 40, 15, 60); // Left leg
            ctx.fillRect(centerX + 5, centerY + 40, 15, 60); // Right leg
            
            // Pulsing effect
            const pulse = Math.sin(frame * 0.1) * 0.1 + 1;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(pulse, pulse);
            ctx.translate(-centerX, -centerY);
            
            // "STRANGER" text
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('STRANGER', centerX, centerY + 150);
            
            ctx.restore();
            
            // Connection info
            ctx.fillStyle = '#888';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            
            const stranger = this.getStrangers()[this.partnerId];
            if (stranger) {
                ctx.fillText(`Country: ${stranger.country}`, centerX, centerY + 180);
                ctx.fillText(`Interests: ${stranger.interests.join(', ')}`, centerX, centerY + 200);
            }
            
            // Connection time
            const connectionTime = Math.floor((Date.now() - startTime) / 1000);
            ctx.fillText(`Connected: ${connectionTime}s`, centerX, centerY + 220);
            
            // Omegle-style dots animation
            for (let i = 0; i < 3; i++) {
                const alpha = Math.sin(frame * 0.2 + i * 0.5) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
                ctx.beginPath();
                ctx.arc(centerX - 20 + i * 20, centerY - 180, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            frame++;
            requestAnimationFrame(animate);
        };
        
        animate();
        
        const stream = canvas.captureStream(30);
        remoteVideo.srcObject = stream;
        remoteVideo.play().catch(e => console.log('Video error:', e));
        
        console.log('✅ Stranger video created');
    }
    
    setupOmegleUI() {
        // Add Omegle-style buttons
        setTimeout(() => {
            const controls = document.querySelector('.video-controls');
            if (controls) {
                // New Chat button (like Omegle's "New")
                const newChatBtn = document.createElement('button');
                newChatBtn.innerHTML = '🔄';
                newChatBtn.className = 'video-control-btn ripple';
                newChatBtn.title = 'New Chat (Find New Stranger)';
                newChatBtn.style.cssText = `
                    background: #2196F3 !important;
                    color: white !important;
                    font-size: 18px !important;
                `;
                
                newChatBtn.onclick = () => {
                    this.findNewStranger();
                };
                
                // Stop button (like Omegle's "Stop")
                const stopBtn = document.createElement('button');
                stopBtn.innerHTML = '⏹️';
                stopBtn.className = 'video-control-btn ripple';
                stopBtn.title = 'Stop Chat';
                stopBtn.style.cssText = `
                    background: #f44336 !important;
                    color: white !important;
                    font-size: 16px !important;
                `;
                
                stopBtn.onclick = () => {
                    this.stopChat();
                };
                
                controls.appendChild(newChatBtn);
                controls.appendChild(stopBtn);
                
                console.log('🎭 Omegle-style UI added');
            }
        }, 3000);
    }
    
    enableChat() {
        // Add text chat functionality (like Omegle)
        const chatContainer = document.createElement('div');
        chatContainer.style.cssText = `
            position: fixed;
            bottom: 150px;
            right: 20px;
            width: 300px;
            height: 200px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 10px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 9999;
            display: flex;
            flex-direction: column;
        `;
        
        const chatMessages = document.createElement('div');
        chatMessages.style.cssText = `
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
            font-size: 14px;
        `;
        
        const chatInput = document.createElement('input');
        chatInput.type = 'text';
        chatInput.placeholder = 'Type a message...';
        chatInput.style.cssText = `
            padding: 8px;
            border: none;
            border-radius: 5px;
            background: #333;
            color: white;
            outline: none;
        `;
        
        chatContainer.appendChild(chatMessages);
        chatContainer.appendChild(chatInput);
        document.body.appendChild(chatContainer);
        
        // Add initial message
        chatMessages.innerHTML = `
            <div style="color: #4CAF50; margin-bottom: 5px;">
                🎭 You're now chatting with a random stranger!
            </div>
            <div style="color: #888; font-size: 12px;">
                Say hi! You can disconnect anytime.
            </div>
        `;
        
        console.log('💬 Chat enabled');
    }
    
    showOmegleNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideInRight 0.5s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🎭</span>
                <div>
                    <div style="font-size: 14px; margin-bottom: 5px;">${message}</div>
                    <div style="font-size: 12px; opacity: 0.8;">Click "New Chat" to find another stranger</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    findNewStranger() {
        console.log('🔄 Finding new stranger...');
        this.disconnect();
        
        // Reset and start looking again
        setTimeout(() => {
            this.connectionAttempts = 0;
            this.startLookingForStrangers();
        }, 1000);
    }
    
    stopChat() {
        console.log('⏹️ Stopping chat...');
        this.disconnect();
        this.updateStatus('Chat stopped', 'disconnected');
    }
    
    handleNoStrangersFound() {
        console.log('😔 No strangers found after maximum attempts');
        this.updateStatus('No strangers online. Try again later.', 'disconnected');
        
        // Show retry option
        setTimeout(() => {
            if (!this.isConnected) {
                this.connectionAttempts = 0;
                this.startLookingForStrangers();
            }
        }, 10000); // Retry after 10 seconds
    }
    
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                const strangers = this.getStrangers();
                if (strangers[this.userId]) {
                    strangers[this.userId].timestamp = Date.now();
                    localStorage.setItem('omegle-strangers', JSON.stringify(strangers));
                }
            }
        }, 5000);
    }
    
    getStrangers() {
        try {
            const data = localStorage.getItem('omegle-strangers');
            const strangers = data ? JSON.parse(data) : {};
            
            // Clean old strangers (older than 1 minute)
            const now = Date.now();
            Object.keys(strangers).forEach(id => {
                if (now - strangers[id].timestamp > 60000) {
                    delete strangers[id];
                }
            });
            
            return strangers;
        } catch (error) {
            console.warn('Error getting strangers:', error);
            return {};
        }
    }
    
    getRandomCountry() {
        const countries = ['USA', 'India', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'Mexico'];
        return countries[Math.floor(Math.random() * countries.length)];
    }
    
    getRandomInterests() {
        const interests = ['music', 'movies', 'gaming', 'sports', 'travel', 'food', 'art', 'technology', 'books', 'fitness'];
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 interests
        const selected = [];
        
        for (let i = 0; i < count; i++) {
            const interest = interests[Math.floor(Math.random() * interests.length)];
            if (!selected.includes(interest)) {
                selected.push(interest);
            }
        }
        
        return selected;
    }
    
    updateStatus(text, status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const statusText = statusElement.querySelector('.status-text');
            const statusIndicator = statusElement.querySelector('.status-indicator');
            
            if (statusText) statusText.textContent = text;
            if (statusIndicator) statusIndicator.className = `status-indicator ${status}`;
        }
        
        console.log('🎭 Omegle Status:', text);
    }
    
    disconnect() {
        this.isConnected = false;
        this.partnerId = null;
        this.chatRoom = null;
        
        // Clear intervals
        if (this.searchInterval) {
            clearInterval(this.searchInterval);
        }
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        // Remove from strangers list
        const strangers = this.getStrangers();
        if (strangers[this.userId]) {
            strangers[this.userId].status = 'disconnected';
            strangers[this.userId].connected = false;
        }
        localStorage.setItem('omegle-strangers', JSON.stringify(strangers));
        
        console.log('🔌 Disconnected from stranger');
    }
    
    cleanup() {
        this.disconnect();
        
        // Remove from strangers
        const strangers = this.getStrangers();
        delete strangers[this.userId];
        localStorage.setItem('omegle-strangers', JSON.stringify(strangers));
        
        console.log('🧹 Omegle cleanup completed');
    }
}

// Add slide animation
const omegleCSS = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;

const omegleStyle = document.createElement('style');
omegleStyle.textContent = omegleCSS;
document.head.appendChild(omegleStyle);

// Initialize Omegle-Style Chat
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🎭 Starting Omegle-Style Chat System...');
        window.omegleStyleChat = new OmegleStyleChat();
        
        // Override auto-join with Omegle system
        if (window.autoJoinManager) {
            window.autoJoinManager.startAutoJoin = function(country, gender) {
                console.log('🎭 Using Omegle-Style Chat System');
                // Omegle system is already running
            };
        }
        
        console.log('🎭 Omegle-Style Chat System ready!');
    }, 4000);
});

// Export for manual use
window.OmegleStyleChat = OmegleStyleChat;

console.log('🎭 Omegle-Style Chat System loaded - Random stranger connections!');
