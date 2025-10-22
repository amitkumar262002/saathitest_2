// Online Message Passing System for Saathi TV

class OnlineMessageSystem {
    constructor() {
        this.socket = null;
        this.currentRoom = null;
        this.messageQueue = [];
        this.isConnected = false;
        this.messageHistory = [];
        this.typingTimeout = null;
        
        this.init();
    }

    init() {
        this.setupSocketConnection();
        this.setupMessageHandlers();
        this.setupUI();
        
        console.log('📡 Online Message System initialized');
    }

    setupSocketConnection() {
        // Initialize socket connection
        if (window.io) {
            this.socket = window.io();
            
            this.socket.on('connect', () => {
                this.isConnected = true;
                this.updateConnectionStatus('Connected', 'success');
                console.log('📡 Socket connected:', this.socket.id);
                
                // Send queued messages
                this.sendQueuedMessages();
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                this.updateConnectionStatus('Disconnected', 'error');
                console.log('📡 Socket disconnected');
            });

            this.socket.on('message', (data) => {
                this.receiveMessage(data);
            });

            this.socket.on('typing', (data) => {
                this.showTypingIndicator(data.from);
            });

            this.socket.on('stop-typing', (data) => {
                this.hideTypingIndicator(data.from);
            });

            this.socket.on('user-joined', (data) => {
                this.showSystemMessage(`${data.username || 'Someone'} joined the chat`);
            });

            this.socket.on('user-left', (data) => {
                this.showSystemMessage(`${data.username || 'Someone'} left the chat`);
            });
        }
    }

    setupMessageHandlers() {
        // Setup message input handlers
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            messageInput.addEventListener('input', () => {
                this.handleTyping();
            });

            messageInput.addEventListener('blur', () => {
                this.stopTyping();
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
    }

    setupUI() {
        // Create message display area if it doesn't exist
        this.ensureMessageDisplay();
        
        // Add connection status indicator
        this.addConnectionStatus();
    }

    ensureMessageDisplay() {
        let messageOverlay = document.getElementById('chatMessagesOverlay');
        
        if (!messageOverlay) {
            // Create message overlay on video
            const remoteVideoContainer = document.querySelector('.remote-video-container');
            if (remoteVideoContainer) {
                messageOverlay = document.createElement('div');
                messageOverlay.id = 'chatMessagesOverlay';
                messageOverlay.className = 'chat-messages-overlay';
                remoteVideoContainer.appendChild(messageOverlay);
            }
        }

        this.messageContainer = messageOverlay;
    }

    addConnectionStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (statusIndicator && statusText) {
            this.statusIndicator = statusIndicator;
            this.statusText = statusText;
            this.updateConnectionStatus('Connecting...', 'warning');
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const messageText = messageInput.value.trim();
        if (!messageText) return;

        const message = {
            id: this.generateMessageId(),
            text: messageText,
            timestamp: Date.now(),
            sender: 'me',
            type: 'text'
        };

        // Add to local display immediately
        this.displayMessage(message);
        
        // Add to history
        this.messageHistory.push(message);

        // Send via socket or queue if offline
        if (this.isConnected && this.socket) {
            this.socket.emit('message', {
                text: messageText,
                timestamp: message.timestamp,
                roomId: this.currentRoom
            });
        } else {
            this.messageQueue.push(message);
            this.showSystemMessage('Message queued - will send when connected');
        }

        // Clear input
        messageInput.value = '';
        this.stopTyping();

        // Auto-scroll to latest message
        this.scrollToLatest();
    }

    receiveMessage(data) {
        const message = {
            id: this.generateMessageId(),
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            sender: 'other',
            type: 'text',
            from: data.from
        };

        this.displayMessage(message);
        this.messageHistory.push(message);
        this.scrollToLatest();

        // Play notification sound
        this.playMessageSound();

        // Show notification if page is not visible
        if (document.hidden) {
            this.showDesktopNotification(message.text);
        }
    }

    displayMessage(message) {
        if (!this.messageContainer) {
            this.ensureMessageDisplay();
        }

        if (!this.messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message-item ${message.sender}`;
        messageElement.dataset.messageId = message.id;

        const timeString = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-content">
                <span class="message-text">${this.escapeHtml(message.text)}</span>
                <span class="message-time">${timeString}</span>
            </div>
        `;

        // Add animation
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        this.messageContainer.appendChild(messageElement);

        // Animate in
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });

        // Limit messages displayed
        this.limitDisplayedMessages();
    }

    showSystemMessage(text) {
        const message = {
            id: this.generateMessageId(),
            text: text,
            timestamp: Date.now(),
            sender: 'system',
            type: 'system'
        };

        this.displayMessage(message);
    }

    handleTyping() {
        if (!this.isConnected || !this.socket) return;

        // Send typing indicator
        this.socket.emit('typing', { roomId: this.currentRoom });

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Set timeout to stop typing
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 2000);
    }

    stopTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }

        if (this.isConnected && this.socket) {
            this.socket.emit('stop-typing', { roomId: this.currentRoom });
        }
    }

    showTypingIndicator(from) {
        // Show typing indicator in UI
        let typingIndicator = document.getElementById('typingIndicator');
        
        if (!typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.id = 'typingIndicator';
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text">Typing...</span>
            `;
            
            if (this.messageContainer) {
                this.messageContainer.appendChild(typingIndicator);
            }
        }

        typingIndicator.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideTypingIndicator();
        }, 5000);
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    sendQueuedMessages() {
        if (this.messageQueue.length === 0) return;

        console.log(`📤 Sending ${this.messageQueue.length} queued messages`);
        
        this.messageQueue.forEach(message => {
            if (this.socket) {
                this.socket.emit('message', {
                    text: message.text,
                    timestamp: message.timestamp,
                    roomId: this.currentRoom
                });
            }
        });

        this.messageQueue = [];
        this.showSystemMessage('Queued messages sent');
    }

    updateConnectionStatus(status, type) {
        if (this.statusText) {
            this.statusText.textContent = status;
        }

        if (this.statusIndicator) {
            this.statusIndicator.className = `status-indicator ${type}`;
        }

        // Update debug info
        const debugInfo = document.querySelector('.chat-debug-info');
        if (debugInfo) {
            const connectionText = debugInfo.querySelector('.debug-text');
            if (connectionText) {
                connectionText.textContent = `🌐 ${status}`;
            }
        }
    }

    joinRoom(roomId) {
        this.currentRoom = roomId;
        
        if (this.isConnected && this.socket) {
            this.socket.emit('joinRoom', { roomId: roomId });
            console.log('🏠 Joined room:', roomId);
        }
    }

    leaveRoom() {
        if (this.currentRoom && this.isConnected && this.socket) {
            this.socket.emit('leaveRoom', this.currentRoom);
            console.log('🚪 Left room:', this.currentRoom);
        }
        
        this.currentRoom = null;
        this.clearMessages();
    }

    clearMessages() {
        if (this.messageContainer) {
            this.messageContainer.innerHTML = '';
        }
        this.messageHistory = [];
    }

    limitDisplayedMessages() {
        if (!this.messageContainer) return;

        const messages = this.messageContainer.querySelectorAll('.chat-message-item');
        const maxMessages = 20;

        if (messages.length > maxMessages) {
            for (let i = 0; i < messages.length - maxMessages; i++) {
                messages[i].remove();
            }
        }
    }

    scrollToLatest() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }

    playMessageSound() {
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
            console.log('Could not play message sound');
        }
    }

    showDesktopNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New message on Saathi TV', {
                body: message.substring(0, 100),
                icon: 'assets/logo-professional.svg',
                tag: 'saathi-message'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods
    getMessageHistory() {
        return this.messageHistory;
    }

    getConnectionStatus() {
        return {
            connected: this.isConnected,
            room: this.currentRoom,
            queuedMessages: this.messageQueue.length
        };
    }

    exportChatHistory() {
        const chatData = {
            messages: this.messageHistory,
            timestamp: new Date().toISOString(),
            room: this.currentRoom
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `saathi-chat-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Enhanced CSS for message system
const messageSystemStyles = document.createElement('style');
messageSystemStyles.textContent = `
    /* Enhanced Chat Messages Overlay */
    .chat-messages-overlay {
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        max-height: 250px;
        overflow-y: auto;
        z-index: 5;
        pointer-events: none;
    }

    .chat-message-item {
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        margin-bottom: 10px;
        backdrop-filter: blur(15px);
        font-size: 14px;
        animation: messageSlideIn 0.3s ease-out;
        max-width: 85%;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .chat-message-item.me {
        background: rgba(255, 107, 53, 0.9);
        margin-left: auto;
        text-align: right;
        border-color: rgba(255, 107, 53, 0.3);
    }

    .chat-message-item.other {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border-color: rgba(255, 255, 255, 0.3);
    }

    .chat-message-item.system {
        background: rgba(255, 215, 0, 0.2);
        color: #FFD700;
        border: 1px solid rgba(255, 215, 0, 0.3);
        text-align: center;
        font-style: italic;
        font-size: 12px;
        margin: 5px auto;
        max-width: 70%;
    }

    .message-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .message-text {
        line-height: 1.4;
        word-wrap: break-word;
    }

    .message-time {
        font-size: 10px;
        opacity: 0.7;
        align-self: flex-end;
    }

    .chat-message-item.other .message-time {
        align-self: flex-start;
    }

    /* Typing Indicator */
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.9);
        color: #666;
        padding: 8px 15px;
        border-radius: 20px;
        margin-bottom: 10px;
        font-size: 12px;
        max-width: 120px;
        animation: messageSlideIn 0.3s ease-out;
    }

    .typing-dots {
        display: flex;
        gap: 3px;
    }

    .typing-dots span {
        width: 4px;
        height: 4px;
        background: #666;
        border-radius: 50%;
        animation: typingDot 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    .typing-dots span:nth-child(3) { animation-delay: 0s; }

    @keyframes typingDot {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
    }

    /* Connection Status */
    .status-indicator.success {
        background: #4CAF50;
        box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }

    .status-indicator.warning {
        background: #FF9800;
        box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
    }

    .status-indicator.error {
        background: #f44336;
        box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
    }

    /* Scrollbar for message overlay */
    .chat-messages-overlay::-webkit-scrollbar {
        width: 4px;
    }

    .chat-messages-overlay::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
    }

    .chat-messages-overlay::-webkit-scrollbar-thumb {
        background: rgba(255, 215, 0, 0.5);
        border-radius: 2px;
    }

    .chat-messages-overlay::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 215, 0, 0.7);
    }

    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

document.head.appendChild(messageSystemStyles);

// Initialize the online message system
document.addEventListener('DOMContentLoaded', () => {
    window.onlineMessageSystem = new OnlineMessageSystem();
    
    // Request notification permission
    window.onlineMessageSystem.requestNotificationPermission();
});

// Export for global use
window.OnlineMessageSystem = OnlineMessageSystem;
