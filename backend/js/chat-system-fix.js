// Complete Chat System Fix for Saathi TV

class ChatSystemFix {
    constructor() {
        this.isInitialized = false;
        this.chatContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.audioVideoControls = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.fixChatLayout();
        this.fixAudioControls();
        this.setupMessageSystem();
        this.integrateSystems();
        
        console.log('✅ Chat System Fix applied successfully');
        this.isInitialized = true;
    }

    fixChatLayout() {
        // Ensure chat section exists and is properly positioned
        const videoContainer = document.querySelector('.video-container');
        if (!videoContainer) return;

        let chatSection = document.getElementById('chatSection');
        if (!chatSection) {
            // Create chat section if it doesn't exist
            chatSection = document.createElement('div');
            chatSection.id = 'chatSection';
            chatSection.className = 'chat-section';
            videoContainer.appendChild(chatSection);
        }

        // Ensure proper structure
        if (!chatSection.querySelector('.chat-messages')) {
            chatSection.innerHTML = `
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-container"></div>
                </div>
                <div class="message-input-container">
                    <input type="text" id="messageInput" placeholder="Type a message..." maxlength="200">
                    <button id="sendMessage" class="send-btn">💬</button>
                </div>
            `;
        }

        // Store references
        this.chatContainer = chatSection.querySelector('.chat-container');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
    }

    fixAudioControls() {
        // Fix toggleAudio button functionality
        const toggleAudio = document.getElementById('toggleAudio');
        const toggleVideo = document.getElementById('toggleVideo');
        const videoOffBtn = document.getElementById('videoOffBtn');
        
        if (toggleAudio) {
            // Remove existing event listeners
            toggleAudio.replaceWith(toggleAudio.cloneNode(true));
            const newToggleAudio = document.getElementById('toggleAudio');
            
            newToggleAudio.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleAudioToggle();
            });
            
