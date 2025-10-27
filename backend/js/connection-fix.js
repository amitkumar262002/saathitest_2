// Complete Connection Fix for Saathi TV
// Fixes Google Login and WebRTC Remote Video Connection Issues

class SaathiConnectionManager {
    constructor() {
        this.socket = null;
        this.webrtcManager = null;
        this.authManager = null;
        this.isConnected = false;
        this.currentRoom = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        
        // WebRTC Configuration with multiple STUN servers
        this.rtcConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun.services.mozilla.com' },
                { urls: 'stun:stun.stunprotocol.org:3478' }
            ],
            iceCandidatePoolSize: 10
        };
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Saathi Connection Manager...');
        
        try {
            // Initialize Socket.io connection
            await this.initializeSocket();
            
            // Initialize Firebase Auth (if available)
            await this.initializeAuth();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Connection Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Connection Manager:', error);
            this.showError('Failed to initialize connection system');
        }
    }

    async initializeSocket() {
        return new Promise((resolve, reject) => {
            try {
                // Check if Socket.io is available
                if (typeof io === 'undefined') {
                    console.warn('⚠️ Socket.io not loaded, loading from CDN...');
                    this.loadSocketIO().then(() => {
                        this.createSocketConnection();
                        resolve();
                    });
                } else {
                    this.createSocketConnection();
                    resolve();
                }
            } catch (error) {
                console.error('❌ Socket initialization error:', error);
                reject(error);
            }
        });
    }

    loadSocketIO() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';
            script.onload = resolve;
            script.onerror = () => {
                // Fallback to CDN
                const cdnScript = document.createElement('script');
                cdnScript.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
                cdnScript.onload = resolve;
                cdnScript.onerror = reject;
                document.head.appendChild(cdnScript);
            };
            document.head.appendChild(script);
        });
    }

    createSocketConnection() {
        try {
            this.socket = io({
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('📡 Socket connected:', this.socket.id);
                this.isConnected = true;
                this.updateConnectionStatus('Connected', 'success');
            });

            this.socket.on('disconnect', (reason) => {
                console.log('📡 Socket disconnected:', reason);
                this.isConnected = false;
                this.updateConnectionStatus('Disconnected', 'error');
            });

            this.socket.on('connect_error', (error) => {
                console.error('📡 Socket connection error:', error);
                this.updateConnectionStatus('Connection Error', 'error');
            });

            // WebRTC signaling events
            this.setupWebRTCSignaling();

        } catch (error) {
            console.error('❌ Error creating socket connection:', error);
        }
    }

    setupWebRTCSignaling() {
        if (!this.socket) return;

        this.socket.on('offer', async (data) => {
            console.log('📞 Received offer');
            await this.handleOffer(data);
        });

        this.socket.on('answer', async (data) => {
            console.log('📞 Received answer');
            await this.handleAnswer(data);
        });

        this.socket.on('ice-candidate', async (data) => {
            console.log('🧊 Received ICE candidate');
            await this.handleIceCandidate(data);
        });

        this.socket.on('user-joined', (data) => {
            console.log('👤 User joined room:', data);
            this.handleUserJoined(data);
        });

        this.socket.on('user-left', () => {
            console.log('👤 User left room');
            this.handleUserLeft();
        });

        this.socket.on('room-full', () => {
            console.log('🏠 Room is full');
            this.showError('Room is full. Please try again.');
        });
    }

    async initializeAuth() {
        try {
            // Check if Firebase is available
            if (typeof firebase !== 'undefined' || window.firebaseAuth) {
                console.log('🔐 Firebase Auth available');
                this.authManager = window.firebaseAuth || firebase.auth();
            } else {
                console.log('🔐 Using secure login system');
                this.authManager = window.secureLogin;
            }
        } catch (error) {
            console.error('❌ Auth initialization error:', error);
        }
    }

    setupEventListeners() {
        // Google Login Button
        const googleBtn = document.getElementById('googleLogin');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGoogleLogin();
            });
            console.log('✅ Google login button connected');
        }

        // Start Video Chat Button
        const startBtn = document.querySelector('.start-btn, #startVideoChat');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startVideoChat();
            });
        }

        // Camera/Mic controls
        this.setupMediaControls();
    }

    async handleGoogleLogin() {
        try {
            console.log('🔐 Starting Google login...');
            this.showLoadingState('Signing in with Google...');

            // Check age confirmation first
            const ageConfirm = document.getElementById('ageConfirm');
            if (ageConfirm && !ageConfirm.checked) {
                this.showError('Please confirm that you are at least 18 years old.');
                return;
            }

            let result;

            // Try Firebase Auth first
            if (window.firebaseAuth && typeof window.firebaseAuth.signInWithGoogle === 'function') {
                result = await window.firebaseAuth.signInWithGoogle();
            } 
            // Fallback to secure login system
            else if (window.secureLogin && typeof window.secureLogin.socialLogin === 'function') {
                result = await window.secureLogin.socialLogin('google');
            }
            // Last resort - mock login for demo
            else {
                result = await this.mockGoogleLogin();
            }

            if (result && result.success !== false) {
                this.showSuccess('Google login successful! Redirecting...');
                setTimeout(() => {
                    this.redirectToVideoChat();
                }, 2000);
            } else {
                throw new Error(result?.error || 'Login failed');
            }

        } catch (error) {
            console.error('❌ Google login error:', error);
            this.showError('Google login failed: ' + error.message);
        } finally {
            this.hideLoadingState();
        }
    }

    async mockGoogleLogin() {
        return new Promise((resolve) => {
            const confirmed = confirm('Login with Google?\n\nThis is a demo login - click OK to proceed.');
            
            if (confirmed) {
                setTimeout(() => {
                    const user = {
                        id: 'google_' + Date.now(),
                        name: 'Google User',
                        email: 'user@gmail.com',
                        avatar: '👤',
                        loginMethod: 'google'
                    };
                    
                    // Save to localStorage
                    localStorage.setItem('saathi_current_user', JSON.stringify(user));
                    
                    resolve({ success: true, user });
                }, 1000);
            } else {
                resolve({ success: false, error: 'User cancelled login' });
            }
        });
    }

    async startVideoChat() {
        try {
            console.log('🎥 Starting video chat...');
            
            // Check if user is logged in
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                this.showError('Please login first to start video chat');
                return;
            }

            // Request media permissions
            await this.setupMediaDevices();
            
            // Join a room
            await this.joinRoom();
            
            console.log('✅ Video chat started successfully');
            
        } catch (error) {
            console.error('❌ Error starting video chat:', error);
            this.showError('Failed to start video chat: ' + error.message);
        }
    }

    async setupMediaDevices() {
        try {
            console.log('🎥 Setting up media devices...');
            
            // Check for available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(device => device.kind === 'videoinput');
            const hasAudio = devices.some(device => device.kind === 'audioinput');
            
            console.log(`📹 Video: ${hasVideo ? 'Available' : 'Not found'}`);
            console.log(`🎤 Audio: ${hasAudio ? 'Available' : 'Not found'}`);

            // Get user media
            const constraints = {
                video: hasVideo ? {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }
                } : false,
                audio: hasAudio ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Display local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
                localVideo.muted = true; // Prevent echo
                console.log('✅ Local video stream connected');
            }

            this.updateConnectionStatus('Camera and microphone ready', 'success');
            
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            this.handleMediaError(error);
        }
    }

    async joinRoom() {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        // Generate or get room ID
        this.currentRoom = this.generateRoomId();
        
        console.log('🏠 Joining room:', this.currentRoom);
        
        // Join room via socket
        this.socket.emit('join-room', {
            roomId: this.currentRoom,
            user: this.getCurrentUser()
        });

        // Create peer connection
        await this.createPeerConnection();
    }

    async createPeerConnection() {
        try {
            console.log('🔗 Creating peer connection...');
            
            this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

            // Add local stream to peer connection
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection.addTrack(track, this.localStream);
                });
                console.log('✅ Local stream added to peer connection');
            }

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                console.log('📡 Received remote stream');
                this.remoteStream = event.streams[0];
                
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) {
                    remoteVideo.srcObject = this.remoteStream;
                    console.log('✅ Remote video stream connected');
                    this.updateConnectionStatus('Connected to peer', 'success');
                } else {
                    console.error('❌ Remote video element not found');
                }
            };

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.socket) {
                    console.log('🧊 Sending ICE candidate');
                    this.socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        roomId: this.currentRoom
                    });
                }
            };

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection.connectionState;
                console.log('🔗 Connection state:', state);
                
                switch (state) {
                    case 'connected':
                        this.updateConnectionStatus('Connected', 'success');
                        break;
                    case 'disconnected':
                        this.updateConnectionStatus('Disconnected', 'warning');
                        break;
                    case 'failed':
                        this.updateConnectionStatus('Connection failed', 'error');
                        this.restartConnection();
                        break;
                }
            };

            // Handle ICE connection state
            this.peerConnection.oniceconnectionstatechange = () => {
                const state = this.peerConnection.iceConnectionState;
                console.log('🧊 ICE connection state:', state);
                
                if (state === 'failed' || state === 'disconnected') {
                    console.log('🔄 Attempting to restart ICE...');
                    this.peerConnection.restartIce();
                }
            };

            console.log('✅ Peer connection created successfully');
            
        } catch (error) {
            console.error('❌ Error creating peer connection:', error);
            throw error;
        }
    }

    async handleUserJoined(data) {
        console.log('👤 User joined, creating offer...');
        
        if (this.peerConnection) {
            try {
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                
                this.socket.emit('offer', {
                    offer: offer,
                    roomId: this.currentRoom
                });
                
                console.log('✅ Offer sent');
            } catch (error) {
                console.error('❌ Error creating offer:', error);
            }
        }
    }

    async handleOffer(data) {
        try {
            if (!this.peerConnection) {
                await this.createPeerConnection();
            }

            await this.peerConnection.setRemoteDescription(data.offer);
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            this.socket.emit('answer', {
                answer: answer,
                roomId: this.currentRoom
            });

            console.log('✅ Answer sent');
            
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }

    async handleAnswer(data) {
        try {
            if (this.peerConnection) {
                await this.peerConnection.setRemoteDescription(data.answer);
                console.log('✅ Answer handled');
            }
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    }

    async handleIceCandidate(data) {
        try {
            if (this.peerConnection && data.candidate) {
                await this.peerConnection.addIceCandidate(data.candidate);
                console.log('✅ ICE candidate added');
            }
        } catch (error) {
            console.error('❌ Error handling ICE candidate:', error);
        }
    }

    handleUserLeft() {
        console.log('👤 User left, cleaning up...');
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        this.updateConnectionStatus('Waiting for peer...', 'warning');
    }

    async restartConnection() {
        console.log('🔄 Restarting connection...');
        
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        // Wait a bit before restarting
        setTimeout(async () => {
            await this.createPeerConnection();
        }, 2000);
    }

    // Utility functions
    getCurrentUser() {
        const stored = localStorage.getItem('saathi_current_user');
        return stored ? JSON.parse(stored) : null;
    }

    generateRoomId() {
        return 'room_' + Math.random().toString(36).substr(2, 9);
    }

    redirectToVideoChat() {
        // Check if we're already on the main page
        if (window.location.pathname.includes('login')) {
            window.location.href = 'index.html#videoChat';
        } else {
            // Show video chat section
            const videoSection = document.getElementById('videoChat');
            if (videoSection) {
                videoSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    setupMediaControls() {
        // Mute/unmute buttons
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleAudio());
        }

        const videoBtn = document.getElementById('videoBtn');
        if (videoBtn) {
            videoBtn.addEventListener('click', () => this.toggleVideo());
        }
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                console.log('🎤 Audio:', audioTrack.enabled ? 'ON' : 'OFF');
            }
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                console.log('📹 Video:', videoTrack.enabled ? 'ON' : 'OFF');
            }
        }
    }

    handleMediaError(error) {
        let message = 'Failed to access camera/microphone. ';
        
        switch (error.name) {
            case 'NotAllowedError':
                message += 'Please allow camera and microphone permissions.';
                break;
            case 'NotFoundError':
                message += 'No camera or microphone found.';
                break;
            case 'NotReadableError':
                message += 'Camera or microphone is being used by another application.';
                break;
            default:
                message += error.message;
        }
        
        this.showError(message);
    }

    // UI Helper functions
    updateConnectionStatus(message, type = 'info') {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status ${type}`;
        }
        console.log(`📊 Status: ${message}`);
    }

    showLoadingState(message) {
        const googleBtn = document.getElementById('googleLogin');
        if (googleBtn) {
            googleBtn.disabled = true;
            googleBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
        }
    }

    hideLoadingState() {
        const googleBtn = document.getElementById('googleLogin');
        if (googleBtn) {
            googleBtn.disabled = false;
            googleBtn.innerHTML = '<i class="fab fa-google"></i> <span>Continue with Google</span>';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="notification-close">×</button>
            </div>
        `;
        
        // Add styles if not present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    min-width: 300px;
                    max-width: 400px;
                    border-left: 4px solid #007bff;
                }
                .notification.success { border-left-color: #28a745; }
                .notification.error { border-left-color: #dc3545; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    gap: 10px;
                }
                .notification-content i {
                    font-size: 18px;
                    color: #007bff;
                }
                .notification.success i { color: #28a745; }
                .notification.error i { color: #dc3545; }
                .notification-content span {
                    flex: 1;
                    font-size: 14px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.saathiConnection = new SaathiConnectionManager();
    console.log('🚀 Saathi Connection Manager loaded');
});

// Export for global use
window.SaathiConnectionManager = SaathiConnectionManager;
