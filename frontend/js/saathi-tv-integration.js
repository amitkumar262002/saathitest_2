// Saathi TV Integration - Clean WebRTC System
// This file replaces all conflicting WebRTC systems with a unified solution

console.log('🔧 Saathi TV Integration loading...');

class SaathiTVIntegration {
    constructor() {
        this.webrtcClient = null;
        this.isVideoVisible = false;
        this.currentPreferences = {};
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Saathi TV Integration...');
        
        // Wait for WebRTC client to be ready
        this.waitForWebRTCClient();
        
        // Setup UI event handlers
        this.setupUIHandlers();
        
        // Override conflicting systems
        this.overrideConflictingSystems();
        
        // Setup video chat controls
        this.setupVideoControls();
        
        console.log('✅ Saathi TV Integration ready');
    }

    waitForWebRTCClient() {
        const checkClient = () => {
            if (window.webrtcClient) {
                this.webrtcClient = window.webrtcClient;
                console.log('✅ WebRTC Client connected');
                return;
            }
            setTimeout(checkClient, 100);
        };
        checkClient();
    }

    setupUIHandlers() {
        // Handle start video chat button
        const startButton = document.getElementById('mainChatBtn');
        if (startButton) {
            // Remove existing onclick handlers
            startButton.removeAttribute('onclick');
            
            // Add new handler
            startButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleStartVideoChat();
            });
            
