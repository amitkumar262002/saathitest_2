// Enhanced Live User Tracking System - Inspired by Azar
console.log('🚀 Enhanced Live User Tracking System Loading...');

class EnhancedLiveUserTracking {
    constructor() {
        this.socket = null;
        this.userStats = {
            onlineUsers: 0,
            activeUsers: 0,
            waitingUsers: 0,
            usersInRooms: 0,
            totalConnections: 0,
            activeRooms: 0,
            averageWaitTime: 0,
            peakUsers: 0,
            userActivity: new Map(),
            geographicDistribution: new Map(),
            deviceTypes: new Map(),
            connectionQuality: new Map()
        };
        
        this.userPresence = new Map(); // Track user presence states
        this.userActivity = new Map(); // Track user activity patterns
        this.matchingQueue = new Map(); // Enhanced matching queue
        this.userPreferences = new Map(); // User preferences cache
        this.connectionMetrics = new Map(); // Connection quality metrics
        
        this.isInitialized = false;
        this.heartbeatInterval = null;
        this.statsUpdateInterval = null;
        this.presenceCheckInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Enhanced Live User Tracking Initialized');
        this.waitForSocket();
        this.setupUI();
        this.setupGlobalFunctions();
        this.startHeartbeat();
        this.startStatsUpdater();
        this.startPresenceChecker();
    }
    
    setupGlobalFunctions() {
        // Enhanced global functions
        window.findStrangerEnhanced = () => this.findStrangerEnhanced();
        window.stopSearchingEnhanced = () => this.stopSearchingEnhanced();
        window.updatePreferencesEnhanced = (prefs) => this.updatePreferencesEnhanced(prefs);
        window.getUserStatsEnhanced = () => this.getUserStatsEnhanced();
        window.getUserPresence = () => this.getUserPresence();
        window.getMatchingQueue = () => this.getMatchingQueue();
        window.getGeographicStats = () => this.getGeographicStats();
        
        console.log('✅ Enhanced global user tracking functions set up');
    }
    
    waitForSocket() {
        const checkSocket = () => {
            if (window.saathiTV && window.saathiTV.socket) {
                this.socket = window.saathiTV.socket;
                this.setupSocketListeners();
                console.log('✅ Connected to main socket for enhanced tracking');
                return;
            }
            
            if (window.unifiedWebRTC && window.unifiedWebRTC.socket) {
                this.socket = window.unifiedWebRTC.socket;
                this.setupSocketListeners();
                console.log('✅ Connected to WebRTC socket for enhanced tracking');
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
                            console.log(`✅ Created enhanced socket connection on port ${port}`);
                            return;
                        } catch (portError) {
                            console.warn(`⚠️ Port ${port} failed for enhanced tracking:`, portError);
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to create enhanced socket:', error);
                }
            }
            
            setTimeout(checkSocket, 1000);
        };
        
