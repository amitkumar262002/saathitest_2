// Live User Tracking System for Saathi TV
console.log('👥 Live User Tracking System Loading...');

class LiveUserTracking {
    constructor() {
        this.socket = null;
        this.userStats = {
            onlineUsers: 0,
            activeUsers: 0,
            waitingUsers: 0,
            usersInRooms: 0,
            totalConnections: 0,
            activeRooms: 0
        };
        this.userQueue = [];
        this.currentUser = null;
        this.isWaiting = false;
        this.waitingStartTime = null;
        this.pairingPreferences = {
            country: 'any',
            gender: 'any',
            ageRange: 'any',
            interests: []
        };
        
        this.init();
    }
    
    init() {
        console.log('🔧 Live User Tracking Initialized');
        this.waitForSocket();
        this.setupUI();
        this.setupGlobalFunctions();
    }
    
    setupGlobalFunctions() {
        // Global functions for user interaction
        window.findStranger = () => this.findStranger();
        window.stopSearching = () => this.stopSearching();
        window.updatePreferences = (prefs) => this.updatePreferences(prefs);
        window.getUserStats = () => this.getUserStats();
        
        console.log('✅ Global user tracking functions set up');
    }
    
    waitForSocket() {
        const checkSocket = () => {
            if (window.saathiTV && window.saathiTV.socket) {
                this.socket = window.saathiTV.socket;
                this.setupSocketListeners();
                console.log('✅ Connected to main socket for user tracking');
                return;
            }
            
            if (window.unifiedWebRTC && window.unifiedWebRTC.socket) {
                this.socket = window.unifiedWebRTC.socket;
                this.setupSocketListeners();
                console.log('✅ Connected to WebRTC socket for user tracking');
                return;
            }
            
            if (window.io) {
                try {
                    const ports = [3001, 3000];
                    for (const port of ports) {
                        try {
                            this.socket = window.io(`http://localhost:${port}`, {
                                transports: ['websocket', 'polling'],
                                timeout: 5000,
                                forceNew: true
                            });
                            this.setupSocketListeners();
                            console.log(`✅ Created new socket for user tracking on port ${port}`);
                            return;
                        } catch (portError) {
                            console.warn(`⚠️ Port ${port} failed for user tracking:`, portError);
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to create socket for user tracking:', error);
                }
            }
            
            setTimeout(checkSocket, 1000);
        };
        
        checkSocket();
    }
    
    setupSocketListeners() {
        if (!this.socket) return;
        
        console.log('🔌 Setting up user tracking socket listeners');
        
        // User stats updates
        this.socket.on('userStats', (stats) => {
            this.updateUserStats(stats);
        });
        
        this.socket.on('userCount', (count) => {
            this.userStats.activeUsers = count;
            this.updateStatsDisplay();
        });
        
        this.socket.on('online_count', (data) => {
            this.userStats.activeUsers = data.count;
            this.updateStatsDisplay();
        });
        
        // Room and pairing events
        this.socket.on('roomJoined', (roomId) => {
            console.log('🏠 Joined room for stranger chat:', roomId);
            this.isWaiting = false;
            this.waitingStartTime = null;
            this.updateWaitingStatus('Matched! Connecting...');
        });
        
        // Room and pairing events
        this.socket.on('roomJoined', (roomId) => {
            console.log('🏠 Joined room for stranger chat:', roomId);
            this.isWaiting = false;
            this.waitingStartTime = null;
            this.updateWaitingStatus('Matched! Connecting...');
            
            // Show match notification
            if (window.strangerNotifications) {
                window.strangerNotifications.showMatchNotification({ roomId });
            }
        });
        
        this.socket.on('stranger-matched', (data) => {
            console.log('🎉 Stranger matched!', data);
            this.isWaiting = false;
            this.waitingStartTime = null;
            this.updateWaitingStatus('Stranger found! Starting chat...');
            
            // Show enhanced match notification
            if (window.strangerNotifications) {
                window.strangerNotifications.showMatchNotification(data);
            }
        });
        
        this.socket.on('queue-update', (data) => {
            console.log('📊 Queue update:', data);
            this.updateQueuePosition(data.position);
            
            // Show queue notification
            if (window.strangerNotifications) {
                window.strangerNotifications.showQueueNotification(data);
            }
        });
        
        this.socket.on('waiting', (data) => {
            console.log('⏳ Waiting for stranger:', data);
            this.isWaiting = true;
            this.waitingStartTime = Date.now();
            this.updateWaitingStatus(data.message || 'Looking for someone to chat with...');
            this.updateQueuePosition(data.position || 0);
        });
        
        this.socket.on('user-joined', (data) => {
            console.log('👥 Stranger joined!', data);
            this.isWaiting = false;
            this.waitingStartTime = null;
            this.updateWaitingStatus('Stranger found! Starting chat...');
        });
        
        this.socket.on('peer-ready', (data) => {
            console.log('👥 Ready to chat with stranger!', data);
            this.isWaiting = false;
            this.waitingStartTime = null;
            this.updateWaitingStatus('Stranger ready! Connecting...');
        });
        
        // Connection events
        this.socket.on('user-left', () => {
            console.log('👋 Stranger left');
            this.handleStrangerLeft();
        });
        
        console.log('✅ User tracking socket listeners set up');
    }
    
    setupUI() {
        // Create user stats display
        this.createStatsDisplay();
        
        // Create waiting interface
        this.createWaitingInterface();
        
        // Create preferences panel
        this.createPreferencesPanel();
        
        console.log('✅ User tracking UI set up');
    }
    
    createStatsDisplay() {
        const statsContainer = document.createElement('div');
        statsContainer.id = 'userStatsDisplay';
        statsContainer.innerHTML = `
            <div class="user-stats-panel">
                <h3>👥 Live Users</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number" id="onlineUsers">0</span>
                        <span class="stat-label">Online</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="waitingUsers">0</span>
                        <span class="stat-label">Waiting</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="activeRooms">0</span>
                        <span class="stat-label">Chatting</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .user-stats-panel {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 20px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                text-align: center;
            }
            
            .user-stats-panel h3 {
                margin: 0 0 15px 0;
                font-size: 1.2em;
                color: #FFD700;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .stat-number {
                font-size: 1.8em;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .waiting-interface {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 30px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                text-align: center;
                display: none;
            }
            
            .waiting-status {
                font-size: 1.2em;
                margin-bottom: 15px;
                color: #FFD700;
            }
            
            .waiting-time {
                font-size: 0.9em;
                opacity: 0.8;
                margin-bottom: 20px;
            }
            
            .queue-position {
                background: rgba(255, 107, 53, 0.2);
                border-radius: 10px;
                padding: 10px;
                margin: 10px 0;
                font-size: 0.9em;
            }
            
            .preferences-panel {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 20px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                display: none;
            }
            
            .preferences-panel h3 {
                margin: 0 0 15px 0;
                color: #FFD700;
            }
            
            .preference-group {
                margin-bottom: 15px;
            }
            
            .preference-group label {
                display: block;
                margin-bottom: 5px;
                font-size: 0.9em;
            }
            
            .preference-group select {
                width: 100%;
                padding: 8px;
                border-radius: 5px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .preference-group select option {
                background: #333;
                color: white;
            }
        `;
        
        document.head.appendChild(style);
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(statsContainer);
        
        console.log('✅ User stats display created');
    }
    
    createWaitingInterface() {
        const waitingContainer = document.createElement('div');
        waitingContainer.id = 'waitingInterface';
        waitingContainer.className = 'waiting-interface';
        waitingContainer.innerHTML = `
            <div class="waiting-status" id="waitingStatus">Ready to find a stranger!</div>
            <div class="waiting-time" id="waitingTime"></div>
            <div class="queue-position" id="queuePosition" style="display: none;"></div>
            <div class="waiting-actions">
                <button onclick="window.liveUserTracking.stopSearching()" class="btn btn-danger">
                    Stop Searching
                </button>
                <button onclick="window.liveUserTracking.findStranger()" class="btn btn-primary">
                    Try Again
                </button>
            </div>
        `;
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(waitingContainer);
        
        console.log('✅ Waiting interface created');
    }
    
    createPreferencesPanel() {
        const prefsContainer = document.createElement('div');
        prefsContainer.id = 'preferencesPanel';
        prefsContainer.className = 'preferences-panel';
        prefsContainer.innerHTML = `
            <h3>🎯 Chat Preferences</h3>
            <div class="preference-group">
                <label for="countrySelect">Country:</label>
                <select id="countrySelect">
                    <option value="any">Any Country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="BR">Brazil</option>
                </select>
            </div>
            <div class="preference-group">
                <label for="genderSelect">Gender:</label>
                <select id="genderSelect">
                    <option value="any">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="preference-group">
                <label for="ageRangeSelect">Age Range:</label>
                <select id="ageRangeSelect">
                    <option value="any">Any Age</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="55+">55+</option>
                </select>
            </div>
            <div class="preference-actions">
                <button onclick="window.liveUserTracking.applyPreferences()" class="btn btn-success">
                    Apply Preferences
                </button>
                <button onclick="window.liveUserTracking.togglePreferences()" class="btn btn-secondary">
                    Close
                </button>
            </div>
        `;
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(prefsContainer);
        
        console.log('✅ Preferences panel created');
    }
    
    findStranger() {
        if (!this.socket) {
            console.error('❌ No socket connection for finding stranger');
            this.showNotification('Connection error. Please refresh and try again.', 'error');
            return;
        }
        
        console.log('🔍 Looking for stranger to chat with...');
        
        // Show waiting interface
        this.showWaitingInterface();
        
        // Get current preferences
        this.updatePreferencesFromUI();
        
        // Emit join room request with preferences
        this.socket.emit('joinRoom', this.pairingPreferences);
        
        // Start waiting timer
        this.startWaitingTimer();
    }
    
    stopSearching() {
        console.log('⏹️ Stopping stranger search...');
        
        this.isWaiting = false;
        this.waitingStartTime = null;
        
        // Leave any current room
        if (this.socket) {
            this.socket.emit('leaveRoom', 'current');
        }
        
        // Hide waiting interface
        this.hideWaitingInterface();
        
        // Stop waiting timer
        this.stopWaitingTimer();
        
        this.updateWaitingStatus('Search stopped');
    }
    
    updatePreferences(prefs) {
        this.pairingPreferences = { ...this.pairingPreferences, ...prefs };
        console.log('🎯 Preferences updated:', this.pairingPreferences);
    }
    
    updatePreferencesFromUI() {
        const country = document.getElementById('countrySelect')?.value || 'any';
        const gender = document.getElementById('genderSelect')?.value || 'any';
        const ageRange = document.getElementById('ageRangeSelect')?.value || 'any';
        
        this.pairingPreferences = {
            country,
            gender,
            ageRange,
            interests: []
        };
        
        console.log('🎯 Preferences from UI:', this.pairingPreferences);
    }
    
    applyPreferences() {
        this.updatePreferencesFromUI();
        this.showNotification('Preferences updated!', 'success');
        this.togglePreferences();
    }
    
    togglePreferences() {
        const panel = document.getElementById('preferencesPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    updateUserStats(stats) {
        this.userStats = { ...this.userStats, ...stats };
        this.updateStatsDisplay();
        console.log('📊 User stats updated:', this.userStats);
    }
    
    updateStatsDisplay() {
        const elements = {
            onlineUsers: document.getElementById('onlineUsers'),
            waitingUsers: document.getElementById('waitingUsers'),
            activeRooms: document.getElementById('activeRooms')
        };
        
        if (elements.onlineUsers) {
            elements.onlineUsers.textContent = this.userStats.onlineUsers || this.userStats.activeUsers || 0;
        }
        
        if (elements.waitingUsers) {
            elements.waitingUsers.textContent = this.userStats.waitingUsers || 0;
        }
        
        if (elements.activeRooms) {
            elements.activeRooms.textContent = this.userStats.activeRooms || 0;
        }
    }
    
    updateWaitingStatus(message) {
        const statusElement = document.getElementById('waitingStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
        
        console.log('📊 Waiting status:', message);
    }
    
    updateQueuePosition(position) {
        const queueElement = document.getElementById('queuePosition');
        if (queueElement) {
            if (position > 0) {
                queueElement.textContent = `Position in queue: ${position}`;
                queueElement.style.display = 'block';
            } else {
                queueElement.style.display = 'none';
            }
        }
    }
    
    showWaitingInterface() {
        const waitingInterface = document.getElementById('waitingInterface');
        if (waitingInterface) {
            waitingInterface.style.display = 'block';
        }
    }
    
    hideWaitingInterface() {
        const waitingInterface = document.getElementById('waitingInterface');
        if (waitingInterface) {
            waitingInterface.style.display = 'none';
        }
    }
    
    startWaitingTimer() {
        this.waitingTimer = setInterval(() => {
            if (this.waitingStartTime) {
                const elapsed = Math.floor((Date.now() - this.waitingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                
                const timeElement = document.getElementById('waitingTime');
                if (timeElement) {
                    timeElement.textContent = `Waiting time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    }
    
    stopWaitingTimer() {
        if (this.waitingTimer) {
            clearInterval(this.waitingTimer);
            this.waitingTimer = null;
        }
        
        const timeElement = document.getElementById('waitingTime');
        if (timeElement) {
            timeElement.textContent = '';
        }
    }
    
    handleStrangerLeft() {
        console.log('👋 Stranger left the chat');
        this.isWaiting = false;
        this.waitingStartTime = null;
        
        this.updateWaitingStatus('Stranger disconnected');
        
        // Show option to find new stranger
        setTimeout(() => {
            this.updateWaitingStatus('Want to find another stranger?');
        }, 2000);
    }
    
    getUserStats() {
        return this.userStats;
    }
    
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }
        
        // Create simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Live User Tracking System...');
    window.liveUserTracking = new LiveUserTracking();
});

console.log('✅ Live User Tracking System Loaded');
