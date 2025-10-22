// Cross-Tab Connection System - Connect multiple browser tabs/windows
console.log('🔗 Cross-Tab Connection System loaded');

class CrossTabConnection {
    constructor() {
        this.sessionId = 'saathi_' + Math.random().toString(36).substr(2, 9);
        this.isConnected = false;
        this.partnerId = null;
        this.channel = null;
        this.heartbeatInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Cross-Tab Connection with ID:', this.sessionId);
        
        // Use BroadcastChannel for cross-tab communication
        this.setupBroadcastChannel();
        
        // Use localStorage for persistent session tracking
        this.setupLocalStorage();
        
        // Register this session
        this.registerSession();
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Listen for page unload to cleanup
        window.addEventListener('beforeunload', () => this.cleanup());
    }
    
    setupBroadcastChannel() {
        try {
            this.channel = new BroadcastChannel('saathi-tv-connection');
            
            this.channel.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            console.log('✅ BroadcastChannel setup complete');
        } catch (error) {
            console.warn('⚠️ BroadcastChannel not supported, using localStorage fallback');
            this.setupLocalStorageFallback();
        }
    }
    
    setupLocalStorage() {
        // Listen for localStorage changes (cross-tab communication)
        window.addEventListener('storage', (e) => {
            if (e.key === 'saathi-tv-messages') {
                try {
                    const message = JSON.parse(e.newValue);
                    if (message && message.to === this.sessionId) {
                        this.handleMessage(message);
                    }
                } catch (error) {
                    console.warn('Error parsing localStorage message:', error);
                }
            }
        });
    }
    
    setupLocalStorageFallback() {
        // Fallback polling for older browsers
        setInterval(() => {
            const messages = this.getStoredMessages();
            messages.forEach(message => {
                if (message.to === this.sessionId && !message.processed) {
                    this.handleMessage(message);
                    message.processed = true;
                    this.updateStoredMessages(messages);
                }
            });
        }, 1000);
    }
    
    registerSession() {
        const sessions = this.getActiveSessions();
        sessions[this.sessionId] = {
            id: this.sessionId,
            timestamp: Date.now(),
            status: 'looking',
            partnerId: null
        };
        
        localStorage.setItem('saathi-tv-sessions', JSON.stringify(sessions));
        console.log('📝 Session registered:', this.sessionId);
    }
    
    getActiveSessions() {
        try {
            const stored = localStorage.getItem('saathi-tv-sessions');
            const sessions = stored ? JSON.parse(stored) : {};
            
            // Clean up old sessions (older than 30 seconds)
            const now = Date.now();
            Object.keys(sessions).forEach(id => {
                if (now - sessions[id].timestamp > 30000) {
                    delete sessions[id];
                }
            });
            
            return sessions;
        } catch (error) {
            console.warn('Error getting sessions:', error);
            return {};
        }
    }
    
    findAvailablePartner() {
        const sessions = this.getActiveSessions();
        
        // Find someone who is looking and not us
        for (const [id, session] of Object.entries(sessions)) {
            if (id !== this.sessionId && 
                session.status === 'looking' && 
                !session.partnerId) {
                
                console.log('🎯 Found available partner:', id);
                return id;
            }
        }
        
        return null;
    }
    
    startLookingForPartner() {
        console.log('🔍 Starting to look for partner...');
        
        // Update our status
        this.updateSessionStatus('looking');
        
        // Try to find partner immediately
        const partnerId = this.findAvailablePartner();
        
        if (partnerId) {
            this.initiateConnection(partnerId);
        } else {
            // Keep looking every 2 seconds
            const searchInterval = setInterval(() => {
                if (this.isConnected) {
                    clearInterval(searchInterval);
                    return;
                }
                
                const partner = this.findAvailablePartner();
                if (partner) {
                    clearInterval(searchInterval);
                    this.initiateConnection(partner);
                }
            }, 2000);
            
            // Stop searching after 30 seconds
            setTimeout(() => {
                clearInterval(searchInterval);
                if (!this.isConnected) {
                    console.log('⏰ Search timeout, no partner found');
                    this.updateStatus('No one online. Keep trying...', 'connecting');
                }
            }, 30000);
        }
    }
    