            console.log('📱 Start button handler attached');
        }

        // Handle connection status changes
        window.addEventListener('connectionStatusChanged', (event) => {
            this.updateConnectionUI(event.detail);
        });

        // Handle chat messages
        window.addEventListener('chatMessage', (event) => {
            this.displayChatMessage(event.detail);
        });
    }

    async handleStartVideoChat() {
        console.log('🎬 Starting video chat...');
        
        try {
            // Check if user is logged in
            if (!this.isUserLoggedIn()) {
                console.log('❌ User not logged in');
                alert('Please login first to start video chat!');
                this.redirectToLogin();
                return;
            }

            // Get user preferences
            this.currentPreferences = this.getUserPreferences();
            
            // Show video chat interface
            this.showVideoChat();
            
            // Wait for WebRTC client and start matching
            if (this.webrtcClient) {
                await this.webrtcClient.findMatch(this.currentPreferences);
            } else {
                throw new Error('WebRTC client not ready');
            }
            
        } catch (error) {
            console.error('❌ Error starting video chat:', error);
            alert(`Failed to start video chat: ${error.message}`);
            this.hideVideoChat();
        }
    }

    getUserPreferences() {
        const countrySelect = document.getElementById('countrySelect');
        const genderSelect = document.getElementById('genderSelect');
        
        return {
            country: countrySelect ? countrySelect.value : 'any',
            gender: genderSelect ? genderSelect.value : 'any'
        };
    }

    showVideoChat() {
        console.log('📺 Showing video chat interface...');
        
        const heroSection = document.querySelector('.hero');
        const videoChatSection = document.getElementById('videoChat');
        const navbar = document.querySelector('.navbar');
        
        if (heroSection) heroSection.style.display = 'none';
        if (videoChatSection) {
            videoChatSection.style.display = 'block';
            videoChatSection.classList.add('fade-in');
        }
        if (navbar) navbar.style.display = 'none';
        
        this.isVideoVisible = true;
        
        // Update button states
        this.updateStartButtonState('connecting');
    }

    hideVideoChat() {
        console.log('📺 Hiding video chat interface...');
        
        const heroSection = document.querySelector('.hero');
        const videoChatSection = document.getElementById('videoChat');
        const navbar = document.querySelector('.navbar');
        
        if (heroSection) heroSection.style.display = 'flex';
        if (videoChatSection) videoChatSection.style.display = 'none';
        if (navbar) navbar.style.display = 'block';
        
        this.isVideoVisible = false;
        
        // Cleanup WebRTC
        if (this.webrtcClient) {
            this.webrtcClient.cleanup();
        }
        
        // Reset button states
        this.updateStartButtonState('ready');
    }

    updateStartButtonState(state) {
        const startButton = document.getElementById('mainChatBtn');
        if (!startButton) return;
        
        const btnText = startButton.querySelector('.btn-main-text');
        const btnIcon = startButton.querySelector('.btn-icon i');
        
        switch (state) {
            case 'connecting':
                if (btnText) btnText.textContent = 'Connecting...';
                if (btnIcon) btnIcon.className = 'fas fa-spinner fa-spin';
                startButton.disabled = true;
                break;
            case 'connected':
                if (btnText) btnText.textContent = 'Connected';
                if (btnIcon) btnIcon.className = 'fas fa-check';
                startButton.disabled = true;
                break;
            case 'ready':
            default:
                if (btnText) btnText.textContent = 'Start Video Chat';
                if (btnIcon) btnIcon.className = 'fas fa-video';
                startButton.disabled = false;
                break;
        }
    }

    setupVideoControls() {
        // Next user button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.webrtcClient) {
                    this.webrtcClient.findNext(this.currentPreferences);
                }
            });
        }

        // Audio toggle
        const audioBtn = document.getElementById('toggleAudio');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                if (this.webrtcClient) {
                    const enabled = this.webrtcClient.toggleAudio();
                    audioBtn.classList.toggle('active', enabled);
                    audioBtn.classList.toggle('inactive', !enabled);
                }
            });
        }

        // Video toggle (if exists)
        const videoBtn = document.getElementById('toggleVideo');
        if (videoBtn) {
            videoBtn.addEventListener('click', () => {
                if (this.webrtcClient) {
                    const enabled = this.webrtcClient.toggleVideo();
                    videoBtn.classList.toggle('active', enabled);
                    videoBtn.classList.toggle('inactive', !enabled);
                }
            });
        }

        // Chat toggle
        const chatBtn = document.getElementById('chatToggleBtn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        // Stop/Leave button (if exists)
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.handleStopChat();
            });
        }

        console.log('🎮 Video controls setup complete');
    }

    handleStopChat() {
        if (confirm('Are you sure you want to stop the video chat?')) {
            this.hideVideoChat();
        }
    }

    toggleChat() {
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) {
            chatPanel.classList.toggle('hidden');
        }
    }

    displayChatMessage({ from, message, timestamp }) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message received';
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(message)}</div>
            <div class="message-time">${new Date(timestamp).toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput || !this.webrtcClient) return;

        const message = chatInput.value.trim();
        if (message) {
            // Send message
            this.webrtcClient.sendChatMessage(message);
            
            // Display in UI
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'chat-message sent';
                messageDiv.innerHTML = `
                    <div class="message-content">${this.escapeHtml(message)}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                `;
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Clear input
            chatInput.value = '';
        }
    }

    updateConnectionUI({ text, status }) {
        // Update status text and indicator
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        
        if (statusText) {
            statusText.textContent = text;
        }
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${status}`;
        }

        // Update button state based on connection status
        switch (status) {
            case 'connecting':
                this.updateStartButtonState('connecting');
                break;
            case 'connected':
                this.updateStartButtonState('connected');
                break;
            case 'disconnected':
            case 'error':
                if (this.isVideoVisible) {
                    // Show reconnect option
                    setTimeout(() => {
                        if (confirm('Connection lost. Would you like to find someone new?')) {
                            if (this.webrtcClient) {
                                this.webrtcClient.findNext(this.currentPreferences);
                            }
                        } else {
                            this.hideVideoChat();
                        }
                    }, 2000);
                }
                break;
        }
    }

    // Override conflicting systems to prevent interference
    overrideConflictingSystems() {
        console.log('🚫 Overriding conflicting systems...');
        
        // Disable peer matching system
        if (window.peerMatchingSystem) {
            window.peerMatchingSystem.cleanup = () => {};
            window.peerMatchingSystem.isConnected = false;
        }
        
        // Disable instant connect
        if (window.instantConnect) {
            window.instantConnect.connected = false;
            window.instantConnect.cleanup = () => {};
        }
        
        // Override auto-join manager
        if (window.autoJoinManager) {
            window.autoJoinManager.startAutoJoin = (country, gender) => {
                console.log('🔄 Redirecting to unified WebRTC system');
                this.currentPreferences = { country, gender };
                if (this.webrtcClient) {
                    this.webrtcClient.findMatch(this.currentPreferences);
                }
            };
            
            window.autoJoinManager.findNextUser = () => {
                console.log('⏭️ Redirecting to unified next user');
                if (this.webrtcClient) {
                    this.webrtcClient.findNext(this.currentPreferences);
                }
            };
        }
        
        // Override global functions that might conflict
        window.nextUser = () => {
            if (this.webrtcClient) {
                this.webrtcClient.findNext(this.currentPreferences);
            }
        };
        
        window.startVideoChat = () => {
            this.handleStartVideoChat();
        };
        
        window.sendMessage = () => {
            this.sendChatMessage();
        };
        
        console.log('✅ Conflicting systems overridden');
    }

    // Utility functions
    isUserLoggedIn() {
        // Check Firebase authentication
        if (window.firebaseAuthManager && window.firebaseAuthManager.isUserLoggedIn()) {
            return true;
        }
        
        // Check localStorage
        const currentUser = localStorage.getItem('saathi_current_user');
        if (currentUser) {
            try {
                const userData = JSON.parse(currentUser);
                return !!userData.id;
            } catch (e) {
                localStorage.removeItem('saathi_current_user');
            }
        }
        
        return false;
    }

    redirectToLogin() {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?return=${currentUrl}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.saathiTVIntegration = new SaathiTVIntegration();
        console.log('🎯 Saathi TV Integration initialized');
    }, 1000);
});

// Setup chat input handler
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (window.saathiTVIntegration) {
                    window.saathiTVIntegration.sendChatMessage();
                }
            }
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            if (window.saathiTVIntegration) {
                window.saathiTVIntegration.sendChatMessage();
            }
        });
    }
});

console.log('🔧 Saathi TV Integration loaded successfully');
