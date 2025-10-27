// Complete Connection Fix - Handles Socket and Login Issues
console.log('🔧 Complete Connection Fix Loading...');

class CompleteConnectionFix {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Complete Connection Fix...');
        
        // Fix port issues first
        this.handlePortRedirection();
        
        // Then establish socket connection
        this.establishSocketConnection();
        
        // Fix login authorization
        this.fixLoginAuthorization();
        
        // Override global functions
        this.overrideGlobalFunctions();
    }
    
    handlePortRedirection() {
        const currentPort = window.location.port;
        const currentHost = window.location.hostname;
        
        // If accessing port 3000, redirect to 3001 where server is running
        if (currentPort === '3000' && (currentHost === 'localhost' || currentHost === '127.0.0.1')) {
            console.log('🔄 Redirecting from port 3000 to 3001...');
            const newUrl = window.location.href.replace(':3000', ':3001');
            window.location.href = newUrl;
            return;
        }
        
        console.log(`✅ Running on correct port: ${currentPort || '3001'}`);
    }
    
    establishSocketConnection() {
        console.log('🔌 Establishing socket connection...');
        
        const connectSocket = () => {
            // Try existing socket first
            if (window.saathiTV && window.saathiTV.socket && window.saathiTV.socket.connected) {
                this.socket = window.saathiTV.socket;
                this.isConnected = true;
                console.log('✅ Using existing saathiTV socket');
                this.setupSocketHandlers();
                return;
            }
            
            if (window.ultraSimpleFix && window.ultraSimpleFix.socket && window.ultraSimpleFix.socket.connected) {
                this.socket = window.ultraSimpleFix.socket;
                this.isConnected = true;
                console.log('✅ Using existing ultraSimpleFix socket');
                this.setupSocketHandlers();
                return;
            }
            
            // Create new socket connection
            if (window.io) {
                try {
                    const serverUrl = `http://localhost:3001`;
                    console.log(`🔗 Connecting to ${serverUrl}...`);
                    
                    this.socket = window.io(serverUrl, {
                        transports: ['websocket', 'polling'],
                        timeout: 10000,
                        forceNew: false,
                        reconnection: true,
                        reconnectionAttempts: this.maxReconnectAttempts,
                        reconnectionDelay: this.reconnectDelay
                    });
                    
                    this.setupSocketEvents();
                    
                } catch (error) {
                    console.error('❌ Failed to create socket:', error);
                    this.scheduleReconnect();
                }
            } else {
                console.error('❌ Socket.io not available');
                this.scheduleReconnect();
            }
        };
        
        connectSocket();
    }
    
    setupSocketEvents() {
        if (!this.socket) return;
        
        this.socket.on('connect', () => {
            console.log('✅ Socket connected successfully!');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.setupSocketHandlers();
            this.updateConnectionStatus('Connected', 'connected');
        });
        
        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            this.isConnected = false;
            this.updateConnectionStatus('Disconnected', 'disconnected');
            
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.scheduleReconnect();
            }
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.isConnected = false;
            this.updateConnectionStatus('Connection Error', 'disconnected');
            this.scheduleReconnect();
        });
        
        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('Reconnected', 'connected');
        });
        
        this.socket.on('reconnect_error', (error) => {
            console.error('❌ Socket reconnection error:', error);
            this.scheduleReconnect();
        });
    }
    
    setupSocketHandlers() {
        if (!this.socket) return;
        
        // Make socket available globally
        if (window.saathiTV) {
            window.saathiTV.socket = this.socket;
            window.saathiTV.isConnected = this.isConnected;
        }
        
        if (window.unifiedWebRTC) {
            window.unifiedWebRTC.socket = this.socket;
        }
        
        console.log('🔗 Socket handlers set up successfully');
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            this.updateConnectionStatus('Connection Failed', 'disconnected');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        
        console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms...`);
        this.updateConnectionStatus(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'connecting');
        
        setTimeout(() => {
            this.establishSocketConnection();
        }, delay);
    }
    
    fixLoginAuthorization() {
        console.log('🔐 Fixing login authorization...');
        
        // Override Firebase auth for localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            // Create mock Firebase auth for localhost
            window.mockFirebaseAuth = {
                currentUser: null,
                signInWithEmailAndPassword: (email, password) => {
                    return Promise.resolve({
                        user: {
                            uid: 'mock-user-' + Date.now(),
                            email: email,
                            displayName: email.split('@')[0]
                        }
                    });
                },
                signInWithPopup: (provider) => {
                    return Promise.resolve({
                        user: {
                            uid: 'mock-google-user-' + Date.now(),
                            email: 'user@gmail.com',
                            displayName: 'Google User'
                        }
                    });
                },
                signOut: () => {
                    this.currentUser = null;
                    return Promise.resolve();
                },
                onAuthStateChanged: (callback) => {
                    // Mock auth state change
                    setTimeout(() => callback(this.currentUser), 100);
                }
            };
            
            // Replace Firebase auth with mock for localhost
            if (window.firebase && window.firebase.auth) {
                const originalAuth = window.firebase.auth;
                window.firebase.auth = () => window.mockFirebaseAuth;
                console.log('🔧 Using mock Firebase auth for localhost');
            }
        }
    }
    
    overrideGlobalFunctions() {
        // Ensure global functions work properly
        const self = this; // Store reference to this
        window.startVideoChat = function() {
            console.log('🎥 Starting video chat via connection fix...');
            
            if (!self.isConnected) {
                console.log('🔌 Socket not connected, attempting to connect...');
                self.establishSocketConnection();
                
                // Wait for connection then start
                const waitForConnection = () => {
                    if (self.isConnected) {
                        self.startVideoChat();
                    } else {
                        setTimeout(waitForConnection, 1000);
                    }
                };
                waitForConnection();
                return;
            }
            
            self.startVideoChat();
        };
        
        window.handleStartWebChat = window.startVideoChat;
        
        console.log('✅ Global functions overridden');
    }
    
    startVideoChat() {
        if (window.unifiedWebRTC && typeof window.unifiedWebRTC.startVideoChat === 'function') {
            window.unifiedWebRTC.startVideoChat();
        } else {
            console.error('❌ Unified WebRTC system not available');
            this.showError('WebRTC system not ready. Please refresh the page.');
        }
    }
    
    updateConnectionStatus(message, status) {
        console.log(`📊 Connection Status: ${message} (${status})`);
        
        // Update debug panel if available
        const debugSocket = document.getElementById('debugSocket');
        if (debugSocket) {
            debugSocket.textContent = status === 'connected' ? 'Connected' : 
                                     status === 'connecting' ? 'Connecting...' : 'Disconnected';
            debugSocket.style.color = status === 'connected' ? '#4CAF50' : 
                                     status === 'connecting' ? '#FF9800' : '#f44336';
        }
        
        // Update main status if available
        if (window.saathiTV && typeof window.saathiTV.updateConnectionStatus === 'function') {
            window.saathiTV.updateConnectionStatus(message, status);
        }
    }
    
    showError(message) {
        console.error('❌', message);
        
        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Public methods
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            socket: this.socket,
            reconnectAttempts: this.reconnectAttempts
        };
    }
    
    forceReconnect() {
        console.log('🔄 Force reconnecting...');
        this.reconnectAttempts = 0;
        if (this.socket) {
            this.socket.disconnect();
        }
        setTimeout(() => {
            this.establishSocketConnection();
        }, 1000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Complete Connection Fix...');
    window.completeConnectionFix = new CompleteConnectionFix();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    console.log('🚀 Starting Complete Connection Fix (DOM already loaded)...');
    window.completeConnectionFix = new CompleteConnectionFix();
}

console.log('✅ Complete Connection Fix Loaded');
