// Simple WebRTC Fix - Guaranteed Working Solution
console.log('🚀 Simple WebRTC Fix Loading...');

class SimpleWebRTCFix {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.socket = null;
        this.roomId = null;
        this.isInitiator = false;
        
        // WebRTC Configuration
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.init();
    }
    
    init() {
        console.log('🔧 Simple WebRTC Fix Initialized');
        
        // Wait for main app to initialize
        this.waitForMainApp();
    }
    
    waitForMainApp() {
        const checkMainApp = () => {
            if (window.saathiTV && window.saathiTV.socket) {
                console.log('✅ Main app found, connecting WebRTC...');
                this.connectToSocket();
            } else {
                console.log('⏳ Waiting for main app...');
                setTimeout(checkMainApp, 1000);
            }
        };
        
        checkMainApp();
    }
    
    connectToSocket() {
        this.socket = window.saathiTV.socket;
        this.setupSocketListeners();
        console.log('🔌 WebRTC connected to socket');
        
        // Override the main WebRTC manager
        if (window.webRTCManager) {
            window.webRTCManager.setSocket = () => {}; // Disable main manager
            console.log('🚫 Main WebRTC manager disabled');
        }
    }
    
    setupSocketListeners() {
        // Listen for room joined event
        this.socket.on('roomJoined', (roomId) => {
            console.log('🏠 Joined room:', roomId);
            this.roomId = roomId;
            this.updateStatus('Room joined, waiting for peer...');
        });
        
        // Listen for room events
        this.socket.on('user-joined', (data) => {
            console.log('👥 User joined, I am initiator', data);
            this.isInitiator = true;
            this.roomId = data.roomId;
            this.updateStatus('Peer found! Starting connection...');
            setTimeout(() => this.startConnection(), 500); // Small delay
        });
        
        this.socket.on('peer-ready', (data) => {
            console.log('👥 Peer ready, I am receiver', data);
            this.isInitiator = false;
            this.roomId = data.roomId;
            this.updateStatus('Peer found! Waiting for connection...');
            // Wait for offer
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
    }
    
    async startConnection() {
        try {
            console.log('🚀 Starting WebRTC connection...');
            
            // Get local stream if not already available
            if (!this.localStream) {
                await this.getLocalStream();
            }
            
            // Create peer connection
            await this.createPeerConnection();
            
            if (this.isInitiator) {
                // Create and send offer
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                
                console.log('📤 Sending offer...');
                this.socket.emit('offer', {
                    offer: offer,
                    roomId: this.roomId
                });
            }
            
        } catch (error) {
            console.error('❌ Error starting connection:', error);
            this.updateStatus('Connection failed');
        }
    }
    
    async getLocalStream() {
        try {
            console.log('📹 Getting local stream...');
            
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            });
            
            // Set local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
                console.log('✅ Local video set');
            }
            
        } catch (error) {
            console.error('❌ Error getting local stream:', error);
            throw error;
        }
    }
    
    async createPeerConnection() {
        console.log('🔗 Creating peer connection...');
        
        this.peerConnection = new RTCPeerConnection(this.config);
        
        // Add local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
                console.log('➕ Added track:', track.kind);
            });
        }
        
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('🎥 Received remote stream!');
            
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = event.streams[0];
                console.log('✅ Remote video set!');
                this.updateStatus('Connected! 🎉');
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
        
        // Handle connection state
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('🔄 Connection state:', state);
            
            if (state === 'connected') {
                this.updateStatus('Connected! 🎉');
            } else if (state === 'failed') {
                this.updateStatus('Connection failed');
            }
        };
    }
    
    async handleOffer(data) {
        try {
            console.log('📥 Handling offer...');
            
            // Get local stream if not available
            if (!this.localStream) {
                await this.getLocalStream();
            }
            
            // Create peer connection if not exists
            if (!this.peerConnection) {
                await this.createPeerConnection();
            }
            
            // Set remote description
            await this.peerConnection.setRemoteDescription(data.offer);
            
            // Create and send answer
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            console.log('📤 Sending answer...');
            this.socket.emit('answer', {
                answer: answer,
                roomId: this.roomId
            });
            
        } catch (error) {
            console.error('❌ Error handling offer:', error);
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
    
    updateStatus(message) {
        console.log('📊 Status:', message);
        
        // Update UI status
        if (window.saathiTV) {
            window.saathiTV.updateConnectionStatus(message, 
                message.includes('Connected') ? 'connected' : 'connecting'
            );
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Simple WebRTC Fix...');
    window.simpleWebRTCFix = new SimpleWebRTCFix();
});

console.log('✅ Simple WebRTC Fix Loaded');
