// Real-Time Features for Saathi TV

class RealTimeManager {
    constructor() {
        this.startTime = Date.now();
        this.sessionTime = 0;
        this.chatTime = 0;
        this.isInChat = false;
        this.chatStartTime = null;
        this.timers = new Map();
        this.realTimeData = {
            onlineUsers: 0,
            activeChats: 0,
            serverLoad: 0,
            connectionQuality: 'Good'
        };
        
        this.init();
    }

    init() {
        this.createTimeDisplays();
        this.startRealTimeUpdates();
        this.setupConnectionMonitoring();
        this.startUserCountAnimation();
        console.log('⏰ Real-Time Manager initialized');
    }

    createTimeDisplays() {
        // Add real-time clock to navigation
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            const clockElement = document.createElement('div');
            clockElement.className = 'real-time-clock';
            clockElement.innerHTML = `
                <div class="clock-display">
                    <span class="time" id="currentTime">00:00:00</span>
                    <span class="date" id="currentDate">Loading...</span>
                </div>
            `;
            navContainer.appendChild(clockElement);
        }

        // Add session timer to user status
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            const sessionTimer = document.createElement('div');
            sessionTimer.className = 'session-timer';
            sessionTimer.innerHTML = `
                <span class="timer-label">Session:</span>
                <span class="timer-value" id="sessionTimer">00:00</span>
            `;
            userStatus.appendChild(sessionTimer);
        }

        // Add chat timer to video interface
        const videoContainer = document.querySelector('.video-container');
        if (videoContainer) {
            const chatTimer = document.createElement('div');
            chatTimer.className = 'chat-timer';
            chatTimer.innerHTML = `
                <div class="timer-display">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text" id="chatTimer">00:00</span>
                </div>
            `;
            videoContainer.appendChild(chatTimer);
        }

        // Add real-time stats panel
        this.createStatsPanel();
    }

    createStatsPanel() {
        const statsPanel = document.createElement('div');
        statsPanel.className = 'real-time-stats';
        statsPanel.innerHTML = `
            <div class="stats-header">
                <span class="stats-title">Live Stats</span>
                <div class="live-indicator">🔴 LIVE</div>
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value" id="onlineUsers">0</span>
                    <span class="stat-label">Online</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="activeChats">0</span>
                    <span class="stat-label">Chatting</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="serverLoad">0%</span>
                    <span class="stat-label">Load</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="connectionQuality">Good</span>
                    <span class="stat-label">Quality</span>
                </div>
            </div>
        `;

        // Add to hero section
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.appendChild(statsPanel);
        }
    }

    startRealTimeUpdates() {
        // Update every second
        setInterval(() => {
            this.updateClock();
            this.updateSessionTimer();
            this.updateChatTimer();
            this.updateRealTimeStats();
        }, 1000);

        // Update user count every 5 seconds
        setInterval(() => {
            this.updateUserCount();
        }, 5000);

        // Update connection quality every 10 seconds
        setInterval(() => {
            this.updateConnectionQuality();
        }, 10000);
    }

    updateClock() {
        const now = new Date();
        const timeElement = document.getElementById('currentTime');
        const dateElement = document.getElementById('currentDate');

        if (timeElement) {
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        }

        if (dateElement) {
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            dateElement.textContent = dateString;
        }
    }

    updateSessionTimer() {
        this.sessionTime = Math.floor((Date.now() - this.startTime) / 1000);
        const sessionElement = document.getElementById('sessionTimer');
        
        if (sessionElement) {
            const minutes = Math.floor(this.sessionTime / 60);
            const seconds = this.sessionTime % 60;
            sessionElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateChatTimer() {
        if (this.isInChat && this.chatStartTime) {
            this.chatTime = Math.floor((Date.now() - this.chatStartTime) / 1000);
            const chatElement = document.getElementById('chatTimer');
            
            if (chatElement) {
                const minutes = Math.floor(this.chatTime / 60);
                const seconds = this.chatTime % 60;
                chatElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    updateUserCount() {
        // Simulate real-time user count changes
        const baseCount = 45000;
        const variation = Math.floor(Math.random() * 10000) - 5000;
        const newCount = Math.max(baseCount + variation, 10000);
        
        this.realTimeData.onlineUsers = newCount;
        
        const userCountElement = document.getElementById('userCount');
        if (userCountElement) {
            this.animateNumberChange(userCountElement, newCount);
        }

        const onlineUsersElement = document.getElementById('onlineUsers');
        if (onlineUsersElement) {
            this.animateNumberChange(onlineUsersElement, newCount);
        }
    }

    updateRealTimeStats() {
        // Simulate real-time data changes
        this.realTimeData.activeChats = Math.floor(this.realTimeData.onlineUsers * 0.3 + Math.random() * 1000);
        this.realTimeData.serverLoad = Math.floor(Math.random() * 30 + 20); // 20-50%

        const activeChatsElement = document.getElementById('activeChats');
        const serverLoadElement = document.getElementById('serverLoad');

        if (activeChatsElement) {
            this.animateNumberChange(activeChatsElement, this.realTimeData.activeChats);
        }

        if (serverLoadElement) {
            serverLoadElement.textContent = `${this.realTimeData.serverLoad}%`;
            
            // Color code based on load
            if (this.realTimeData.serverLoad > 80) {
                serverLoadElement.style.color = '#f44336';
            } else if (this.realTimeData.serverLoad > 60) {
                serverLoadElement.style.color = '#ff9800';
            } else {
                serverLoadElement.style.color = '#4caf50';
            }
        }
    }

    updateConnectionQuality() {
        const qualities = ['Excellent', 'Good', 'Fair', 'Poor'];
        const weights = [40, 35, 20, 5]; // Probability weights
        
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedQuality = 'Good';
        
        for (let i = 0; i < qualities.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                selectedQuality = qualities[i];
                break;
            }
        }
        
        this.realTimeData.connectionQuality = selectedQuality;
        
        const qualityElement = document.getElementById('connectionQuality');
        if (qualityElement) {
            qualityElement.textContent = selectedQuality;
            
            // Color code based on quality
            const colors = {
                'Excellent': '#4caf50',
                'Good': '#8bc34a',
                'Fair': '#ff9800',
                'Poor': '#f44336'
            };
            qualityElement.style.color = colors[selectedQuality] || '#666';
        }
    }

    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const difference = newValue - currentValue;
        const steps = 20;
        const stepValue = difference / steps;
        let currentStep = 0;

        const animation = setInterval(() => {
            currentStep++;
            const intermediateValue = Math.floor(currentValue + (stepValue * currentStep));
            element.textContent = intermediateValue.toLocaleString();
            
            if (currentStep >= steps) {
                clearInterval(animation);
                element.textContent = newValue.toLocaleString();
            }
        }, 50);
    }

    startUserCountAnimation() {
        // Animate the online indicator
        const indicators = document.querySelectorAll('.online-indicator, .live-indicator');
        indicators.forEach(indicator => {
            indicator.style.animation = 'pulse 2s infinite';
        });
    }

    setupConnectionMonitoring() {
        // Monitor connection status
        window.addEventListener('online', () => {
            this.showConnectionStatus('Connected', 'success');
        });

        window.addEventListener('offline', () => {
            this.showConnectionStatus('Offline', 'error');
        });

        // Monitor page visibility for accurate timing
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseTimers();
            } else {
                this.resumeTimers();
            }
        });
    }

    showConnectionStatus(status, type) {
        const notification = document.createElement('div');
        notification.className = `connection-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="notification-text">${status}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    startChat() {
        this.isInChat = true;
        this.chatStartTime = Date.now();
        this.chatTime = 0;
        
        // Show chat timer
        const chatTimer = document.querySelector('.chat-timer');
        if (chatTimer) {
            chatTimer.style.display = 'block';
        }
    }

    stopChat() {
        this.isInChat = false;
        this.chatStartTime = null;
        this.chatTime = 0;
        
        // Hide chat timer
        const chatTimer = document.querySelector('.chat-timer');
        if (chatTimer) {
            chatTimer.style.display = 'none';
        }
    }

    pauseTimers() {
        // Pause timing when page is not visible
        this.pausedTime = Date.now();
    }

    resumeTimers() {
        // Resume timing when page becomes visible
        if (this.pausedTime) {
            const pauseDuration = Date.now() - this.pausedTime;
            this.startTime += pauseDuration;
            if (this.chatStartTime) {
                this.chatStartTime += pauseDuration;
            }
            this.pausedTime = null;
        }
    }

    // Public methods for integration
    getRealTimeData() {
        return {
            ...this.realTimeData,
            sessionTime: this.sessionTime,
            chatTime: this.chatTime,
            isInChat: this.isInChat
        };
    }

    addCustomTimer(name, callback) {
        const timer = setInterval(callback, 1000);
        this.timers.set(name, timer);
        return timer;
    }

    removeCustomTimer(name) {
        const timer = this.timers.get(name);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(name);
        }
    }
}

// Add CSS for real-time elements
const realTimeStyles = document.createElement('style');
realTimeStyles.textContent = `
    /* Real-Time Clock */
    .real-time-clock {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 8px 15px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .clock-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }
    
    .time {
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 0.9rem;
        color: #FFD700;
    }
    
    .date {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.8);
    }
    
    /* Session Timer */
    .session-timer {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .timer-value {
        font-family: 'Courier New', monospace;
        font-weight: bold;
        color: #4CAF50;
    }
    
    /* Chat Timer */
    .chat-timer {
        position: absolute;
        top: 70px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px 15px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        display: none;
        z-index: 1000;
    }
    
    .timer-display {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
    }
    
    .timer-text {
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 1.1rem;
        color: #FFD700;
    }
    
    /* Real-Time Stats Panel */
    .real-time-stats {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(15px);
        border-radius: 20px;
        padding: 20px;
        margin: 30px 0;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .stats-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .stats-title {
        font-weight: bold;
        color: white;
        font-size: 1.1rem;
    }
    
    .live-indicator {
        background: #f44336;
        color: white;
        padding: 4px 8px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: bold;
        animation: pulse 2s infinite;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 15px;
    }
    
    .stat-item {
        text-align: center;
        background: rgba(255, 255, 255, 0.05);
        padding: 15px 10px;
        border-radius: 12px;
        transition: all 0.3s ease;
    }
    
    .stat-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }
    
    .stat-value {
        display: block;
        font-size: 1.2rem;
        font-weight: bold;
        color: #FFD700;
        margin-bottom: 5px;
        font-family: 'Courier New', monospace;
    }
    
    .stat-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Connection Notification */
    .connection-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    }
    
    .connection-notification.success {
        background: #4CAF50;
    }
    
    .connection-notification.error {
        background: #f44336;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .real-time-clock {
            padding: 6px 10px;
        }
        
        .time {
            font-size: 0.8rem;
        }
        
        .date {
            font-size: 0.6rem;
        }
        
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .stat-item {
            padding: 10px 8px;
        }
        
        .stat-value {
            font-size: 1rem;
        }
        
        .chat-timer {
            top: 80px;
            left: 10px;
            padding: 8px 12px;
        }
    }
    
    @media (max-width: 480px) {
        .real-time-stats {
            padding: 15px;
            margin: 20px 0;
        }
        
        .stats-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
        
        .session-timer {
            font-size: 0.7rem;
        }
    }
`;

document.head.appendChild(realTimeStyles);

// Initialize Real-Time Manager
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeManager = new RealTimeManager();
});

// Export for global use
window.RealTimeManager = RealTimeManager;
