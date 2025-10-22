// Complete WebRTC Fix and Function Repair System

class WebRTCFix {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.socket = null;
        this.isConnected = false;
        this.currentRoom = null;
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
            ]
        };
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing WebRTC Fix System...');
        
        // Check browser compatibility
        this.checkBrowserSupport();
        
        // Initialize socket connection
        this.initializeSocket();
        
        // Setup media devices
        await this.setupMediaDevices();
        
        // Setup UI handlers
        this.setupUIHandlers();
        
        console.log('✅ WebRTC Fix System initialized successfully');
    }

    checkBrowserSupport() {
        const isWebRTCSupported = !!(navigator.mediaDevices && 
            navigator.mediaDevices.getUserMedia && 
            window.RTCPeerConnection);
            
        if (!isWebRTCSupported) {
            this.showError('Your browser does not support video chat. Please use Chrome, Firefox, or Safari.');
            return false;
        }
        
        console.log('✅ Browser supports WebRTC');
        return true;
    }

    initializeSocket() {
        if (window.io) {
            this.socket = window.io();
            
            this.socket.on('connect', () => {
                console.log('📡 Socket connected:', this.socket.id);
                this.updateStatus('Connected', 'success');
            });

            this.socket.on('disconnect', () => {
                console.log('📡 Socket disconnected');
                this.updateStatus('Disconnected', 'error');
            });

            // WebRTC signaling events
            this.socket.on('offer', async (data) => {
                await this.handleOffer(data);
            });

            this.socket.on('answer', async (data) => {
                await this.handleAnswer(data);
            });

            this.socket.on('ice-candidate', async (data) => {
                await this.handleIceCandidate(data);
            });

            this.socket.on('user-joined', (data) => {
                console.log('👤 User joined room:', data);
                this.startCall();
            });

            this.socket.on('user-left', () => {
                console.log('👤 User left room');
                this.endCall();
            });

            this.socket.on('room-full', () => {
                this.showError('Room is full. Please try again.');
            });
        }
    }

    async setupMediaDevices() {
        try {
            // Check for available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(device => device.kind === 'videoinput');
            const hasAudio = devices.some(device => device.kind === 'audioinput');
            
            console.log(`📹 Video devices: ${hasVideo ? 'Available' : 'Not found'}`);
            console.log(`🎤 Audio devices: ${hasAudio ? 'Available' : 'Not found'}`);

            // Get user media with fallbacks
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
            }

            console.log('✅ Local media stream obtained');
            this.updateStatus('Camera and microphone ready', 'success');
            
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            this.handleMediaError(error);
        }
    }

    setupUIHandlers() {
        // Start Chat Button functionality removed - using navbar button instead

        // Next Button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextChat());
        }

        // Stop Button
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopChat());
        }

        // Audio Toggle
        const audioBtn = document.getElementById('toggleAudio');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.toggleAudio());
        }

        // Video Toggle
        const videoBtn = document.getElementById('toggleVideo');
        if (videoBtn) {
            videoBtn.addEventListener('click', () => this.toggleVideo());
        }

        // Web Chat Button
        window.startWebChat = () => this.startWebChat();
    }

    async startChat() {
        try {
            console.log('🚀 Starting chat...');
            
            // Show video chat section
            const videoSection = document.getElementById('videoChat');
            const heroSection = document.getElementById('hero');
            
            if (videoSection && heroSection) {
                heroSection.style.display = 'none';
                videoSection.style.display = 'flex';
            }

            // Get user preferences
            const countrySelect = document.getElementById('countrySelect');
            const genderSelect = document.getElementById('genderSelect');
            
            const preferences = {
                country: countrySelect ? countrySelect.value : 'any',
                gender: genderSelect ? genderSelect.value : 'any'
            };

            // Join matching room
            if (this.socket) {
                this.socket.emit('joinRoom', preferences);
                this.updateStatus('Looking for someone...', 'warning');
            }

            console.log('✅ Chat started with preferences:', preferences);
            
        } catch (error) {
            console.error('❌ Error starting chat:', error);
            this.showError('Failed to start chat. Please try again.');
        }
    }

    async startCall() {
        try {
            console.log('📞 Starting WebRTC call...');
            
            // Create peer connection
            this.peerConnection = new RTCPeerConnection(this.configuration);
            
            // Add local stream to peer connection
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection.addTrack(track, this.localStream);
                });
            }

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                console.log('📡 Received remote stream');
                this.remoteStream = event.streams[0];
                
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) {
                    remoteVideo.srcObject = this.remoteStream;
                }
                
                this.updateStatus('Connected', 'success');
            };

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.socket) {
                    this.socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        roomId: this.currentRoom
                    });
                }
            };

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                console.log('🔗 Connection state:', this.peerConnection.connectionState);
                
                switch (this.peerConnection.connectionState) {
                    case 'connected':
                        this.updateStatus('Connected', 'success');
                        break;
                    case 'disconnected':
                        this.updateStatus('Disconnected', 'warning');
                        break;
                    case 'failed':
                        this.updateStatus('Connection failed', 'error');
                        this.restartConnection();
                        break;
                }
            };

            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            if (this.socket) {
                this.socket.emit('offer', {
                    offer: offer,
                    roomId: this.currentRoom
                });
            }

            console.log('✅ WebRTC call initiated');
            
        } catch (error) {
            console.error('❌ Error starting call:', error);
            this.showError('Failed to start video call. Please check your camera and microphone.');
        }
    }

    async handleOffer(data) {
        try {
            console.log('📞 Handling offer...');
            
            if (!this.peerConnection) {
                await this.startCall();
            }

            await this.peerConnection.setRemoteDescription(data.offer);
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            if (this.socket) {
                this.socket.emit('answer', {
                    answer: answer,
                    roomId: this.currentRoom
                });
            }

            console.log('✅ Offer handled, answer sent');
            
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }

    async handleAnswer(data) {
        try {
            console.log('📞 Handling answer...');
            
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

    toggleAudio() {
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const isEnabled = audioTracks[0].enabled;
                audioTracks[0].enabled = !isEnabled;
                
                const audioBtn = document.getElementById('toggleAudio');
                if (audioBtn) {
                    audioBtn.classList.toggle('active', !isEnabled);
                }
                
                console.log(`🎤 Audio ${!isEnabled ? 'enabled' : 'disabled'}`);
                this.showNotification(`Microphone ${!isEnabled ? 'ON' : 'OFF'}`);
            }
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTracks = this.localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                const isEnabled = videoTracks[0].enabled;
                videoTracks[0].enabled = !isEnabled;
                
                const videoBtn = document.getElementById('toggleVideo');
                if (videoBtn) {
                    videoBtn.classList.toggle('active', !isEnabled);
                }
                
                console.log(`📹 Video ${!isEnabled ? 'enabled' : 'disabled'}`);
                this.showNotification(`Camera ${!isEnabled ? 'ON' : 'OFF'}`);
            }
        }
    }

    nextChat() {
        console.log('⏭️ Finding next person...');
        this.endCall();
        setTimeout(() => {
            this.startChat();
        }, 1000);
    }

    stopChat() {
        console.log('⏹️ Stopping chat...');
        this.endCall();
        
        // Return to home
        const videoSection = document.getElementById('videoChat');
        const heroSection = document.getElementById('hero');
        
        if (videoSection && heroSection) {
            videoSection.style.display = 'none';
            heroSection.style.display = 'block';
        }
    }

    endCall() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        if (this.remoteStream) {
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = null;
            }
            this.remoteStream = null;
        }
        
        if (this.socket && this.currentRoom) {
            this.socket.emit('leaveRoom', this.currentRoom);
        }
        
        this.currentRoom = null;
        this.updateStatus('Disconnected', 'error');
        
        console.log('📞 Call ended');
    }

    async restartConnection() {
        console.log('🔄 Restarting connection...');
        this.endCall();
        
        setTimeout(async () => {
            await this.setupMediaDevices();
            this.startChat();
        }, 2000);
    }

    handleMediaError(error) {
        let message = 'Unable to access camera or microphone. ';
        
        switch (error.name) {
            case 'NotAllowedError':
                message += 'Please allow camera and microphone access.';
                break;
            case 'NotFoundError':
                message += 'No camera or microphone found.';
                break;
            case 'NotReadableError':
                message += 'Camera or microphone is being used by another application.';
                break;
            default:
                message += 'Please check your camera and microphone settings.';
        }
        
        this.showError(message);
    }

    updateStatus(text, type) {
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        
        if (statusText) {
            statusText.textContent = text;
        }
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${type}`;
        }
        
        console.log(`📊 Status: ${text} (${type})`);
    }

    showError(message) {
        console.error('❌ Error:', message);
        
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showNotification(message) {
        console.log('📢 Notification:', message);
        
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    startWebChat() {
        console.log('🌐 Starting web chat...');
        this.startChat();
    }

    // Public methods for external use
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            hasLocalStream: !!this.localStream,
            hasRemoteStream: !!this.remoteStream,
            peerConnectionState: this.peerConnection?.connectionState || 'disconnected'
        };
    }

    async reinitialize() {
        console.log('🔄 Reinitializing WebRTC system...');
        this.endCall();
        await this.init();
    }
}

// Enhanced notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .error-notification, .success-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        border-left: 4px solid;
    }

    .error-notification {
        border-left-color: #f44336;
        background: rgba(244, 67, 54, 0.1);
    }

    .success-notification {
        border-left-color: #4CAF50;
        background: rgba(76, 175, 80, 0.1);
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-content i {
        font-size: 18px;
    }

    .notification-content button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
    }

    .notification-content button:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .web-chat-btn {
        background: linear-gradient(45deg, #4CAF50, #45a049) !important;
        color: white !important;
        border: none !important;
        padding: 12px 24px !important;
        border-radius: 25px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin-top: 10px !important;
    }

    .web-chat-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
    }

    .web-chat-btn i {
        font-size: 16px !important;
    }
`;

document.head.appendChild(notificationStyles);

// Initialize WebRTC Fix System
document.addEventListener('DOMContentLoaded', () => {
    window.webRTCFix = new WebRTCFix();
    console.log('🔧 WebRTC Fix System loaded');
});

// Export for global use
window.WebRTCFix = WebRTCFix;
