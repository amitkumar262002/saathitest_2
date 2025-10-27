// Enhanced Notification System for Stranger Matching
console.log('🔔 Enhanced Notification System Loading...');

class StrangerNotificationSystem {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.notificationContainer = null;
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Enhanced Notification System Initialized');
        this.createNotificationContainer();
        this.setupGlobalFunctions();
        this.setupSoundSystem();
    }
    
    setupGlobalFunctions() {
        // Global notification functions
        window.showStrangerNotification = (message, type, options) => this.showNotification(message, type, options);
        window.showMatchNotification = (data) => this.showMatchNotification(data);
        window.showQueueNotification = (data) => this.showQueueNotification(data);
        window.toggleNotificationSound = () => this.toggleSound();
        window.toggleNotificationVibration = () => this.toggleVibration();
        
        console.log('✅ Global notification functions set up');
    }
    
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'strangerNotificationContainer';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 350px;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.notificationContainer);
        console.log('✅ Notification container created');
    }
    
    setupSoundSystem() {
        // Create audio context for notification sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Audio context created for notifications');
        } catch (error) {
            console.warn('⚠️ Could not create audio context:', error);
            this.soundEnabled = false;
        }
    }
    
    showNotification(message, type = 'info', options = {}) {
        const notification = this.createNotificationElement(message, type, options);
        
        // Add to container
        this.notificationContainer.appendChild(notification);
        this.notifications.push(notification);
        
        // Play sound
        if (this.soundEnabled && options.sound !== false) {
            this.playNotificationSound(type);
        }
        
        // Vibrate if supported
        if (this.vibrationEnabled && options.vibrate !== false && navigator.vibrate) {
            this.vibrate(type);
        }
        
        // Auto remove after delay
        const delay = options.delay || this.getDefaultDelay(type);
        setTimeout(() => {
            this.removeNotification(notification);
        }, delay);
        
        // Limit number of notifications
        if (this.notifications.length > this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.removeNotification(oldest);
        }
        
        console.log(`🔔 Notification shown: ${message} (${type})`);
    }
    
    createNotificationElement(message, type, options) {
        const notification = document.createElement('div');
        notification.className = `stranger-notification ${type}`;
        
        const icon = this.getIconForType(type);
        const color = this.getColorForType(type);
        
        notification.style.cssText = `
            background: ${color};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            margin-bottom: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            pointer-events: auto;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 1.2em;">${icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${this.getTitleForType(type)}</div>
                    <div style="font-size: 0.9em; opacity: 0.9;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2em;
                    cursor: pointer;
                    opacity: 0.7;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                ">×</button>
            </div>
            <div class="notification-progress" style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255,255,255,0.3);
                width: 100%;
                animation: progress ${this.getDefaultDelay(type)}ms linear;
            "></div>
        `;
        
        // Add progress bar animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        if (!document.head.querySelector('style[data-notification-progress]')) {
            style.setAttribute('data-notification-progress', 'true');
            document.head.appendChild(style);
        }
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        return notification;
    }
    
    showMatchNotification(data) {
        const message = `Matched with a stranger! Starting video chat...`;
        this.showNotification(message, 'success', {
            delay: 5000,
            sound: true,
            vibrate: true
        });
        
        // Show additional match info
        setTimeout(() => {
            this.showNotification(`Room: ${data.roomId}`, 'info', {
                delay: 3000,
                sound: false,
                vibrate: false
            });
        }, 1000);
    }
    
    showQueueNotification(data) {
        const message = `Position ${data.position} in queue. Est. wait: ${data.estimatedWaitTime}s`;
        this.showNotification(message, 'info', {
            delay: 4000,
            sound: false,
            vibrate: false
        });
    }
    
    getIconForType(type) {
        const icons = {
            success: '🎉',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            match: '👥',
            queue: '⏳',
            connection: '🔗'
        };
        return icons[type] || icons.info;
    }
    
    getColorForType(type) {
        const colors = {
            success: 'linear-gradient(135deg, #4CAF50, #45a049)',
            error: 'linear-gradient(135deg, #f44336, #d32f2f)',
            warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
            info: 'linear-gradient(135deg, #2196F3, #1976D2)',
            match: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
            queue: 'linear-gradient(135deg, #FF9800, #F57C00)',
            connection: 'linear-gradient(135deg, #00BCD4, #0097A7)'
        };
        return colors[type] || colors.info;
    }
    
    getTitleForType(type) {
        const titles = {
            success: 'Success!',
            error: 'Error',
            warning: 'Warning',
            info: 'Info',
            match: 'Match Found!',
            queue: 'Queue Update',
            connection: 'Connection'
        };
        return titles[type] || 'Notification';
    }
    
    getDefaultDelay(type) {
        const delays = {
            success: 5000,
            error: 6000,
            warning: 5000,
            info: 4000,
            match: 5000,
            queue: 4000,
            connection: 4000
        };
        return delays[type] || 4000;
    }
    
    playNotificationSound(type) {
        if (!this.audioContext || !this.soundEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Different frequencies for different types
            const frequencies = {
                success: [523, 659, 784], // C-E-G
                error: [200, 150, 100],
                warning: [400, 300],
                info: [440, 554],
                match: [523, 659, 784, 1047], // C-E-G-C
                queue: [330, 440],
                connection: [440, 554, 659]
            };
            
            const freq = frequencies[type] || frequencies.info;
            let currentFreq = 0;
            
            oscillator.frequency.setValueAtTime(freq[currentFreq], this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            
            oscillator.start();
            
            // Play melody
            freq.forEach((f, index) => {
                if (index > 0) {
                    oscillator.frequency.setValueAtTime(f, this.audioContext.currentTime + index * 0.1);
                }
            });
            
            oscillator.stop(this.audioContext.currentTime + freq.length * 0.1);
            
        } catch (error) {
            console.warn('⚠️ Could not play notification sound:', error);
        }
    }
    
    vibrate(type) {
        if (!navigator.vibrate || !this.vibrationEnabled) return;
        
        const patterns = {
            success: [100, 50, 100],
            error: [200, 100, 200],
            warning: [150, 75, 150],
            info: [100],
            match: [100, 50, 100, 50, 100],
            queue: [50, 25, 50],
            connection: [100, 50, 100]
        };
        
        const pattern = patterns[type] || patterns.info;
        navigator.vibrate(pattern);
    }
    
    removeNotification(notification) {
        if (!notification || !notification.parentElement) return;
        
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
            
            // Remove from notifications array
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.showNotification(
            `Notification sound ${this.soundEnabled ? 'enabled' : 'disabled'}`,
            'info',
            { delay: 2000, sound: false }
        );
        return this.soundEnabled;
    }
    
    toggleVibration() {
        this.vibrationEnabled = !this.vibrationEnabled;
        this.showNotification(
            `Notification vibration ${this.vibrationEnabled ? 'enabled' : 'disabled'}`,
            'info',
            { delay: 2000, vibrate: false }
        );
        return this.vibrationEnabled;
    }
    
    clearAll() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        this.notifications = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Enhanced Notification System...');
    window.strangerNotifications = new StrangerNotificationSystem();
});

console.log('✅ Enhanced Notification System Loaded');