    initiateConnection(partnerId) {
        console.log('🤝 Initiating connection with:', partnerId);
        
        this.partnerId = partnerId;
        this.updateSessionStatus('connecting', partnerId);
        
        // Send connection request
        this.sendMessage(partnerId, {
            type: 'connection_request',
            from: this.sessionId,
            timestamp: Date.now()
        });
        
        this.updateStatus('Connecting...', 'connecting');
    }
    
    handleMessage(message) {
        console.log('📨 Received message:', message);
        
        switch (message.type) {
            case 'connection_request':
                this.handleConnectionRequest(message);
                break;
                
            case 'connection_accept':
                this.handleConnectionAccept(message);
                break;
                
            case 'connection_established':
                this.handleConnectionEstablished(message);
                break;
                
            case 'heartbeat':
                this.handleHeartbeat(message);
                break;
                
            case 'disconnect':
                this.handleDisconnect(message);
                break;
        }
    }
    
    handleConnectionRequest(message) {
        if (this.isConnected) {
            // Already connected, reject
            this.sendMessage(message.from, {
                type: 'connection_reject',
                from: this.sessionId,
                reason: 'already_connected'
            });
            return;
        }
        
        console.log('✅ Accepting connection from:', message.from);
        
        this.partnerId = message.from;
        this.updateSessionStatus('connected', message.from);
        
        // Send acceptance
        this.sendMessage(message.from, {
            type: 'connection_accept',
            from: this.sessionId,
            timestamp: Date.now()
        });
        
        // Establish connection
        this.establishConnection();
    }
    
    handleConnectionAccept(message) {
        console.log('🎉 Connection accepted by:', message.from);
        
        this.updateSessionStatus('connected', message.from);
        
        // Send establishment confirmation
        this.sendMessage(message.from, {
            type: 'connection_established',
            from: this.sessionId,
            timestamp: Date.now()
        });
        
        this.establishConnection();
    }
    
    handleConnectionEstablished(message) {
        console.log('🔗 Connection fully established with:', message.from);
        this.establishConnection();
    }
    
    establishConnection() {
        if (this.isConnected) return;
        
        this.isConnected = true;
        
        console.log('🎊 Connection established with partner:', this.partnerId);
        
        // Update UI
        this.updateStatus('Connected!', 'connected');
        
        // Show success notification
        if (window.autoJoinManager) {
            window.autoJoinManager.showNotification('Connected to another user!', 'success');
        }
        
        // Create fake remote video for the partner
        this.createPartnerVideo();
        
        // Start sending heartbeats
        this.startPartnerHeartbeat();
    }
    