        checkSocket();
    }
    
    setupSocketListeners() {
        if (!this.socket) return;
        
        console.log('🔌 Setting up enhanced socket listeners');
        
        // Enhanced user stats updates
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
        
        // Enhanced presence tracking
        this.socket.on('user-presence-update', (data) => {
            this.updateUserPresence(data);
        });
        
        this.socket.on('user-activity-update', (data) => {
            this.updateUserActivity(data);
        });
        
        // Enhanced matching events
        this.socket.on('roomJoined', (roomId) => {
            console.log('🏠 Joined room for enhanced stranger chat:', roomId);
            this.updateUserPresence({ status: 'in-room', roomId });
            this.updateUserActivity({ action: 'room-joined', roomId });
            
            if (window.strangerNotifications) {
                window.strangerNotifications.showMatchNotification({ roomId });
            }
        });
        
        this.socket.on('stranger-matched', (data) => {
            console.log('🎉 Enhanced stranger matched!', data);
            this.updateUserPresence({ status: 'matched', matchedUserId: data.matchedUserId });
            this.updateUserActivity({ action: 'matched', data });
            
            if (window.strangerNotifications) {
                window.strangerNotifications.showMatchNotification(data);
            }
        });
        
        this.socket.on('queue-update', (data) => {
            console.log('📊 Enhanced queue update:', data);
            this.updateMatchingQueue(data);
            
            if (window.strangerNotifications) {
                window.strangerNotifications.showQueueNotification(data);
            }
        });
        
        this.socket.on('waiting', (data) => {
            console.log('⏳ Enhanced waiting for stranger:', data);
            this.updateUserPresence({ status: 'waiting', position: data.position });
            this.updateUserActivity({ action: 'waiting', data });
        });
        
        this.socket.on('user-joined', (data) => {
            console.log('👥 Enhanced stranger joined!', data);
            this.updateUserPresence({ status: 'connected', userId: data.userId });
            this.updateUserActivity({ action: 'connected', data });
        });
        
        this.socket.on('peer-ready', (data) => {
            console.log('👥 Enhanced ready to chat!', data);
            this.updateUserPresence({ status: 'ready', userId: data.userId });
            this.updateUserActivity({ action: 'ready', data });
        });
        
        // Connection events
        this.socket.on('user-left', () => {
            console.log('👋 Enhanced stranger left');
            this.updateUserPresence({ status: 'disconnected' });
            this.updateUserActivity({ action: 'disconnected' });
            this.handleStrangerLeft();
        });
        
        // Geographic and device tracking
        this.socket.on('geographic-update', (data) => {
            this.updateGeographicStats(data);
        });
        
        this.socket.on('device-info-update', (data) => {
            this.updateDeviceStats(data);
        });
        
        // Connection quality tracking
        this.socket.on('connection-quality-update', (data) => {
            this.updateConnectionQuality(data);
        });
        
        console.log('✅ Enhanced socket listeners set up');
    }
    
    setupUI() {
        // Create enhanced stats display
        this.createEnhancedStatsDisplay();
        
        // Create enhanced waiting interface
        this.createEnhancedWaitingInterface();
        
        // Create enhanced preferences panel
        this.createEnhancedPreferencesPanel();
        
        // Create geographic distribution display
        this.createGeographicDisplay();
        
        // Create device analytics display
        this.createDeviceAnalyticsDisplay();
        
        console.log('✅ Enhanced UI set up');
    }
    
    createEnhancedStatsDisplay() {
        const statsContainer = document.createElement('div');
        statsContainer.id = 'enhancedUserStatsDisplay';
        statsContainer.innerHTML = `
            <div class="enhanced-user-stats-panel">
                <h3>🌍 Live Global Users</h3>
                <div class="enhanced-stats-grid">
                    <div class="stat-item">
                        <span class="stat-number" id="onlineUsersEnhanced">0</span>
                        <span class="stat-label">Online</span>
                        <div class="stat-trend" id="onlineTrend"></div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="waitingUsersEnhanced">0</span>
                        <span class="stat-label">Waiting</span>
                        <div class="stat-trend" id="waitingTrend"></div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="activeRoomsEnhanced">0</span>
                        <span class="stat-label">Chatting</span>
                        <div class="stat-trend" id="roomsTrend"></div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="averageWaitTime">0s</span>
                        <span class="stat-label">Avg Wait</span>
                        <div class="stat-trend" id="waitTimeTrend"></div>
                    </div>
                </div>
                <div class="enhanced-stats-details">
                    <div class="stat-detail">
                        <span class="detail-label">Peak Users Today:</span>
                        <span class="detail-value" id="peakUsers">0</span>
                    </div>
                    <div class="stat-detail">
                        <span class="detail-label">Total Connections:</span>
                        <span class="detail-value" id="totalConnections">0</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add enhanced styles
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-user-stats-panel {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px);
                border-radius: 20px;
                padding: 25px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .enhanced-user-stats-panel h3 {
                margin: 0 0 20px 0;
                font-size: 1.4em;
                color: #FFD700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .enhanced-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 15px;
                transition: all 0.3s ease;
            }
            
            .stat-item:hover {
                transform: translateY(-2px);
                background: rgba(255, 255, 255, 0.1);
            }
            
            .stat-number {
                font-size: 2.2em;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .stat-label {
                font-size: 0.9em;
                opacity: 0.9;
                margin-bottom: 5px;
            }
            
            .stat-trend {
                font-size: 0.8em;
                padding: 2px 6px;
                border-radius: 10px;
                background: rgba(76, 175, 80, 0.2);
                color: #4CAF50;
            }
            
            .stat-trend.decreasing {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
            }
            
            .enhanced-stats-details {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .stat-detail {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
            }
            
            .detail-label {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .detail-value {
                font-weight: bold;
                color: #FFD700;
            }
        `;
        
        document.head.appendChild(style);
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(statsContainer);
        
        console.log('✅ Enhanced user stats display created');
    }
    
    createEnhancedWaitingInterface() {
        const waitingContainer = document.createElement('div');
        waitingContainer.id = 'enhancedWaitingInterface';
        waitingContainer.className = 'enhanced-waiting-interface';
        waitingContainer.innerHTML = `
            <div class="enhanced-waiting-content">
                <div class="waiting-status" id="enhancedWaitingStatus">Ready to find a stranger!</div>
                <div class="waiting-time" id="enhancedWaitingTime"></div>
                <div class="queue-position" id="enhancedQueuePosition" style="display: none;"></div>
                <div class="matching-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="matchingProgress"></div>
                    </div>
                    <div class="progress-text" id="matchingProgressText">Searching...</div>
                </div>
                <div class="enhanced-waiting-actions">
                    <button onclick="window.findStrangerEnhanced()" class="btn btn-success">
                        Find Stranger
                    </button>
                    <button onclick="window.stopSearchingEnhanced()" class="btn btn-danger">
                        Stop Search
                    </button>
                </div>
            </div>
        `;
        
        // Add enhanced waiting styles
        const style = document.createElement('style');
        style.textContent += `
            .enhanced-waiting-interface {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px);
                border-radius: 20px;
                padding: 30px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                text-align: center;
                display: none;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .enhanced-waiting-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }
            
            .waiting-status {
                font-size: 1.3em;
                margin-bottom: 15px;
                color: #FFD700;
                font-weight: bold;
            }
            
            .waiting-time {
                font-size: 1em;
                opacity: 0.8;
                margin-bottom: 20px;
            }
            
            .queue-position {
                background: rgba(255, 107, 53, 0.2);
                border-radius: 15px;
                padding: 15px;
                margin: 10px 0;
                font-size: 1em;
                border: 1px solid rgba(255, 107, 53, 0.3);
            }
            
            .matching-progress {
                width: 100%;
                max-width: 300px;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                border-radius: 10px;
                width: 0%;
                transition: width 0.3s ease;
                animation: progressPulse 2s infinite;
            }
            
            @keyframes progressPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .progress-text {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .enhanced-waiting-actions {
                display: flex;
                gap: 15px;
                margin-top: 20px;
            }
            
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9em;
            }
            
            .btn-success {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
            }
            
            .btn-danger {
                background: linear-gradient(135deg, #f44336, #d32f2f);
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
        `;
        
        document.head.appendChild(style);
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(waitingContainer);
        
        console.log('✅ Enhanced waiting interface created');
    }
    
    createEnhancedPreferencesPanel() {
        const prefsContainer = document.createElement('div');
        prefsContainer.id = 'enhancedPreferencesPanel';
        prefsContainer.className = 'enhanced-preferences-panel';
        prefsContainer.innerHTML = `
            <h3>🎯 Enhanced Chat Preferences</h3>
            <div class="preference-section">
                <h4>Location Preferences</h4>
                <div class="preference-group">
                    <label for="countrySelectEnhanced">Country:</label>
                    <select id="countrySelectEnhanced">
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
                        <option value="RU">Russia</option>
                        <option value="CN">China</option>
                        <option value="KR">South Korea</option>
                    </select>
                </div>
                <div class="preference-group">
                    <label for="regionSelect">Region:</label>
                    <select id="regionSelect">
                        <option value="any">Any Region</option>
                        <option value="north-america">North America</option>
                        <option value="europe">Europe</option>
                        <option value="asia">Asia</option>
                        <option value="south-america">South America</option>
                        <option value="africa">Africa</option>
                        <option value="oceania">Oceania</option>
                    </select>
                </div>
            </div>
            
            <div class="preference-section">
                <h4>Personal Preferences</h4>
                <div class="preference-group">
                    <label for="genderSelectEnhanced">Gender:</label>
                    <select id="genderSelectEnhanced">
                        <option value="any">Any Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="preference-group">
                    <label for="ageRangeSelectEnhanced">Age Range:</label>
                    <select id="ageRangeSelectEnhanced">
                        <option value="any">Any Age</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-45">36-45</option>
                        <option value="46-55">46-55</option>
                        <option value="55+">55+</option>
                    </select>
                </div>
            </div>
            
            <div class="preference-section">
                <h4>Connection Preferences</h4>
                <div class="preference-group">
                    <label for="connectionQuality">Connection Quality:</label>
                    <select id="connectionQuality">
                        <option value="any">Any Quality</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                    </select>
                </div>
                <div class="preference-group">
                    <label for="languagePreference">Language:</label>
                    <select id="languagePreference">
                        <option value="any">Any Language</option>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                        <option value="hi">Hindi</option>
                    </select>
                </div>
            </div>
            
            <div class="preference-actions">
                <button onclick="window.enhancedLiveUserTracking.applyEnhancedPreferences()" class="btn btn-success">
                    Apply Enhanced Preferences
                </button>
                <button onclick="window.enhancedLiveUserTracking.toggleEnhancedPreferences()" class="btn btn-secondary">
                    Close
                </button>
            </div>
        `;
        
        // Add enhanced preferences styles
        const style = document.createElement('style');
        style.textContent += `
            .enhanced-preferences-panel {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px);
                border-radius: 20px;
                padding: 25px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                display: none;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .enhanced-preferences-panel h3 {
                margin: 0 0 20px 0;
                color: #FFD700;
                text-align: center;
                font-size: 1.3em;
            }
            
            .preference-section {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .preference-section h4 {
                margin: 0 0 15px 0;
                color: #4CAF50;
                font-size: 1.1em;
            }
            
            .preference-group {
                margin-bottom: 15px;
            }
            
            .preference-group label {
                display: block;
                margin-bottom: 8px;
                font-size: 0.9em;
                font-weight: bold;
            }
            
            .preference-group select {
                width: 100%;
                padding: 10px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 0.9em;
            }
            
            .preference-group select option {
                background: #333;
                color: white;
            }
            
            .preference-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .btn-secondary {
                background: linear-gradient(135deg, #6c757d, #5a6268);
                color: white;
            }
        `;
        
        document.head.appendChild(style);
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(prefsContainer);
        
        console.log('✅ Enhanced preferences panel created');
    }
    
    createGeographicDisplay() {
        const geoContainer = document.createElement('div');
        geoContainer.id = 'geographicDisplay';
        geoContainer.className = 'geographic-display';
        geoContainer.innerHTML = `
            <h3>🌍 Geographic Distribution</h3>
            <div class="geo-stats" id="geoStats">
                <div class="geo-item">
                    <span class="geo-country">Loading...</span>
                    <span class="geo-count">0</span>
                </div>
            </div>
        `;
        
        // Add geographic styles
        const style = document.createElement('style');
        style.textContent += `
            .geographic-display {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px);
                border-radius: 20px;
                padding: 25px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                display: none;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .geographic-display h3 {
                margin: 0 0 20px 0;
                color: #FFD700;
                text-align: center;
            }
            
            .geo-stats {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .geo-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
            }
            
            .geo-country {
                font-weight: bold;
            }
            
            .geo-count {
                color: #4CAF50;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(style);
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(geoContainer);
        
        console.log('✅ Geographic display created');
    }
    
    createDeviceAnalyticsDisplay() {
        const deviceContainer = document.createElement('div');
        deviceContainer.id = 'deviceAnalyticsDisplay';
        deviceContainer.className = 'device-analytics-display';
        deviceContainer.innerHTML = `
            <h3>📱 Device Analytics</h3>
            <div class="device-stats" id="deviceStats">
                <div class="device-item">
                    <span class="device-type">Loading...</span>
                    <span class="device-count">0</span>
                </div>
            </div>
        `;
        
        // Add device analytics styles
        const style = document.createElement('style');
        style.textContent += `
            .device-analytics-display {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(15px);
                border-radius: 20px;
                padding: 25px;
                margin: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                display: none;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .device-analytics-display h3 {
                margin: 0 0 20px 0;
                color: #FFD700;
                text-align: center;
            }
            
            .device-stats {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .device-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
            }
            
            .device-type {
                font-weight: bold;
            }
            
            .device-count {
                color: #4CAF50;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(style);
        
        // Add to main container
        const mainContainer = document.querySelector('.hero, #home, .main-container') || document.body;
        mainContainer.appendChild(deviceContainer);
        
        console.log('✅ Device analytics display created');
    }
    
    // Enhanced methods
    findStrangerEnhanced() {
        if (!this.socket) {
            console.error('❌ No socket connection for enhanced stranger finding');
            this.showNotification('Connection error. Please refresh and try again.', 'error');
            return;
        }
        
        console.log('🔍 Enhanced stranger search starting...');
        
        // Show enhanced waiting interface
        this.showEnhancedWaitingInterface();
        
        // Get enhanced preferences
        this.updateEnhancedPreferencesFromUI();
        
        // Emit enhanced join room request
        this.socket.emit('joinRoomEnhanced', this.getEnhancedPreferences());
        
        // Start enhanced waiting timer
        this.startEnhancedWaitingTimer();
        
        // Update matching progress
        this.updateMatchingProgress(0);
    }
    
    stopSearchingEnhanced() {
        console.log('⏹️ Stopping enhanced stranger search...');
        
        // Leave any current room
        if (this.socket) {
            this.socket.emit('leaveRoom', 'current');
        }
        
        // Hide enhanced waiting interface
        this.hideEnhancedWaitingInterface();
        
        // Stop enhanced waiting timer
        this.stopEnhancedWaitingTimer();
        
        // Reset matching progress
        this.updateMatchingProgress(0);
        
        this.updateUserPresence({ status: 'idle' });
    }
    
    updateEnhancedPreferences(prefs) {
        this.userPreferences.set('current', { ...this.userPreferences.get('current') || {}, ...prefs });
        console.log('🎯 Enhanced preferences updated:', prefs);
    }
    
    updateEnhancedPreferencesFromUI() {
        const preferences = {
            country: document.getElementById('countrySelectEnhanced')?.value || 'any',
            region: document.getElementById('regionSelect')?.value || 'any',
            gender: document.getElementById('genderSelectEnhanced')?.value || 'any',
            ageRange: document.getElementById('ageRangeSelectEnhanced')?.value || 'any',
            connectionQuality: document.getElementById('connectionQuality')?.value || 'any',
            language: document.getElementById('languagePreference')?.value || 'any',
            interests: [],
            deviceType: this.getDeviceType(),
            connectionSpeed: this.getConnectionSpeed()
        };
        
        this.updateEnhancedPreferences(preferences);
        console.log('🎯 Enhanced preferences from UI:', preferences);
    }
    
    getEnhancedPreferences() {
        return this.userPreferences.get('current') || {};
    }
    
    applyEnhancedPreferences() {
        this.updateEnhancedPreferencesFromUI();
        this.showNotification('Enhanced preferences updated!', 'success');
        this.toggleEnhancedPreferences();
    }
    
    toggleEnhancedPreferences() {
        const panel = document.getElementById('enhancedPreferencesPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    // Presence and activity tracking
    updateUserPresence(data) {
        const userId = this.socket?.id || 'current';
        this.userPresence.set(userId, {
            ...this.userPresence.get(userId) || {},
            ...data,
            lastUpdate: Date.now()
        });
        
        console.log('👤 User presence updated:', data);
    }
    
    updateUserActivity(data) {
        const userId = this.socket?.id || 'current';
        const activities = this.userActivity.get(userId) || [];
        activities.push({
            ...data,
            timestamp: Date.now()
        });
        
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(0, activities.length - 50);
        }
        
        this.userActivity.set(userId, activities);
        console.log('📊 User activity updated:', data);
    }
    
    updateMatchingQueue(data) {
        this.matchingQueue.set('current', data);
        
        // Update UI elements
        const queueElement = document.getElementById('enhancedQueuePosition');
        if (queueElement) {
            if (data.position > 0) {
                queueElement.textContent = `Position in queue: ${data.position}`;
                queueElement.style.display = 'block';
            } else {
                queueElement.style.display = 'none';
            }
        }
        
        // Update matching progress
        const progress = Math.min((data.position / Math.max(data.totalWaiting, 1)) * 100, 100);
        this.updateMatchingProgress(progress);
    }
    
    updateMatchingProgress(percentage) {
        const progressFill = document.getElementById('matchingProgress');
        const progressText = document.getElementById('matchingProgressText');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            if (percentage === 0) {
                progressText.textContent = 'Searching...';
            } else if (percentage < 50) {
                progressText.textContent = 'Finding matches...';
            } else if (percentage < 90) {
                progressText.textContent = 'Almost there...';
            } else {
                progressText.textContent = 'Connecting...';
            }
        }
    }
    
    updateGeographicStats(data) {
        this.userStats.geographicDistribution.set(data.country, 
            (this.userStats.geographicDistribution.get(data.country) || 0) + 1);
        
        this.updateGeographicDisplay();
    }
    
    updateDeviceStats(data) {
        this.userStats.deviceTypes.set(data.deviceType, 
            (this.userStats.deviceTypes.get(data.deviceType) || 0) + 1);
        
        this.updateDeviceAnalyticsDisplay();
    }
    
    updateConnectionQuality(data) {
        this.userStats.connectionQuality.set(data.userId, data.quality);
    }
    
    updateGeographicDisplay() {
        const geoStats = document.getElementById('geoStats');
        if (!geoStats) return;
        
        const sortedCountries = Array.from(this.userStats.geographicDistribution.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        geoStats.innerHTML = sortedCountries.map(([country, count]) => `
            <div class="geo-item">
                <span class="geo-country">${country}</span>
                <span class="geo-count">${count}</span>
            </div>
        `).join('');
    }
    
    updateDeviceAnalyticsDisplay() {
        const deviceStats = document.getElementById('deviceStats');
        if (!deviceStats) return;
        
        const sortedDevices = Array.from(this.userStats.deviceTypes.entries())
            .sort((a, b) => b[1] - a[1]);
        
        deviceStats.innerHTML = sortedDevices.map(([deviceType, count]) => `
            <div class="device-item">
                <span class="device-type">${deviceType}</span>
                <span class="device-count">${count}</span>
            </div>
        `).join('');
    }
    
    // Utility methods
    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
            return 'mobile';
        } else if (/Tablet|iPad/.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    getConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }
    
    // Heartbeat and monitoring
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('heartbeat', {
                    timestamp: Date.now(),
                    presence: this.userPresence.get(this.socket.id),
                    deviceInfo: {
                        type: this.getDeviceType(),
                        connectionSpeed: this.getConnectionSpeed(),
                        userAgent: navigator.userAgent
                    }
                });
            }
        }, 30000); // Every 30 seconds
    }
    
    startStatsUpdater() {
        this.statsUpdateInterval = setInterval(() => {
            this.updateStatsDisplay();
            this.updateGeographicDisplay();
            this.updateDeviceAnalyticsDisplay();
        }, 5000); // Every 5 seconds
    }
    
    startPresenceChecker() {
        this.presenceCheckInterval = setInterval(() => {
            this.checkUserPresence();
        }, 10000); // Every 10 seconds
    }
    
    checkUserPresence() {
        const now = Date.now();
        const PRESENCE_TIMEOUT = 60000; // 1 minute
        
        for (const [userId, presence] of this.userPresence) {
            if (now - presence.lastUpdate > PRESENCE_TIMEOUT) {
                this.userPresence.delete(userId);
                console.log(`👤 User ${userId} marked as offline`);
            }
        }
    }
    
    // Enhanced UI methods
    showEnhancedWaitingInterface() {
        const waitingInterface = document.getElementById('enhancedWaitingInterface');
        if (waitingInterface) {
            waitingInterface.style.display = 'block';
        }
    }
    
    hideEnhancedWaitingInterface() {
        const waitingInterface = document.getElementById('enhancedWaitingInterface');
        if (waitingInterface) {
            waitingInterface.style.display = 'none';
        }
    }
    
    startEnhancedWaitingTimer() {
        this.waitingTimer = setInterval(() => {
            const waitingTimeElement = document.getElementById('enhancedWaitingTime');
            if (waitingTimeElement) {
                const now = Date.now();
                const startTime = this.userPresence.get(this.socket?.id)?.waitingSince || now;
                const elapsed = Math.floor((now - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                
                waitingTimeElement.textContent = `Waiting time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    stopEnhancedWaitingTimer() {
        if (this.waitingTimer) {
            clearInterval(this.waitingTimer);
            this.waitingTimer = null;
        }
        
        const waitingTimeElement = document.getElementById('enhancedWaitingTime');
        if (waitingTimeElement) {
            waitingTimeElement.textContent = '';
        }
    }
    
    updateUserStats(stats) {
        this.userStats = { ...this.userStats, ...stats };
        this.updateStatsDisplay();
        console.log('📊 Enhanced user stats updated:', this.userStats);
    }
    
    updateStatsDisplay() {
        const elements = {
            onlineUsersEnhanced: document.getElementById('onlineUsersEnhanced'),
            waitingUsersEnhanced: document.getElementById('waitingUsersEnhanced'),
            activeRoomsEnhanced: document.getElementById('activeRoomsEnhanced'),
            averageWaitTime: document.getElementById('averageWaitTime'),
            peakUsers: document.getElementById('peakUsers'),
            totalConnections: document.getElementById('totalConnections')
        };
        
        if (elements.onlineUsersEnhanced) {
            elements.onlineUsersEnhanced.textContent = this.userStats.onlineUsers || this.userStats.activeUsers || 0;
        }
        
        if (elements.waitingUsersEnhanced) {
            elements.waitingUsersEnhanced.textContent = this.userStats.waitingUsers || 0;
        }
        
        if (elements.activeRoomsEnhanced) {
            elements.activeRoomsEnhanced.textContent = this.userStats.activeRooms || 0;
        }
        
        if (elements.averageWaitTime) {
            elements.averageWaitTime.textContent = `${this.userStats.averageWaitTime || 0}s`;
        }
        
        if (elements.peakUsers) {
            elements.peakUsers.textContent = this.userStats.peakUsers || 0;
        }
        
        if (elements.totalConnections) {
            elements.totalConnections.textContent = this.userStats.totalConnections || 0;
        }
    }
    
    handleStrangerLeft() {
        console.log('👋 Enhanced stranger left the chat');
        this.updateUserPresence({ status: 'disconnected' });
        this.updateUserActivity({ action: 'disconnected' });
        
        // Show option to find new stranger
        setTimeout(() => {
            this.updateMatchingProgress(0);
        }, 2000);
    }
    
    // Public API methods
    getUserStatsEnhanced() {
        return {
            ...this.userStats,
            presence: Object.fromEntries(this.userPresence),
            activity: Object.fromEntries(this.userActivity),
            matchingQueue: Object.fromEntries(this.matchingQueue)
        };
    }
    
    getUserPresence() {
        return Object.fromEntries(this.userPresence);
    }
    
    getMatchingQueue() {
        return Object.fromEntries(this.matchingQueue);
    }
    
    getGeographicStats() {
        return Object.fromEntries(this.userStats.geographicDistribution);
    }
    
    showNotification(message, type = 'info') {
        if (window.strangerNotifications) {
            window.strangerNotifications.showNotification(message, type);
        } else {
            console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }
        if (this.presenceCheckInterval) {
            clearInterval(this.presenceCheckInterval);
        }
        if (this.waitingTimer) {
            clearInterval(this.waitingTimer);
        }
        
        console.log('🧹 Enhanced Live User Tracking destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Enhanced Live User Tracking System...');
    window.enhancedLiveUserTracking = new EnhancedLiveUserTracking();
});

console.log('✅ Enhanced Live User Tracking System Loaded');
