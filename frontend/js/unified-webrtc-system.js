// Unified WebRTC System - Complete Working Solution
console.log('🚀 Unified WebRTC System Loading...');

class UnifiedWebRTCSystem {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.socket = null;
        this.roomId = null;
        this.isInitiator = false;
        this.isConnected = false;
        this.connectionTimeout = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // WebRTC Configuration with multiple STUN servers
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun.stunprotocol.org:3478' },
                { urls: 'stun:stun.services.mozilla.com' }
            ],
            iceCandidatePoolSize: 10
        };
        
        this.init();
    }
    
    init() {
        console.log('🔧 Unified WebRTC System Initialized');
        this.waitForSocket();
        this.setupGlobalFunctions();
    }
    
    setupGlobalFunctions() {
        // Override the global video chat start function
        window.startVideoChat = () => this.startVideoChat();
        window.nextUser = () => this.nextUser();
        window.stopChat = () => this.stopChat();
        window.toggleVideo = () => this.toggleVideo();
        window.toggleAudio = () => this.toggleAudio();
        
        console.log('✅ Global WebRTC functions set up');
    }
    
    waitForSocket() {
        const checkSocket = () => {
            // Try multiple socket sources
            if (window.saathiTV && window.saathiTV.socket) {
                this.socket = window.saathiTV.socket;
                this.setupSocketListeners();
                console.log('✅ Connected to main socket');
                return;
            }
            
            if (window.ultraSimpleFix && window.ultraSimpleFix.socket) {
                this.socket = window.ultraSimpleFix.socket;
                this.setupSocketListeners();
                console.log('✅ Connected to ultra simple fix socket');
                return;
            }
            
            if (window.io) {
                try {
                    // Try multiple ports
                    const ports = [3001, 3000];
                    for (const port of ports) {
                        try {
                            this.socket = window.io(`http://localhost:${port}`, {
                                transports: ['websocket', 'polling'],
                                timeout: 5000,
                                forceNew: true
                            });
                            this.setupSocketListeners();
                            console.log(`✅ Created new socket connection on port ${port}`);
                            return;
                        } catch (portError) {
                            console.warn(`⚠️ Port ${port} failed:`, portError);
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to create new socket:', error);
                }
            }
            
            setTimeout(checkSocket, 1000);
        };
        
        checkSocket();
    }
    
    setupSocketListeners() {
        if (!this.socket) return;
        
        console.log('🔌 Setting up socket listeners');
        
        // Room events
        this.socket.on('roomJoined', (roomId) => {
            console.log('🏠 Joined room:', roomId);
            this.roomId = roomId;
            this.updateStatus('Room joined, waiting for peer...');
        });
        
        // Enhanced stranger matching events
        this.socket.on('stranger-matched', (data) => {
            console.log('🎉 Stranger matched!', data);
            this.updateStatus('Stranger found! Starting video chat...');
            this.showSuccess('Matched with a stranger!');
        });
        
        this.socket.on('queue-update', (data) => {
            console.log('📊 Queue update:', data);
            this.updateQueueInfo(data);
        });
        
        this.socket.on('user-joined', (data) => {
            console.log('👥 User joined, I am initiator', data);
            this.isInitiator = true;
            this.roomId = data.roomId;
            this.updateStatus('Peer found! Connecting...');
            setTimeout(() => this.createOffer(), 1000);
        });
        
        this.socket.on('peer-ready', (data) => {
            console.log('👥 Peer ready, I am receiver', data);
            this.isInitiator = false;
            this.roomId = data.roomId;
            this.updateStatus('Peer found! Waiting for connection...');
        });
        
        // WebRTC signaling
        this.socket.on('offer', async (data) => {
            console.log('📥 Received offer');
            await this.handleOffer(data);
        });
        
        this.socket.on('answer', async (data) => {
            console.log('📥 Received answer');
            await this.handleAnswer(data);
        });
        
        this.socket.on('ice-candidate', async (data) => {
            console.log('🧊 Received ICE candidate');
            await this.handleIceCandidate(data);
        });
        
        // Connection events
        this.socket.on('user-left', () => {
            console.log('👋 User left');
            this.handleUserLeft();
        });
        
        this.socket.on('waiting', (data) => {
            console.log('⏳ Waiting for match:', data);
            this.updateStatus(data.message || 'Looking for someone...');
        });
        
        console.log('✅ Socket listeners set up');
    }
    
    async startVideoChat() {
        console.log('🎥 Starting video chat...');
        
        try {
            // Reset state
            this.cleanup();
            this.retryCount = 0;
            
            // Get media first
            await this.getLocalMedia();
            
            // Show video chat interface
            this.showVideoInterface();
            
            // Join room to find a partner
            this.findPartner();
            
            // Set connection timeout
            this.setConnectionTimeout();
            
        } catch (error) {
            console.error('❌ Error starting video chat:', error);
            this.showError('Failed to start video chat. Please check camera/microphone permissions.');
        }
    }
    
    async getLocalMedia() {
        console.log('📹 Getting local media...');
        
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });
            
            // Set local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
                localVideo.muted = true; // Prevent echo
                console.log('✅ Local video set');
            }
            
        } catch (error) {
            console.error('❌ Error getting local media:', error);
            throw new Error('Camera/microphone access denied. Please allow permissions and try again.');
        }
    }
    
    showVideoInterface() {
        const heroSection = document.querySelector('.hero, #home');
        const videoSection = document.getElementById('videoChat');
        
        if (heroSection && videoSection) {
            heroSection.style.display = 'none';
            videoSection.style.display = 'flex';
            console.log('✅ Video interface shown');
        }
    }
    
    findPartner() {
        if (!this.socket) {
            console.error('❌ No socket connection');
            this.showError('Connection error. Please refresh and try again.');
            return;
        }
        
        console.log('🔍 Looking for partner...');
        this.updateStatus('Looking for someone...');
        
        // Get user preferences
        const country = document.getElementById('countrySelect')?.value || 'any';
        const gender = document.getElementById('genderSelect')?.value || 'any';
        
        // Emit join room request
        this.socket.emit('joinRoom', { country, gender });
    }
    
    setConnectionTimeout() {
        // Clear existing timeout
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }
        
        // Set 30-second timeout for finding partner
        this.connectionTimeout = setTimeout(() => {
            if (!this.isConnected) {
                console.log('⏰ Connection timeout');
                this.updateStatus('No one available right now. Try again?');
                this.showRetryOption();
            }
        }, 30000);
    }
    
    showRetryOption() {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.innerHTML = `
                No one available right now. 
                <button onclick="window.unifiedWebRTC.startVideoChat()" style="
                    background: #FF6B35; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 20px; 
                    cursor: pointer; 
                    margin-left: 10px;
                ">Try Again</button>
            `;
        }
    }
    
    async createPeerConnection() {
        console.log('🔗 Creating peer connection...');
        
        try {
            this.peerConnection = new RTCPeerConnection(this.config);
            
            // Add local stream tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection.addTrack(track, this.localStream);
                    console.log(`➕ Added ${track.kind} track`);
                });
            }
            
            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                console.log('🎥 Received remote stream!');
                this.remoteStream = event.streams[0];
                
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) {
                    remoteVideo.srcObject = this.remoteStream;
                    console.log('✅ Remote video set!');
                    this.onConnectionEstablished();
                }
            };
            
            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('🧊 Sending ICE candidate');
                    this.socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        roomId: this.roomId
                    });
                }
            };
            
            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection.connectionState;
                console.log('🔄 Connection state:', state);
                
                switch (state) {
                    case 'connected':
                        this.onConnectionEstablished();
                        break;
                    case 'failed':
                        this.handleConnectionFailure();
                        break;
                    case 'disconnected':
                        this.handleDisconnection();
                        break;
                }
            };
            
            // Handle ICE connection state
            this.peerConnection.oniceconnectionstatechange = () => {
                const state = this.peerConnection.iceConnectionState;
                console.log('🧊 ICE state:', state);
                
                if (state === 'connected' || state === 'completed') {
                    this.onConnectionEstablished();
                } else if (state === 'failed') {
                    this.handleConnectionFailure();
                }
            };
            
            console.log('✅ Peer connection created');
            return this.peerConnection;
            
        } catch (error) {
            console.error('❌ Error creating peer connection:', error);
            throw error;
        }
    }
    
    async createOffer() {
        console.log('📤 Creating offer...');
        
        try {
            await this.createPeerConnection();
            
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            await this.peerConnection.setLocalDescription(offer);
            
            console.log('📤 Sending offer...');
            this.socket.emit('offer', {
                offer: offer,
                roomId: this.roomId
            });
            
            this.updateStatus('Connecting...');
            
        } catch (error) {
            console.error('❌ Error creating offer:', error);
            this.handleConnectionFailure();
        }
    }
    
    async handleOffer(data) {
        console.log('📥 Handling offer...');
        
        try {
            await this.createPeerConnection();
            
            await this.peerConnection.setRemoteDescription(data.offer);
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            console.log('📤 Sending answer...');
            this.socket.emit('answer', {
                answer: answer,
                roomId: this.roomId
            });
            
            this.updateStatus('Connecting...');
            
        } catch (error) {
            console.error('❌ Error handling offer:', error);
            this.handleConnectionFailure();
        }
    }
    
    async handleAnswer(data) {
        try {
            await this.peerConnection.setRemoteDescription(data.answer);
            console.log('✅ Answer handled');
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
    
    onConnectionEstablished() {
        if (this.isConnected) return; // Prevent multiple calls
        
        console.log('🎉 Connection established!');
        this.isConnected = true;
        this.retryCount = 0;
        
        // Clear timeout
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }
        
        this.updateStatus('Connected! 🎉');
        
        // Show success notification
        this.showSuccess('Connected to a stranger!');
    }
    
    handleConnectionFailure() {
        console.log('❌ Connection failed');
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Retrying connection (${this.retryCount}/${this.maxRetries})`);
            this.updateStatus(`Connection failed. Retrying... (${this.retryCount}/${this.maxRetries})`);
            
            setTimeout(() => {
                this.cleanup();
                this.findPartner();
            }, 2000);
        } else {
            this.updateStatus('Connection failed. Please try again.');
            this.showRetryOption();
        }
    }
    
    handleDisconnection() {
        console.log('🔌 Connection lost');
        this.isConnected = false;
        this.updateStatus('Connection lost');
    }
    
    handleUserLeft() {
        console.log('👋 Partner left');
        this.isConnected = false;
        this.cleanup();
        this.updateStatus('Partner disconnected');
        
        // Show option to find new partner
        setTimeout(() => {
            this.showRetryOption();
        }, 1000);
    }
    
    nextUser() {
        console.log('🔄 Finding next user...');
        this.cleanup();
        this.findPartner();
        this.setConnectionTimeout();
    }
    
    stopChat() {
        console.log('⏹️ Stopping chat...');
        this.cleanup();
        this.hideVideoInterface();
    }
    
    cleanup() {
        console.log('🧹 Cleaning up...');
        
        // Clear timeout
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        // Leave room
        if (this.socket && this.roomId) {
            this.socket.emit('leaveRoom', this.roomId);
        }
        
        // Reset state
        this.isConnected = false;
        this.roomId = null;
        this.isInitiator = false;
        this.remoteStream = null;
    }
    
    hideVideoInterface() {
        const heroSection = document.querySelector('.hero, #home');
        const videoSection = document.getElementById('videoChat');
        
        if (heroSection && videoSection) {
            videoSection.style.display = 'none';
            heroSection.style.display = 'flex';
        }
        
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Clear local video
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = null;
        }
    }
    
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                console.log(`📹 Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
                return videoTrack.enabled;
            }
        }
        return false;
    }
    
    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                console.log(`🎤 Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
                return audioTrack.enabled;
            }
        }
        return false;
    }
    
    updateStatus(message) {
        console.log('📊 Status:', message);
        
        // Update status text
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = message;
        }
        
        // Update status indicator
        const statusIndicator = document.getElementById('statusIndicator');
        if (statusIndicator) {
            if (message.includes('Connected') || message.includes('🎉')) {
                statusIndicator.className = 'status-indicator connected';
            } else if (message.includes('failed') || message.includes('error')) {
                statusIndicator.className = 'status-indicator disconnected';
            } else {
                statusIndicator.className = 'status-indicator connecting';
            }
        }
    }
    
    updateQueueInfo(data) {
        // Update queue information in the UI
        const queueInfo = document.getElementById('queueInfo');
        if (queueInfo) {
            queueInfo.innerHTML = `
                <div class="queue-info">
                    <div class="queue-position">Position: ${data.position}</div>
                    <div class="queue-total">Total waiting: ${data.totalWaiting}</div>
                    <div class="queue-time">Est. wait: ${data.estimatedWaitTime}s</div>
                </div>
            `;
        }
        
        // Update live user tracking if available
        if (window.liveUserTracking) {
            window.liveUserTracking.updateQueuePosition(data.position);
        }
    }
    
    showError(message) {
        console.error('❌', message);
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        console.log('✅', message);
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }
        
        // Create simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Unified WebRTC System...');
    window.unifiedWebRTC = new UnifiedWebRTCSystem();
});

console.log('✅ Unified WebRTC System Loaded');
