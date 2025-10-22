// WebRTC Manager for Saathi TV
class WebRTCManager {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.socket = null;
        this.isInitiator = false;
        this.roomId = null;
        
        // WebRTC configuration
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        this.init();
    }

    init() {
        // Initialize WebRTC manager
        console.log('WebRTC Manager initialized');
    }

    setSocket(socket) {
        this.socket = socket;
        this.setupSocketListeners();
        console.log('Socket connected to WebRTC Manager');
    }

    setupSocketListeners() {
        if (!this.socket) return;

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
            this.handleUserJoined(data);
        });

        this.socket.on('user-left', () => {
            this.handleUserLeft();
        });

        this.socket.on('room-full', () => {
            this.handleRoomFull();
        });
    }

    async createPeerConnection() {
        try {
            this.peerConnection = new RTCPeerConnection(this.configuration);

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.socket) {
                    this.socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        roomId: this.roomId
                    });
                }
            };

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                console.log('Received remote stream');
                this.remoteStream = event.streams[0];
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) {
                    remoteVideo.srcObject = this.remoteStream;
                }
            };

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                console.log('Connection state:', this.peerConnection.connectionState);
                this.updateConnectionStatus(this.peerConnection.connectionState);
            };

            // Handle ICE connection state changes
            this.peerConnection.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', this.peerConnection.iceConnectionState);
                this.handleIceConnectionStateChange();
            };

            // Add local stream to peer connection
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection.addTrack(track, this.localStream);
                });
            }

            return this.peerConnection;
        } catch (error) {
            console.error('Error creating peer connection:', error);
            throw error;
        }
    }

    async handleUserJoined(data) {
        console.log('User joined room, creating offer...');
        this.isInitiator = true;
        this.roomId = data.roomId;
        
        try {
            await this.createPeerConnection();
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            await this.peerConnection.setLocalDescription(offer);
            
            this.socket.emit('offer', {
                offer: offer,
                roomId: this.roomId
            });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }

    async handleOffer(data) {
        console.log('Received offer, creating answer...');
        this.roomId = data.roomId;
        
        try {
            await this.createPeerConnection();
            await this.peerConnection.setRemoteDescription(data.offer);
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            this.socket.emit('answer', {
                answer: answer,
                roomId: this.roomId
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleAnswer(data) {
        console.log('Received answer');
        try {
            await this.peerConnection.setRemoteDescription(data.answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }

    async handleIceCandidate(data) {
        console.log('Received ICE candidate');
        try {
            if (this.peerConnection && data.candidate) {
                await this.peerConnection.addIceCandidate(data.candidate);
            }
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    }

    handleIceConnectionStateChange() {
        const state = this.peerConnection.iceConnectionState;
        console.log('ICE connection state changed:', state);
        
        switch (state) {
            case 'connected':
            case 'completed':
                this.updateConnectionStatus('Connected');
                break;
            case 'disconnected':
                this.updateConnectionStatus('Connection lost');
                break;
            case 'failed':
                this.updateConnectionStatus('Connection failed');
                this.handleConnectionFailure();
                break;
            case 'closed':
                this.updateConnectionStatus('Connection closed');
                break;
        }
    }

    handleConnectionFailure() {
        console.log('Connection failed, attempting to reconnect...');
        // Attempt to restart the connection
        setTimeout(() => {
            if (this.peerConnection && this.peerConnection.iceConnectionState === 'failed') {
                this.restartConnection();
            }
        }, 2000);
    }

    async restartConnection() {
        try {
            // Create a new offer with ICE restart
            const offer = await this.peerConnection.createOffer({ iceRestart: true });
            await this.peerConnection.setLocalDescription(offer);
            
            this.socket.emit('offer', {
                offer: offer,
                roomId: this.roomId
            });
        } catch (error) {
            console.error('Error restarting connection:', error);
        }
    }

    setLocalStream(stream) {
        this.localStream = stream;
        
        // If peer connection exists, add tracks
        if (this.peerConnection) {
            stream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, stream);
            });
        }
    }

    closeConnection() {
        console.log('Closing WebRTC connection');
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Clear remote stream
        this.remoteStream = null;
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }

        // Reset state
        this.isInitiator = false;
        this.roomId = null;
    }

    handleUserLeft() {
        console.log('Remote user left');
        this.closeConnection();
        this.updateConnectionStatus('User disconnected');
    }

    handleRoomFull() {
        console.log('Room is full');
        this.updateConnectionStatus('Room is full, trying another...');
        
        // Automatically try to find another room
        if (window.saathiTV) {
            setTimeout(() => {
                window.saathiTV.nextUser();
            }, 2000);
        }
    }

    updateConnectionStatus(status) {
        if (window.saathiTV) {
            let statusText = status;
            let statusClass = 'connecting';
            
            switch (status) {
                case 'connected':
                case 'completed':
                case 'Connected':
                    statusText = 'Connected';
                    statusClass = 'connected';
                    break;
                case 'disconnected':
                case 'Connection lost':
                    statusText = 'Connection lost';
                    statusClass = 'disconnected';
                    break;
                case 'failed':
                case 'Connection failed':
                    statusText = 'Connection failed';
                    statusClass = 'disconnected';
                    break;
                case 'closed':
                case 'Connection closed':
                    statusText = 'Disconnected';
                    statusClass = 'disconnected';
                    break;
                default:
                    statusClass = 'connecting';
            }
            
            window.saathiTV.updateConnectionStatus(statusText, statusClass);
        }
    }

    // Media controls
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
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
                return audioTrack.enabled;
            }
        }
        return false;
    }

    // Screen sharing (future feature)
    async startScreenShare() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // Replace video track
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
            );

            if (sender) {
                await sender.replaceTrack(videoTrack);
            }

            // Handle screen share end
            videoTrack.onended = () => {
                this.stopScreenShare();
            };

            return true;
        } catch (error) {
            console.error('Error starting screen share:', error);
            return false;
        }
    }

    async stopScreenShare() {
        try {
            // Get camera stream back
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Replace screen track with camera track
            const videoTrack = cameraStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
            );

            if (sender) {
                await sender.replaceTrack(videoTrack);
            }

            // Update local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = cameraStream;
            }

            this.localStream = cameraStream;
            return true;
        } catch (error) {
            console.error('Error stopping screen share:', error);
            return false;
        }
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
                    if (report.kind === 'audio') {
                        result.audio.inbound = {
                            bytesReceived: report.bytesReceived,
                            packetsReceived: report.packetsReceived,
                            packetsLost: report.packetsLost
                        };
                    } else if (report.kind === 'video') {
                        result.video.inbound = {
                            bytesReceived: report.bytesReceived,
                            packetsReceived: report.packetsReceived,
                            packetsLost: report.packetsLost,
                            frameWidth: report.frameWidth,
                            frameHeight: report.frameHeight,
                            framesPerSecond: report.framesPerSecond
                        };
                    }
                } else if (report.type === 'outbound-rtp') {
                    if (report.kind === 'audio') {
                        result.audio.outbound = {
                            bytesSent: report.bytesSent,
                            packetsSent: report.packetsSent
                        };
                    } else if (report.kind === 'video') {
                        result.video.outbound = {
                            bytesSent: report.bytesSent,
                            packetsSent: report.packetsSent,
                            frameWidth: report.frameWidth,
                            frameHeight: report.frameHeight,
                            framesPerSecond: report.framesPerSecond
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
            console.error('Error getting stats:', error);
            return null;
        }
    }
}

// Initialize WebRTC manager
document.addEventListener('DOMContentLoaded', () => {
    window.webRTCManager = new WebRTCManager();
    
    // Connect to socket when available
    if (window.saathiTV && window.saathiTV.socket) {
        window.webRTCManager.setSocket(window.saathiTV.socket);
    }
});

// Export for use in other files
window.WebRTCManager = WebRTCManager;