    createPartnerVideo() {
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo && window.autoJoinManager) {
            // Use the existing fake video creation from auto-join manager
            window.autoJoinManager.createFakeRemoteVideo();
            console.log('📹 Partner video stream created');
        }
    }
    
    startPartnerHeartbeat() {
        // Send heartbeat every 5 seconds
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected && this.partnerId) {
                this.sendMessage(this.partnerId, {
                    type: 'heartbeat',
                    from: this.sessionId,
                    timestamp: Date.now()
                });
            }
        }, 5000);
    }
    
    handleHeartbeat(message) {
        // Update partner's last seen time
        const sessions = this.getActiveSessions();
        if (sessions[message.from]) {
            sessions[message.from].timestamp = Date.now();
            localStorage.setItem('saathi-tv-sessions', JSON.stringify(sessions));
        }
    }
    
    handleDisconnect(message) {
        console.log('💔 Partner disconnected:', message.from);
        this.disconnect();
    }
    
    disconnect() {
        if (this.partnerId) {
            // Notify partner
            this.sendMessage(this.partnerId, {
                type: 'disconnect',
                from: this.sessionId,
                timestamp: Date.now()
            });
        }
        
        this.isConnected = false;
        this.partnerId = null;
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        // Update status
        this.updateStatus('Disconnected', 'disconnected');
        
        // Clear heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        // Update session status
        this.updateSessionStatus('looking');
        
        console.log('🔄 Disconnected, ready for new connection');
    }
    
    sendMessage(to, message) {
        message.to = to;
        message.timestamp = message.timestamp || Date.now();
        
        if (this.channel) {
            // Use BroadcastChannel
            this.channel.postMessage(message);
        } else {
            // Use localStorage fallback
            const messages = this.getStoredMessages();
            messages.push(message);
            localStorage.setItem('saathi-tv-messages', JSON.stringify(messages));
        }
        
        console.log('📤 Sent message to', to, ':', message.type);
    }
    
    getStoredMessages() {
        try {
            const stored = localStorage.getItem('saathi-tv-messages');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }
    
    updateStoredMessages(messages) {
        localStorage.setItem('saathi-tv-messages', JSON.stringify(messages));
    }
    
    updateSessionStatus(status, partnerId = null) {
        const sessions = this.getActiveSessions();
        if (sessions[this.sessionId]) {
            sessions[this.sessionId].status = status;
            sessions[this.sessionId].partnerId = partnerId;
            sessions[this.sessionId].timestamp = Date.now();
            
            localStorage.setItem('saathi-tv-sessions', JSON.stringify(sessions));
        }
    }
    
    startHeartbeat() {
        // Update our session every 10 seconds
        setInterval(() => {
            this.updateSessionStatus(
                this.isConnected ? 'connected' : 'looking',
                this.partnerId
            );
        }, 10000);
    }
    
    updateStatus(text, status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const statusText = statusElement.querySelector('.status-text');
            const statusIndicator = statusElement.querySelector('.status-indicator');
            
            if (statusText) statusText.textContent = text;
            if (statusIndicator) statusIndicator.className = `status-indicator ${status}`;
        }
        
        console.log('📊 Status updated:', text, '(' + status + ')');
    }
    
    cleanup() {
        console.log('🧹 Cleaning up session:', this.sessionId);
        
        // Disconnect from partner
        if (this.isConnected) {
            this.disconnect();
        }
        
        // Remove our session
        const sessions = this.getActiveSessions();
        delete sessions[this.sessionId];
        localStorage.setItem('saathi-tv-sessions', JSON.stringify(sessions));
        
        // Close broadcast channel
        if (this.channel) {
            this.channel.close();
        }
        
        // Clear intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
    
    // Public method to start looking for partner
    startSearching() {
        console.log('🔍 User requested to start searching...');
        this.startLookingForPartner();
    }
    
    // Public method to disconnect
    disconnectFromPartner() {
        console.log('🔌 User requested disconnect...');
        this.disconnect();
    }
    
    // Public method to find next partner
    findNextPartner() {
        console.log('⏭️ User requested next partner...');
        this.disconnect();
        setTimeout(() => {
            this.startLookingForPartner();
        }, 1000);
    }
}

// Initialize Cross-Tab Connection
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        console.log('🔗 Initializing Cross-Tab Connection...');
        window.crossTabConnection = new CrossTabConnection();
        
        // Integrate with auto-join manager
        setTimeout(() => {
            if (window.autoJoinManager) {
                console.log('🔄 Integrating with Auto-Join Manager...');
                
                // Override the auto-join search with cross-tab connection
                const originalStartAutoJoin = window.autoJoinManager.startAutoJoin;
                window.autoJoinManager.startAutoJoin = function(country, gender) {
                    console.log('🔄 Using cross-tab connection instead of mock auto-join');
                    if (window.crossTabConnection) {
                        window.crossTabConnection.startSearching();
                    } else {
                        console.warn('⚠️ Cross-tab connection not available, using original');
                        originalStartAutoJoin.call(this, country, gender);
                    }
                };
                
                // Override next user function
                const originalFindNextUser = window.autoJoinManager.findNextUser;
                window.autoJoinManager.findNextUser = function() {
                    console.log('⏭️ Using cross-tab next user');
                    if (window.crossTabConnection) {
                        window.crossTabConnection.findNextPartner();
                    } else {
                        console.warn('⚠️ Cross-tab connection not available, using original');
                        originalFindNextUser.call(this);
                    }
                };
                
                console.log('✅ Cross-tab integration complete');
            } else {
                console.warn('⚠️ Auto-Join Manager not found for integration');
            }
        }, 500);
    }, 1000);
});

// Export for global access
window.CrossTabConnection = CrossTabConnection;

console.log('🔗 Cross-Tab Connection System ready - multiple tabs can now connect!');
