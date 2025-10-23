// Production-Ready WebRTC Client for Saathi TV
// Handles P2P connections, signaling, and media management

class WebRTCClient {
    constructor() {
        this.socket = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.roomId = null;
        this.isInitiator = false;
        this.connectionState = 'disconnected';
        this.heartbeatInterval = null;
        
        // WebRTC Configuration with STUN/TURN servers
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
                // Add TURN servers for production:
                // { 
                //     urls: 'turn:your-turn-server.com:3478',
                //     username: process.env.TURN_USER,
                //     credential: process.env.TURN_PASS
                // }
            ],
            iceCandidatePoolSize: 10
        };
        
        this.init();
    }

    init() {
        console.log('🎥 WebRTC Client initializing...');
        this.connectToSignalingServer();
        this.setupHeartbeat();
    }

    // Connect to signaling server
    connectToSignalingServer() {
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : 'https://your-signaling-server.com';
            
        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.setupSocketListeners();
    }

    // Setup socket event listeners
    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to signaling server');
            this.updateConnectionStatus('Connected to server', 'connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from signaling server');
            this.updateConnectionStatus('Disconnected', 'disconnected');
            this.cleanup();
        });

        this.socket.on('online_count', ({ count }) => {
            this.updateOnlineCount(count);
        });

        this.socket.on('matched', async ({ roomId, peers }) => {
            console.log('🎉 Matched with peer:', roomId);
            this.roomId = roomId;
            this.isInitiator = peers[0] === this.socket.id;
            
            await this.createPeerConnection();
            
            if (this.isInitiator) {
                console.log('📞 Creating offer as initiator');
                await this.createOffer();
            }
            
            this.updateConnectionStatus('Connected to peer', 'connected');
        });

        this.socket.on('waiting', ({ message, queuePosition }) => {
            console.log('⏳ Waiting for match:', message);
            this.updateConnectionStatus(`${message} (Position: ${queuePosition})`, 'connecting');
        });

        this.socket.on('signal', async ({ from, payload }) => {
            console.log('📡 Received signal from', from, ':', payload.type || 'ice-candidate');
            await this.handleSignal(payload);
        });

        this.socket.on('peer_left', ({ roomId }) => {
            console.log('👋 Peer left room:', roomId);
            this.handlePeerLeft();
        });

        this.socket.on('chat_message', ({ from, message, timestamp }) => {
            this.handleChatMessage(from, message, timestamp);
        });

        this.socket.on('heartbeat_ack', () => {
            // Heartbeat acknowledged
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
            this.updateConnectionStatus('Connection error', 'error');
        });
    }

    // Start looking for a match
    async findMatch(preferences = {}) {
        console.log('🔍 Looking for match with preferences:', preferences);
        
        try {
            // Get user media first
            await this.getUserMedia();
            
            // Request match from server
            this.socket.emit('find_match', preferences);
            this.updateConnectionStatus('Looking for someone...', 'connecting');
            
        } catch (error) {
            console.error('❌ Error starting match:', error);
            this.updateConnectionStatus('Media access denied', 'error');
            throw error;
        }
    }

    // Get user media (camera/microphone)
    async getUserMedia() {
        try {
            const constraints = {
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
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Set local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
                localVideo.muted = true; // Prevent feedback
            }

            console.log('📹 Local media stream acquired');
            return this.localStream;

        } catch (error) {
            console.error('❌ Error accessing media:', error);
            throw new Error('Camera/microphone access denied. Please allow permissions and try again.');
        }
    }

    // Create WebRTC peer connection
    async createPeerConnection() {
        try {
            this.peerConnection = new RTCPeerConnection(this.rtcConfig);

            // Add local stream tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection.addTrack(track, this.localStream);
                    console.log(`➕ Added ${track.kind} track to peer connection`);
                });
            }

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('🧊 Sending ICE candidate');
                    this.socket.emit('signal', {
                        roomId: this.roomId,
                        payload: { candidate: event.candidate }
                    });
                }
            };

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                console.log('🎥 Received remote stream');
                this.remoteStream = event.streams[0];
                
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) {
                    remoteVideo.srcObject = this.remoteStream;
                }
            };

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection.connectionState;
                console.log('🔗 Connection state:', state);
                this.connectionState = state;
                
                switch (state) {
                    case 'connected':
                        this.updateConnectionStatus('Connected', 'connected');
                        break;
                    case 'disconnected':
                        this.updateConnectionStatus('Connection lost', 'disconnected');
                        break;
                    case 'failed':
                        this.updateConnectionStatus('Connection failed', 'error');
                        this.handleConnectionFailure();
                        break;
                    case 'closed':
                        this.updateConnectionStatus('Disconnected', 'disconnected');
                        break;
                }
            };

            // Handle ICE connection state
            this.peerConnection.oniceconnectionstatechange = () => {
                const state = this.peerConnection.iceConnectionState;
                console.log('🧊 ICE connection state:', state);
                
                if (state === 'failed') {
                    this.handleConnectionFailure();
                }
            };

            console.log('✅ Peer connection created');

        } catch (error) {
            console.error('❌ Error creating peer connection:', error);
            throw error;
        }
    }

    // Create offer (initiator)
    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await this.peerConnection.setLocalDescription(offer);
            
            console.log('📤 Sending offer');
            this.socket.emit('signal', {
                roomId: this.roomId,
                payload: { type: 'offer', sdp: offer.sdp }
            });

        } catch (error) {
            console.error('❌ Error creating offer:', error);
        }
    }

    // Handle incoming signals
    async handleSignal(payload) {
        try {
            if (!this.peerConnection) {
                await this.createPeerConnection();
            }

            if (payload.type === 'offer') {
                console.log('📥 Received offer, creating answer');
                
                await this.peerConnection.setRemoteDescription({
                    type: 'offer',
                    sdp: payload.sdp
                });

                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);

                this.socket.emit('signal', {
                    roomId: this.roomId,
                    payload: { type: 'answer', sdp: answer.sdp }
                });

            } else if (payload.type === 'answer') {
                console.log('📥 Received answer');
                
                await this.peerConnection.setRemoteDescription({
                    type: 'answer',
                    sdp: payload.sdp
                });

            } else if (payload.candidate) {
                console.log('📥 Received ICE candidate');
                
                await this.peerConnection.addIceCandidate(payload.candidate);
            }

        } catch (error) {
            console.error('❌ Error handling signal:', error);
        }
    }

    // Handle connection failure
    async handleConnectionFailure() {
        console.log('🔄 Connection failed, attempting restart...');
        
        try {
            // Try ICE restart
            const offer = await this.peerConnection.createOffer({ iceRestart: true });
            await this.peerConnection.setLocalDescription(offer);
            
            this.socket.emit('signal', {
                roomId: this.roomId,
                payload: { type: 'offer', sdp: offer.sdp }
            });
            
        } catch (error) {
            console.error('❌ ICE restart failed:', error);
            this.updateConnectionStatus('Connection failed', 'error');
        }
    }

    // Handle peer leaving
    handlePeerLeft() {
        this.updateConnectionStatus('Peer disconnected', 'disconnected');
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.roomId = null;
        this.remoteStream = null;
    }

    // Find next user
    findNext(preferences = {}) {
        console.log('⏭️ Finding next user...');
        
        // Leave current room
        if (this.roomId) {
            this.socket.emit('leave_room', { roomId: this.roomId });
        }

        this.handlePeerLeft();
        
        // Start new search after brief delay
        setTimeout(() => {
            this.findMatch(preferences);
        }, 1000);
    }

    // Send chat message
    sendChatMessage(message) {
        if (this.roomId && message.trim()) {
            this.socket.emit('chat_message', {
                roomId: this.roomId,
                message: message.trim()
            });
        }
    }

    // Handle incoming chat message
    handleChatMessage(from, message, timestamp) {
        // Emit event for chat UI to handle
        window.dispatchEvent(new CustomEvent('chatMessage', {
            detail: { from, message, timestamp }
        }));
    }

    // Media controls
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                console.log('📹 Video:', videoTrack.enabled ? 'ON' : 'OFF');
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
                console.log('🎤 Audio:', audioTrack.enabled ? 'ON' : 'OFF');
                return audioTrack.enabled;
            }
        }
        return false;
    }

    // Cleanup resources
    cleanup() {
        console.log('🧹 Cleaning up WebRTC resources...');
        
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Clear videos
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        
        if (localVideo) localVideo.srcObject = null;
        if (remoteVideo) remoteVideo.srcObject = null;

        // Clear room
        this.roomId = null;
        this.remoteStream = null;
        this.connectionState = 'disconnected';
        
        // Stop heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Setup heartbeat for connection monitoring
    setupHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('heartbeat');
            }
        }, 10000); // Every 10 seconds
    }

    // Update connection status in UI
    updateConnectionStatus(text, status) {
        const statusElement = document.getElementById('statusText');
        const indicatorElement = document.getElementById('statusIndicator');
        
        if (statusElement) {
            statusElement.textContent = text;
        }
        
        if (indicatorElement) {
            indicatorElement.className = `status-indicator ${status}`;
        }

        console.log(`📊 Status: ${text} (${status})`);
        
        // Emit event for other components
        window.dispatchEvent(new CustomEvent('connectionStatusChanged', {
            detail: { text, status }
        }));
    }

    // Update online user count
    updateOnlineCount(count) {
        const countElement = document.getElementById('userCount');
        if (countElement) {
            countElement.textContent = count.toLocaleString();
        }
        
        console.log(`👥 Online users: ${count}`);
    }

    // Get connection statistics
    async getStats() {
        if (!this.peerConnection) return null;

        try {
            const stats = await this.peerConnection.getStats();
            const result = {
                audio: { inbound: {}, outbound: {} },
                video: { inbound: {}, outbound: {} },
                connection: {}
            };

            stats.forEach(report => {
                if (report.type === 'inbound-rtp') {
                    const kind = report.kind;
                    if (kind === 'audio' || kind === 'video') {
                        result[kind].inbound = {
                            bytesReceived: report.bytesReceived,
                            packetsReceived: report.packetsReceived,
                            packetsLost: report.packetsLost
                        };
                    }
                } else if (report.type === 'outbound-rtp') {
                    const kind = report.kind;
                    if (kind === 'audio' || kind === 'video') {
                        result[kind].outbound = {
                            bytesSent: report.bytesSent,
                            packetsSent: report.packetsSent
                        };
                    }
                } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    result.connection = {
                        currentRoundTripTime: report.currentRoundTripTime,
                        availableOutgoingBitrate: report.availableOutgoingBitrate,
                        availableIncomingBitrate: report.availableIncomingBitrate
                    };
                }
            });

            return result;
        } catch (error) {
            console.error('❌ Error getting stats:', error);
            return null;
        }
    }
}

// Initialize WebRTC client when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.webrtcClient = new WebRTCClient();
    console.log('🎥 WebRTC Client initialized');
});

// Export for use in other files
window.WebRTCClient = WebRTCClient;