            // Add keyboard shortcut
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'm' && !this.isInputFocused()) {
                    e.preventDefault();
                    this.handleAudioToggle();
                }
            });
        }

        if (toggleVideo) {
            // Remove existing event listeners
            toggleVideo.replaceWith(toggleVideo.cloneNode(true));
            const newToggleVideo = document.getElementById('toggleVideo');
            
            newToggleVideo.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleVideoToggle();
            });
            
            // Add keyboard shortcut
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'v' && !this.isInputFocused()) {
                    e.preventDefault();
                    this.handleVideoToggle();
                }
            });
        }

        if (videoOffBtn) {
            // Remove existing event listeners
            videoOffBtn.replaceWith(videoOffBtn.cloneNode(true));
            const newVideoOffBtn = document.getElementById('videoOffBtn');
            
            newVideoOffBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleVideoOff();
            });
        }
    }

    handleAudioToggle() {
        const localVideo = document.getElementById('localVideo');
        const toggleBtn = document.getElementById('toggleAudio');
        
        if (!localVideo || !localVideo.srcObject) {
            this.showNotification('No audio stream available', 'error');
            return;
        }

        const audioTracks = localVideo.srcObject.getAudioTracks();
        if (audioTracks.length === 0) {
            this.showNotification('No microphone found', 'error');
            return;
        }

        const audioTrack = audioTracks[0];
        const isEnabled = audioTrack.enabled;
        
        // Toggle audio
        audioTrack.enabled = !isEnabled;
        
        // Update button appearance
        if (audioTrack.enabled) {
            toggleBtn.classList.add('active');
            toggleBtn.classList.remove('inactive');
            toggleBtn.title = 'Turn off microphone (M)';
            this.showNotification('🎤 Microphone ON', 'success');
        } else {
            toggleBtn.classList.remove('active');
            toggleBtn.classList.add('inactive');
            toggleBtn.title = 'Turn on microphone (M)';
            this.showNotification('🔇 Microphone OFF', 'info');
        }

        // Add visual feedback
        this.addButtonFeedback(toggleBtn);
        
        console.log(`🎤 Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
    }

    handleVideoOff() {
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const videoContainer = document.querySelector('.video-main-container');
        
        if (videoContainer) {
            videoContainer.classList.toggle('video-off');
            const isVideoOff = videoContainer.classList.contains('video-off');
            
            if (isVideoOff) {
                this.showNotification('📹 Video turned OFF', 'info');
            } else {
                this.showNotification('📹 Video turned ON', 'success');
            }
        }
    }

    handleVideoToggle() {
        const localVideo = document.getElementById('localVideo');
        const toggleBtn = document.getElementById('toggleVideo');
        
        if (!localVideo || !localVideo.srcObject) {
            this.showNotification('No video stream available', 'error');
            return;
        }

        const videoTracks = localVideo.srcObject.getVideoTracks();
        if (videoTracks.length === 0) {
            this.showNotification('No camera found', 'error');
            return;
        }

        const videoTrack = videoTracks[0];
        const isEnabled = videoTrack.enabled;
        
        // Toggle video
        videoTrack.enabled = !isEnabled;
        
        // Update button appearance
        if (videoTrack.enabled) {
            toggleBtn.classList.add('active');
            toggleBtn.classList.remove('inactive');
            toggleBtn.title = 'Turn off camera (V)';
            localVideo.style.opacity = '1';
            this.showNotification('Camera turned on', 'success');
        } else {
            toggleBtn.classList.remove('active');
            toggleBtn.classList.add('inactive');
            toggleBtn.title = 'Turn on camera (V)';
            localVideo.style.opacity = '0.3';
            this.showNotification('Camera turned off', 'info');
        }

        // Add visual feedback
        this.addButtonFeedback(toggleBtn);
        
        console.log(`🎥 Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
    }

    setupMessageSystem() {
        if (!this.messageInput || !this.sendButton) return;

        // Remove existing event listeners
        this.messageInput.replaceWith(this.messageInput.cloneNode(true));
        this.sendButton.replaceWith(this.sendButton.cloneNode(true));
        
        // Get new references
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');

        // Add event listeners
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Add input validation
        this.messageInput.addEventListener('input', (e) => {
            const remaining = 200 - e.target.value.length;
            if (remaining < 20) {
                e.target.style.borderColor = '#f44336';
            } else {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
    }

    sendMessage() {
        if (!this.messageInput) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        if (message.length > 200) {
            this.showNotification('Message too long (max 200 characters)', 'error');
            return;
        }

        // Create message object
        const messageData = {
            id: this.generateId(),
            text: message,
            timestamp: Date.now(),
            sender: 'me'
        };

        // Add to chat
        this.addMessageToChat(messageData);

        // Send to other user (if socket available)
        if (window.saathiTV && window.saathiTV.socket) {
            window.saathiTV.socket.emit('message', {
                text: message,
                timestamp: messageData.timestamp
            });
        }

        // Clear input
        this.messageInput.value = '';
        this.messageInput.focus();

        // Add send button feedback
        this.addButtonFeedback(this.sendButton);
    }

    addMessageToChat(messageData) {
        if (!this.chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${messageData.sender}`;
        messageElement.dataset.messageId = messageData.id;

        const timeString = new Date(messageData.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(messageData.text)}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;

        // Add with animation
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        this.chatContainer.appendChild(messageElement);

        // Animate in
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });

        // Scroll to bottom
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

        // Limit messages
        const messages = this.chatContainer.querySelectorAll('.chat-message');
        if (messages.length > 50) {
            messages[0].remove();
        }
    }

    receiveMessage(data) {
        const messageData = {
            id: this.generateId(),
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            sender: 'other'
        };

        this.addMessageToChat(messageData);
        this.playNotificationSound();
    }

    integrateSystems() {
        // Integrate with existing chat manager
        if (window.chatManager) {
            const originalReceiveMessage = window.chatManager.receiveMessage;
            window.chatManager.receiveMessage = (data) => {
                this.receiveMessage(data);
            };
        }

        // Integrate with socket system
        if (window.saathiTV && window.saathiTV.socket) {
            window.saathiTV.socket.on('message', (data) => {
                this.receiveMessage(data);
            });
        }

        // Setup integration when socket becomes available
        const checkSocket = () => {
            if (window.saathiTV && window.saathiTV.socket && !this.socketIntegrated) {
                window.saathiTV.socket.on('message', (data) => {
                    this.receiveMessage(data);
                });
                this.socketIntegrated = true;
            }
        };

        // Check periodically for socket
        setInterval(checkSocket, 1000);
    }

    addButtonFeedback(button) {
        if (!button) return;

        // Scale animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);

        // Ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            top: 0;
            left: 0;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `chat-notification ${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '25px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            backdropFilter: 'blur(10px)'
        });

        const colors = {
            info: 'linear-gradient(45deg, #2196F3, #21CBF3)',
            success: 'linear-gradient(45deg, #4CAF50, #45a049)',
            warning: 'linear-gradient(45deg, #FF9800, #F57C00)',
            error: 'linear-gradient(45deg, #f44336, #d32f2f)'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Could not play notification sound');
        }
    }

    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods for external integration
    onChatStart() {
        if (this.chatContainer) {
            this.chatContainer.innerHTML = '';
        }
        
        // Show welcome message
        setTimeout(() => {
            this.addMessageToChat({
                id: this.generateId(),
                text: 'Connected! Say hello 👋',
                timestamp: Date.now(),
                sender: 'system'
            });
        }, 500);
    }

    onChatStop() {
        if (this.chatContainer) {
            this.chatContainer.innerHTML = '';
        }
    }
}

// Add enhanced CSS for the fixed chat system
const chatSystemStyles = document.createElement('style');
chatSystemStyles.textContent = `
    /* Enhanced Chat System Styles */
    .chat-section {
        position: absolute !important;
        bottom: 20px !important;
        left: 20px !important;
        right: 20px !important;
        background: rgba(0, 0, 0, 0.9) !important;
        border-radius: 15px !important;
        backdrop-filter: blur(15px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
        display: flex !important;
        flex-direction: column !important;
        max-height: 300px !important;
        z-index: 1000 !important;
    }

    .chat-messages {
        flex: 1 !important;
        overflow: hidden !important;
        padding: 15px 15px 10px 15px !important;
    }

    .chat-container {
        max-height: 200px !important;
        overflow-y: auto !important;
        padding-right: 5px !important;
    }

    .chat-message {
        margin-bottom: 12px !important;
        display: flex !important;
        align-items: flex-end !important;
        animation: messageSlideIn 0.3s ease-out !important;
    }

    .chat-message.me {
        justify-content: flex-end !important;
    }

    .chat-message.other {
        justify-content: flex-start !important;
    }

    .chat-message.system {
        justify-content: center !important;
    }

    .message-content {
        max-width: 70% !important;
        padding: 10px 15px !important;
        border-radius: 20px !important;
        position: relative !important;
        word-wrap: break-word !important;
    }

    .chat-message.me .message-content {
        background: linear-gradient(45deg, #FF6B35, #F7931E) !important;
        color: white !important;
        border-bottom-right-radius: 6px !important;
    }

    .chat-message.other .message-content {
        background: rgba(255, 255, 255, 0.9) !important;
        color: #333 !important;
        border-bottom-left-radius: 6px !important;
    }

    .chat-message.system .message-content {
        background: rgba(255, 215, 0, 0.2) !important;
        color: #FFD700 !important;
        border: 1px solid rgba(255, 215, 0, 0.3) !important;
        font-style: italic !important;
        max-width: 80% !important;
    }

    .message-text {
        font-size: 14px !important;
        line-height: 1.4 !important;
        margin-bottom: 4px !important;
    }

    .message-time {
        font-size: 11px !important;
        opacity: 0.7 !important;
    }

    .message-input-container {
        display: flex !important;
        gap: 12px !important;
        padding: 12px 15px 15px 15px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(0, 0, 0, 0.3) !important;
        border-radius: 0 0 15px 15px !important;
    }

    #messageInput {
        flex: 1 !important;
        padding: 12px 18px !important;
        border: 2px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 25px !important;
        background: rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        font-size: 14px !important;
        outline: none !important;
        transition: all 0.3s ease !important;
        backdrop-filter: blur(10px) !important;
    }

    #messageInput:focus {
        border-color: #FFD700 !important;
        background: rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3) !important;
    }

    #messageInput::placeholder {
        color: rgba(255, 255, 255, 0.6) !important;
    }

    .send-btn {
        padding: 12px 20px !important;
        background: linear-gradient(45deg, #FF6B35, #F7931E) !important;
        color: white !important;
        border: none !important;
        border-radius: 25px !important;
        cursor: pointer !important;
        font-weight: bold !important;
        font-size: 16px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3) !important;
        min-width: 60px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }

    .send-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
    }

    .send-btn:active {
        transform: translateY(0) !important;
    }

    /* Control Button Enhancements */
    .control-btn {
        position: relative !important;
        transition: all 0.3s ease !important;
        overflow: hidden !important;
    }

    .control-btn.active {
        background: linear-gradient(45deg, #4CAF50, #45a049) !important;
        color: white !important;
        box-shadow: 0 0 20px rgba(76, 175, 80, 0.4) !important;
    }

    .control-btn.inactive {
        background: linear-gradient(45deg, #f44336, #d32f2f) !important;
        color: white !important;
        box-shadow: 0 0 20px rgba(244, 67, 54, 0.4) !important;
    }

    .control-btn:hover {
        transform: scale(1.05) !important;
    }

    /* Scrollbar for chat */
    .chat-container::-webkit-scrollbar {
        width: 6px !important;
    }

    .chat-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 3px !important;
    }

    .chat-container::-webkit-scrollbar-thumb {
        background: rgba(255, 215, 0, 0.4) !important;
        border-radius: 3px !important;
    }

    .chat-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 215, 0, 0.6) !important;
    }

    /* Animations */
    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .chat-section {
            left: 10px !important;
            right: 10px !important;
            bottom: 10px !important;
            max-height: 250px !important;
        }

        .message-content {
            max-width: 85% !important;
            padding: 8px 12px !important;
        }

        .message-input-container {
            padding: 10px !important;
            gap: 8px !important;
        }

        #messageInput {
            padding: 10px 15px !important;
            font-size: 16px !important; /* Prevents zoom on iOS */
        }

        .send-btn {
            padding: 10px 15px !important;
            min-width: 50px !important;
        }
    }
`;

document.head.appendChild(chatSystemStyles);

// Initialize the chat system fix
document.addEventListener('DOMContentLoaded', () => {
    window.chatSystemFix = new ChatSystemFix();
});

// Export for global use
window.ChatSystemFix = ChatSystemFix;
