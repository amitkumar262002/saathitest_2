// Chat functionality for Saathi TV
class ChatManager {
    constructor() {
        this.socket = null;
        this.messages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.maxMessageLength = 200;
        this.messageHistory = [];
        this.currentHistoryIndex = -1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    setSocket(socket) {
        this.socket = socket;
        this.setupSocketListeners();
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateHistory('up');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateHistory('down');
                } else {
                    this.handleTyping();
                }
            });

            messageInput.addEventListener('input', (e) => {
                this.handleInput(e);
            });

            messageInput.addEventListener('paste', (e) => {
                this.handlePaste(e);
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }
    }

    setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('message', (data) => {
            this.receiveMessage(data);
        });

        this.socket.on('typing', (data) => {
            this.showTypingIndicator(data);
        });

        this.socket.on('stop-typing', () => {
            this.hideTypingIndicator();
        });

        this.socket.on('message-deleted', (messageId) => {
            this.deleteMessage(messageId);
        });

        this.socket.on('user-blocked', () => {
            this.handleUserBlocked();
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || !this.socket) return;

        // Validate message
        if (message.length > this.maxMessageLength) {
            this.showError(`Message too long. Maximum ${this.maxMessageLength} characters.`);
            return;
        }

        // Check for inappropriate content (basic filter)
        if (this.containsInappropriateContent(message)) {
            this.showError('Message contains inappropriate content.');
            return;
        }

        // Create message object
        const messageData = {
            id: this.generateMessageId(),
            text: message,
            timestamp: Date.now(),
            sender: 'me'
        };

        // Add to local messages
        this.addMessage(messageData);

        // Add to history
        this.messageHistory.unshift(message);
        if (this.messageHistory.length > 10) {
            this.messageHistory.pop();
        }
        this.currentHistoryIndex = -1;

        // Send to server
        this.socket.emit('message', {
            text: message,
            roomId: window.webRTCManager?.roomId
        });

        // Clear input
        messageInput.value = '';
        this.stopTyping();
    }

    receiveMessage(data) {
        const messageData = {
            id: data.id || this.generateMessageId(),
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            sender: 'other'
        };

        this.addMessage(messageData);
        this.playMessageSound();
    }

    addMessage(messageData) {
        this.messages.push(messageData);
        this.renderMessage(messageData);
        this.scrollToBottom();

        // Limit message history
        if (this.messages.length > 100) {
            this.messages.shift();
            this.removeOldestMessage();
        }
    }

    renderMessage(messageData) {
        const chatContainer = this.getChatContainer();
        if (!chatContainer) return;

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
            ${messageData.sender === 'me' ? '<div class="message-status"></div>' : ''}
        `;

        // Add animation
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        chatContainer.appendChild(messageElement);

        // Animate in
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }

    getChatContainer() {
        let container = document.querySelector('.chat-container');
        
        if (!container) {
            // Create chat container if it doesn't exist
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                container = document.createElement('div');
                container.className = 'chat-container';
                chatMessages.insertBefore(container, chatMessages.firstChild);
            }
        }
        
        return container;
    }

    scrollToBottom() {
        const container = this.getChatContainer();
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    handleTyping() {
        if (!this.isTyping && this.socket) {
            this.isTyping = true;
            this.socket.emit('typing', {
                roomId: window.webRTCManager?.roomId
            });
        }

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Set new timeout
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        if (this.isTyping && this.socket) {
            this.isTyping = false;
            this.socket.emit('stop-typing', {
                roomId: window.webRTCManager?.roomId
            });
        }

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    }

    showTypingIndicator(data) {
        let indicator = document.querySelector('.typing-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.innerHTML = `
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text">Typing...</span>
            `;
            
            const container = this.getChatContainer();
            if (container) {
                container.appendChild(indicator);
                this.scrollToBottom();
            }
        }
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    handleInput(e) {
        const input = e.target;
        const remaining = this.maxMessageLength - input.value.length;
        
        // Update character counter
        this.updateCharacterCounter(remaining);
        
        // Handle typing indicator
        if (input.value.trim()) {
            this.handleTyping();
        } else {
            this.stopTyping();
        }
    }

    updateCharacterCounter(remaining) {
        let counter = document.querySelector('.character-counter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'character-counter';
            const messageInput = document.getElementById('messageInput');
            if (messageInput && messageInput.parentNode) {
                messageInput.parentNode.appendChild(counter);
            }
        }
        
        counter.textContent = `${remaining} characters remaining`;
        counter.style.color = remaining < 20 ? '#f44336' : '#666';
    }

    handlePaste(e) {
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const input = e.target;
        const currentLength = input.value.length;
        
        if (currentLength + paste.length > this.maxMessageLength) {
            e.preventDefault();
            const allowedLength = this.maxMessageLength - currentLength;
            const truncatedPaste = paste.substring(0, allowedLength);
            
            // Insert truncated text
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.substring(0, start) + truncatedPaste + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start + truncatedPaste.length;
            
            this.showError('Pasted text was truncated to fit character limit.');
        }
    }

    navigateHistory(direction) {
        if (this.messageHistory.length === 0) return;
        
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;
        
        if (direction === 'up') {
            if (this.currentHistoryIndex < this.messageHistory.length - 1) {
                this.currentHistoryIndex++;
                messageInput.value = this.messageHistory[this.currentHistoryIndex];
            }
        } else if (direction === 'down') {
            if (this.currentHistoryIndex > 0) {
                this.currentHistoryIndex--;
                messageInput.value = this.messageHistory[this.currentHistoryIndex];
            } else if (this.currentHistoryIndex === 0) {
                this.currentHistoryIndex = -1;
                messageInput.value = '';
            }
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
            
            // Escape to clear input
            if (e.key === 'Escape') {
                const messageInput = document.getElementById('messageInput');
                if (messageInput && messageInput.value) {
                    messageInput.value = '';
                    this.stopTyping();
                }
            }
        });
    }

    containsInappropriateContent(message) {
        // Basic inappropriate content filter
        const inappropriateWords = [
            // Add inappropriate words here
            'spam', 'advertisement', 'promotion'
        ];
        
        const lowerMessage = message.toLowerCase();
        return inappropriateWords.some(word => lowerMessage.includes(word));
    }

    deleteMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateX(-100%)';
            
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }
        
        // Remove from messages array
        this.messages = this.messages.filter(msg => msg.id !== messageId);
    }

    removeOldestMessage() {
        const firstMessage = document.querySelector('.chat-message');
        if (firstMessage) {
            firstMessage.remove();
        }
    }

    clearChat() {
        const container = this.getChatContainer();
        if (container) {
            container.innerHTML = '';
        }
        this.messages = [];
        this.hideTypingIndicator();
    }

    handleUserBlocked() {
        this.showError('User has been blocked. You cannot send messages.');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        
        if (messageInput) messageInput.disabled = true;
        if (sendButton) sendButton.disabled = true;
    }

    playMessageSound() {
        // Create a subtle notification sound
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
            // Fallback: no sound if audio context fails
            console.log('Could not play notification sound');
        }
    }

    showError(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert(message);
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

    // Emoji support
    addEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            const start = messageInput.selectionStart;
            const end = messageInput.selectionEnd;
            const text = messageInput.value;
            
            messageInput.value = text.substring(0, start) + emoji + text.substring(end);
            messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
            messageInput.focus();
        }
    }

    // Message formatting
    formatMessage(text) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert newlines to <br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
}

// Add CSS for chat styling
const chatStyles = `
<style>
.chat-container {
    max-height: 150px;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 10px;
}

.chat-message {
    margin-bottom: 10px;
    display: flex;
    align-items: flex-end;
}

.chat-message.me {
    justify-content: flex-end;
}

.chat-message.other {
    justify-content: flex-start;
}

.message-content {
    max-width: 70%;
    padding: 8px 12px;
    border-radius: 18px;
    position: relative;
}

.chat-message.me .message-content {
    background: #FF6B35;
    color: white;
    border-bottom-right-radius: 4px;
}

.chat-message.other .message-content {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border-bottom-left-radius: 4px;
}

.message-text {
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
}

.message-time {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 2px;
}

.typing-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    margin-bottom: 10px;
    max-width: fit-content;
}

.typing-dots {
    display: flex;
    gap: 2px;
}

.typing-dots span {
    width: 4px;
    height: 4px;
    background: #666;
    border-radius: 50%;
    animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-10px);
    }
}

.typing-text {
    font-size: 12px;
    color: #666;
    font-style: italic;
}

.character-counter {
    font-size: 11px;
    text-align: right;
    margin-top: 5px;
    color: #666;
}

.message-status {
    width: 12px;
    height: 12px;
    margin-left: 5px;
    margin-bottom: 2px;
}

.message-status.sent::after {
    content: '✓';
    color: #ccc;
    font-size: 12px;
}

.message-status.delivered::after {
    content: '✓✓';
    color: #4CAF50;
    font-size: 12px;
}

/* Scrollbar for chat container */
.chat-container::-webkit-scrollbar {
    width: 4px;
}

.chat-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
}

.chat-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}
</style>
`;

// Inject chat styles
document.head.insertAdjacentHTML('beforeend', chatStyles);

// Initialize chat manager
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
    
    // Connect to socket when available
    if (window.saathiTV && window.saathiTV.socket) {
        window.chatManager.setSocket(window.saathiTV.socket);
    }
});

// Export for use in other files
window.ChatManager = ChatManager;
