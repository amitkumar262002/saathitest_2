// Real WebRTC P2P Connection - Actual video/audio sharing
console.log('📡 Real WebRTC Connection System loaded');

class RealWebRTCConnection {
    constructor() {
        this.peerId = 'webrtc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isConnected = false;
        this.isHost = false;
        this.partnerId = null;
        this.signalingChannel = null;
        
        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };
        
        this.init();
    }
    
    async init() {
        console.log('📡 Initializing Real WebRTC with ID:', this.peerId);
        
        try {
            // Get user media first
            await this.getUserMedia();
            
            // Setup signaling
            this.setupSignaling();
            
            // Start looking for peers
            this.startPeerDiscovery();
            
            console.log('✅ Real WebRTC initialized');
        } catch (error) {
            console.error('❌ WebRTC initialization failed:', error);
            this.handleError('Failed to access camera/microphone');
        }
    }
    
    async getUserMedia() {
        console.log('📹 Requesting user media...');
        
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
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
                await localVideo.play();
                console.log('✅ Local video stream set');
            }
            
            console.log('✅ User media obtained:', {
                video: this.localStream.getVideoTracks().length > 0,
                audio: this.localStream.getAudioTracks().length > 0
            });
            
        } catch (error) {
            console.error('❌ Failed to get user media:', error);
            throw error;
        }
    }
    
    setupSignaling() {
        // Use localStorage as signaling server
        window.addEventListener('storage', (e) => {
            if (e.key === 'webrtc-signaling') {
                this.handleSignalingMessage(e.newValue);
            }
        });
        
        console.log('📡 Signaling setup complete');
    }
    
    startPeerDiscovery() {
        console.log('🔍 Starting peer discovery...');
        
        // Register as available peer
        this.registerPeer();
        
        // Look for other peers
        this.findPeers();
        
        // Keep looking every 3 seconds
        this.discoveryInterval = setInterval(() => {
            if (!this.isConnected) {
                this.findPeers();
            }
        }, 3000);
    }
    
    registerPeer() {
        const peers = this.getAvailablePeers();
        peers[this.peerId] = {
            id: this.peerId,
            timestamp: Date.now(),
            status: 'available',
            hasVideo: this.localStream?.getVideoTracks().length > 0,
            hasAudio: this.localStream?.getAudioTracks().length > 0
        };
        
        localStorage.setItem('webrtc-peers', JSON.stringify(peers));
        console.log('📝 Registered as available peer');
    }
    
    findPeers() {
        const peers = this.getAvailablePeers();
        
        // Find available peer (not us, recent, available)
        for (const [peerId, peer] of Object.entries(peers)) {
            if (peerId !== this.peerId && 
                peer.status === 'available' && 
                Date.now() - peer.timestamp < 30000) {
                
                console.log('🎯 Found available peer:', peerId);
                this.initiateConnection(peerId);
                return;
            }
        }
        
        this.updateStatus('Looking for someone...', 'connecting');
    }
    
    async initiateConnection(peerId) {
        console.log('🤝 Initiating WebRTC connection with:', peerId);
        
        this.partnerId = peerId;
        this.isHost = true;
        
        try {
            // Create peer connection
            await this.createPeerConnection();
            
            // Create offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            // Send offer via signaling
            this.sendSignalingMessage({
                type: 'offer',
                offer: offer,
                from: this.peerId,
                to: peerId
            });
            
            // Update peer status
            this.updatePeerStatus('connecting');
            this.updateStatus('Connecting...', 'connecting');
            
            console.log('📤 Offer sent to peer');
            
        } catch (error) {
            console.error('❌ Failed to initiate connection:', error);
            this.handleError('Connection failed');
        }
    }
    
    async createPeerConnection() {
        console.log('🔗 Creating peer connection...');
        
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        
        // Add local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
                console.log('➕ Added track:', track.kind);
            });
        }
        
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('📥 Received remote track:', event.track.kind);
            
            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
            }
            
            this.remoteStream.addTrack(event.track);
            
            // Set remote video
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = this.remoteStream;
                remoteVideo.play().catch(e => console.log('Remote video play error:', e));
                console.log('✅ Remote video stream set');
            }
        };
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🧊 Sending ICE candidate');
                this.sendSignalingMessage({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    from: this.peerId,
                    to: this.partnerId
                });
            }
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('🔄 Connection state:', state);
            
            switch (state) {
                case 'connected':
                    this.handleConnectionEstablished();
                    break;
                case 'disconnected':
                case 'failed':
                case 'closed':
                    this.handleConnectionLost();
                    break;
            }
        };
        
        console.log('✅ Peer connection created');
    }
    
    handleSignalingMessage(messageData) {
        if (!messageData) return;
        
        try {
            const message = JSON.parse(messageData);
            
            // Only handle messages for us
            if (message.to !== this.peerId) return;
            
            console.log('📨 Received signaling message:', message.type);
            
            switch (message.type) {
                case 'offer':
                    this.handleOffer(message);
                    break;
                case 'answer':
                    this.handleAnswer(message);
                    break;
                case 'ice-candidate':
                    this.handleIceCandidate(message);
                    break;
            }
        } catch (error) {
            console.warn('⚠️ Invalid signaling message:', error);
        }
    }
    
    async handleOffer(message) {
        console.log('📥 Handling offer from:', message.from);
        
        this.partnerId = message.from;
        this.isHost = false;
        
        try {
            // Create peer connection
            await this.createPeerConnection();
            
            // Set remote description
            await this.peerConnection.setRemoteDescription(message.offer);
            
            // Create answer
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            // Send answer
            this.sendSignalingMessage({
                type: 'answer',
                answer: answer,
                from: this.peerId,
                to: message.from
            });
            
            // Update status
            this.updatePeerStatus('connecting');
            this.updateStatus('Connecting...', 'connecting');
            
            console.log('📤 Answer sent');
            
        } catch (error) {
            console.error('❌ Failed to handle offer:', error);
            this.handleError('Connection failed');
        }
    }
    
    async handleAnswer(message) {
        console.log('📥 Handling answer from:', message.from);
        
        try {
            await this.peerConnection.setRemoteDescription(message.answer);
            console.log('✅ Remote description set');
        } catch (error) {
            console.error('❌ Failed to handle answer:', error);
        }
    }
    
    async handleIceCandidate(message) {
        console.log('🧊 Handling ICE candidate');
        
        try {
            await this.peerConnection.addIceCandidate(message.candidate);
            console.log('✅ ICE candidate added');
        } catch (error) {
            console.error('❌ Failed to add ICE candidate:', error);
        }
    }
    
    sendSignalingMessage(message) {
        const messageData = JSON.stringify(message);
        localStorage.setItem('webrtc-signaling', messageData);
        
        // Clear after a moment to allow other tab to read
        setTimeout(() => {
            localStorage.removeItem('webrtc-signaling');
        }, 100);
    }
    
    handleConnectionEstablished() {
        if (this.isConnected) return;
        
        this.isConnected = true;
        clearInterval(this.discoveryInterval);
        
        console.log('🎉 WebRTC connection established!');
        
        // Update status
        this.updateStatus('Connected! Real video/audio sharing', 'connected');
        this.updatePeerStatus('connected');
        
        // Show success notification
        this.showNotification('Real WebRTC connection established!', 'success');
        
        // Start connection monitoring
        this.startConnectionMonitoring();
    }
    
    handleConnectionLost() {
        console.log('💔 WebRTC connection lost');
        
        this.isConnected = false;
        this.partnerId = null;
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        // Update status
        this.updateStatus('Connection lost', 'disconnected');
        
        // Restart discovery
        setTimeout(() => {
            this.startPeerDiscovery();
        }, 2000);
    }
    
    startConnectionMonitoring() {
        // Monitor connection quality
        setInterval(() => {
            if (this.peerConnection && this.isConnected) {
                this.peerConnection.getStats().then(stats => {
                    stats.forEach(report => {
                        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                            console.log('📊 Video stats:', {
                                bytesReceived: report.bytesReceived,
                                framesReceived: report.framesReceived,
                                packetsLost: report.packetsLost
                            });
                        }
                    });
                });
            }
        }, 10000); // Every 10 seconds
    }
    
    getAvailablePeers() {
        try {
            const data = localStorage.getItem('webrtc-peers');
            const peers = data ? JSON.parse(data) : {};
            
            // Clean old peers
            const now = Date.now();
            Object.keys(peers).forEach(id => {
                if (now - peers[id].timestamp > 60000) {
                    delete peers[id];
                }
            });
            
            return peers;
        } catch (error) {
            return {};
        }
    }
    
    updatePeerStatus(status) {
        const peers = this.getAvailablePeers();
        if (peers[this.peerId]) {
            peers[this.peerId].status = status;
            peers[this.peerId].timestamp = Date.now();
            localStorage.setItem('webrtc-peers', JSON.stringify(peers));
        }
    }
    
    updateStatus(text, status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const statusText = statusElement.querySelector('.status-text');
            const statusIndicator = statusElement.querySelector('.status-indicator');
            
            if (statusText) statusText.textContent = text;
            if (statusIndicator) statusIndicator.className = `status-indicator ${status}`;
        }
        
        console.log('📊 WebRTC Status:', text);
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-weight: bold;
            z-index: 999999;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: bounceIn 0.5s ease;
            text-align: center;
            border: 2px solid rgba(255,255,255,0.2);
        `;
        
        notification.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">📡</div>
            <div style="font-size: 16px;">${message}</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                Real video and audio streaming active
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    handleError(message) {
        console.error('❌ WebRTC Error:', message);
        this.updateStatus(message, 'disconnected');
        
        // Show error notification
        const errorNotification = document.createElement('div');
        errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        errorNotification.textContent = message;
        document.body.appendChild(errorNotification);
        
        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.parentNode.removeChild(errorNotification);
            }
        }, 5000);
    }
    
    disconnect() {
        console.log('🔌 Disconnecting WebRTC...');
        
        this.isConnected = false;
        
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
        
        // Update status
        this.updatePeerStatus('available');
        this.updateStatus('Disconnected', 'disconnected');
        
        // Restart discovery
        setTimeout(() => {
            this.startPeerDiscovery();
        }, 1000);
    }
    
    cleanup() {
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        // Clear intervals
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
        }
        
        // Remove from peers
        const peers = this.getAvailablePeers();
        delete peers[this.peerId];
        localStorage.setItem('webrtc-peers', JSON.stringify(peers));
        
        console.log('🧹 WebRTC cleanup completed');
    }
}

// Add bounce animation
const webrtcCSS = `
    @keyframes bounceIn {
        0% { transform: translateX(-50%) scale(0.3); opacity: 0; }
        50% { transform: translateX(-50%) scale(1.05); }
        70% { transform: translateX(-50%) scale(0.9); }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }
`;

const webrtcStyle = document.createElement('style');
webrtcStyle.textContent = webrtcCSS;
document.head.appendChild(webrtcStyle);

// Initialize Real WebRTC Connection
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('📡 Starting Real WebRTC Connection System...');
        window.realWebRTCConnection = new RealWebRTCConnection();
        
        // Override auto-join with real WebRTC
        if (window.autoJoinManager) {
            window.autoJoinManager.startAutoJoin = function(country, gender) {
                console.log('📡 Using Real WebRTC Connection');
                // Real WebRTC is already running
            };
        }
        
        // Add disconnect button
        setTimeout(() => {
            const controls = document.querySelector('.video-controls');
            if (controls) {
                const disconnectBtn = document.createElement('button');
                disconnectBtn.innerHTML = '🔌';
                disconnectBtn.className = 'video-control-btn ripple';
                disconnectBtn.title = 'Disconnect WebRTC';
                disconnectBtn.style.cssText = `
                    background: #9C27B0 !important;
                    color: white !important;
                    font-size: 18px !important;
                `;
                
                disconnectBtn.onclick = () => {
                    if (window.realWebRTCConnection) {
                        window.realWebRTCConnection.disconnect();
                    }
                };
                
                controls.appendChild(disconnectBtn);
                console.log('🔌 Disconnect button added');
            }
        }, 5000);
        
    }, 5000);
});

// Export for manual use
window.RealWebRTCConnection = RealWebRTCConnection;

console.log('📡 Real WebRTC Connection System loaded - Actual video/audio sharing!');
