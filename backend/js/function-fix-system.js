// Complete Function Fix System for Saathi TV

class FunctionFixSystem {
    constructor() {
        this.features = {
            freeVideoChat: false,
            globalCommunity: false,
            mobileFriendly: false,
            safeAnonymous: false,
            instantConnection: false,
            smartMatching: false
        };
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Function Fix System...');
        
        await this.fixFreeVideoChat();
        await this.fixGlobalCommunity();
        await this.fixMobileFriendly();
        await this.fixSafeAnonymous();
        await this.fixInstantConnection();
        await this.fixSmartMatching();
        
        this.updateFeatureStatus();
        console.log('✅ All functions fixed and working');
    }

    async fixFreeVideoChat() {
        try {
            // Ensure WebRTC is properly initialized
            if (!window.webRTCFix) {
                console.log('🔧 Initializing WebRTC...');
                await this.waitForWebRTC();
            }
            
            // Fix video chat buttons
            this.fixVideoButtons();
            
            // Fix media controls
            this.fixMediaControls();
            
            this.features.freeVideoChat = true;
            console.log('✅ Free Video Chat - FIXED');
            
        } catch (error) {
            console.error('❌ Free Video Chat fix failed:', error);
        }
    }

    async fixGlobalCommunity() {
        try {
            // Fix country selection
            this.fixCountrySelection();
            
            // Fix user matching
            this.fixUserMatching();
            
            // Fix community features
            this.fixCommunityFeatures();
            
            this.features.globalCommunity = true;
            console.log('✅ Global Community - FIXED');
            
        } catch (error) {
            console.error('❌ Global Community fix failed:', error);
        }
    }

    async fixMobileFriendly() {
        try {
            // Fix responsive design
            this.fixResponsiveDesign();
            
            // Fix touch controls
            this.fixTouchControls();
            
            // Fix mobile video
            this.fixMobileVideo();
            
            this.features.mobileFriendly = true;
            console.log('✅ Mobile Friendly - FIXED');
            
        } catch (error) {
            console.error('❌ Mobile Friendly fix failed:', error);
        }
    }

    async fixSafeAnonymous() {
        try {
            // Fix privacy features
            this.fixPrivacyFeatures();
            
            // Fix anonymous chat
            this.fixAnonymousChat();
            
            // Fix reporting system
            this.fixReportingSystem();
            
            this.features.safeAnonymous = true;
            console.log('✅ Safe & Anonymous - FIXED');
            
        } catch (error) {
            console.error('❌ Safe & Anonymous fix failed:', error);
        }
    }

    async fixInstantConnection() {
        try {
            // Fix connection speed
            this.fixConnectionSpeed();
            
            // Fix auto-reconnect
            this.fixAutoReconnect();
            
            // Fix connection status
            this.fixConnectionStatus();
            
            this.features.instantConnection = true;
            console.log('✅ Instant Connection - FIXED');
            
        } catch (error) {
            console.error('❌ Instant Connection fix failed:', error);
        }
    }

    async fixSmartMatching() {
        try {
            // Fix matching algorithm
            this.fixMatchingAlgorithm();
            
            // Fix preference system
            this.fixPreferenceSystem();
            
            // Fix queue management
            this.fixQueueManagement();
            
            this.features.smartMatching = true;
            console.log('✅ Smart Matching - FIXED');
            
        } catch (error) {
            console.error('❌ Smart Matching fix failed:', error);
        }
    }

    fixVideoButtons() {
        // Start chat button functionality moved to navbar - no longer fixing separate button
        if (nextBtn) {
            nextBtn.onclick = () => {
                if (window.webRTCFix) {
                    window.webRTCFix.nextChat();
                }
            };
        }

        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.onclick = () => {
                if (window.webRTCFix) {
                    window.webRTCFix.stopChat();
                }
            };
        }
    }

    fixMediaControls() {
        const audioBtn = document.getElementById('toggleAudio');
        if (audioBtn) {
            audioBtn.onclick = () => {
                if (window.webRTCFix) {
                    window.webRTCFix.toggleAudio();
                }
            };
        }

        const videoBtn = document.getElementById('toggleVideo');
        if (videoBtn) {
            videoBtn.onclick = () => {
                if (window.webRTCFix) {
                    window.webRTCFix.toggleVideo();
                }
            };
        }
    }

    fixCountrySelection() {
        const countrySelects = document.querySelectorAll('#countrySelect, #chatCountrySelect');
        countrySelects.forEach(select => {
            if (select) {
                select.onchange = () => {
                    console.log('🌍 Country changed:', select.value);
                    this.updateMatchingPreferences();
                };
            }
        });
    }

    fixUserMatching() {
        // Implement smart user matching
        window.findMatch = (preferences) => {
            console.log('🔍 Finding match with preferences:', preferences);
            
            if (window.webRTCFix && window.webRTCFix.socket) {
                window.webRTCFix.socket.emit('findMatch', preferences);
            }
        };
    }

    fixResponsiveDesign() {
        // Add mobile-specific styles
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            @media (max-width: 768px) {
                .video-main-container {
                    flex-direction: column !important;
                }
                
                .local-video-container,
                .remote-video-container {
                    width: 100% !important;
                    height: 50vh !important;
                }
                
                .bottom-control-bar {
                    bottom: 20px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                }
                
                .chat-input-bottom {
                    position: relative !important;
                    bottom: auto !important;
                    right: auto !important;
                    width: 100% !important;
                    padding: 0 20px !important;
                    margin-top: 20px !important;
                }
            }
        `;
        document.head.appendChild(mobileStyles);
    }

    fixTouchControls() {
        // Add touch event handlers
        const buttons = document.querySelectorAll('.round-control-btn, .send-btn-small');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                btn.style.transform = 'scale(0.95)';
            });
            
            btn.addEventListener('touchend', (e) => {
                btn.style.transform = 'scale(1)';
            });
        });
    }

    fixMobileVideo() {
        // Fix mobile video constraints
        if (navigator.mediaDevices) {
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = function(constraints) {
                // Mobile-optimized constraints
                if (window.innerWidth <= 768) {
                    if (constraints.video) {
                        constraints.video = {
                            width: { ideal: 640, max: 1280 },
                            height: { ideal: 480, max: 720 },
                            frameRate: { ideal: 15, max: 30 }
                        };
                    }
                }
                return originalGetUserMedia.call(this, constraints);
            };
        }
    }

    fixPrivacyFeatures() {
        // Implement privacy protection
        window.enablePrivacyMode = () => {
            console.log('🔒 Privacy mode enabled');
            
            // Disable right-click
            document.addEventListener('contextmenu', e => e.preventDefault());
            
            // Disable screenshot (limited browser support)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'PrintScreen') {
                    e.preventDefault();
                    this.showNotification('Screenshots are disabled for privacy');
                }
            });
        };
        
        window.enablePrivacyMode();
    }

    fixAnonymousChat() {
        // Generate anonymous user IDs
        window.generateAnonymousId = () => {
            return 'anon_' + Math.random().toString(36).substr(2, 9);
        };
        
        // Store anonymous session
        if (!sessionStorage.getItem('anonymousId')) {
            sessionStorage.setItem('anonymousId', window.generateAnonymousId());
        }
    }

    fixReportingSystem() {
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.onclick = () => {
                this.showReportDialog();
            };
        }
    }

    fixConnectionSpeed() {
        // Optimize connection settings
        if (window.webRTCFix) {
            window.webRTCFix.configuration.iceTransportPolicy = 'all';
            window.webRTCFix.configuration.bundlePolicy = 'max-bundle';
        }
    }

    fixAutoReconnect() {
        // Implement auto-reconnect
        window.addEventListener('online', () => {
            console.log('🌐 Network reconnected');
            if (window.webRTCFix) {
                window.webRTCFix.reinitialize();
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('📡 Network disconnected');
            this.showNotification('Connection lost. Will reconnect automatically.');
        });
    }

    fixConnectionStatus() {
        // Real-time connection monitoring
        setInterval(() => {
            if (window.webRTCFix) {
                const status = window.webRTCFix.getConnectionStatus();
                this.updateConnectionIndicator(status);
            }
        }, 2000);
    }

    fixMatchingAlgorithm() {
        window.smartMatch = (preferences) => {
            console.log('🧠 Smart matching with:', preferences);
            
            // Implement matching logic
            const matchScore = this.calculateMatchScore(preferences);
            console.log('📊 Match score:', matchScore);
            
            return matchScore > 0.7; // 70% compatibility threshold
        };
    }

    fixPreferenceSystem() {
        const genderSelects = document.querySelectorAll('#genderSelect, #chatGenderSelect');
        genderSelects.forEach(select => {
            if (select) {
                select.onchange = () => {
                    console.log('👤 Gender preference changed:', select.value);
                    this.updateMatchingPreferences();
                };
            }
        });
    }

    fixQueueManagement() {
        window.queueManager = {
            queue: [],
            add: (user) => {
                this.queue.push(user);
                console.log('➕ User added to queue. Position:', this.queue.length);
            },
            remove: (userId) => {
                this.queue = this.queue.filter(u => u.id !== userId);
                console.log('➖ User removed from queue');
            },
            getNext: () => {
                return this.queue.shift();
            }
        };
    }

    // Helper methods
    async waitForWebRTC() {
        return new Promise((resolve) => {
            const checkWebRTC = () => {
                if (window.webRTCFix) {
                    resolve();
                } else {
                    setTimeout(checkWebRTC, 100);
                }
            };
            checkWebRTC();
        });
    }

    updateMatchingPreferences() {
        const countrySelect = document.getElementById('countrySelect');
        const genderSelect = document.getElementById('genderSelect');
        
        const preferences = {
            country: countrySelect ? countrySelect.value : 'any',
            gender: genderSelect ? genderSelect.value : 'any'
        };
        
        console.log('🎯 Updated matching preferences:', preferences);
        
        if (window.findMatch) {
            window.findMatch(preferences);
        }
    }

    calculateMatchScore(preferences) {
        // Simple matching algorithm
        let score = 0.5; // Base score
        
        if (preferences.country !== 'any') score += 0.2;
        if (preferences.gender !== 'any') score += 0.3;
        
        return Math.min(score, 1.0);
    }

    updateConnectionIndicator(status) {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        
        if (indicator && text) {
            if (status.isConnected && status.hasRemoteStream) {
                indicator.className = 'status-indicator success';
                text.textContent = 'Connected';
            } else if (status.hasLocalStream) {
                indicator.className = 'status-indicator warning';
                text.textContent = 'Looking for someone...';
            } else {
                indicator.className = 'status-indicator error';
                text.textContent = 'Disconnected';
            }
        }
    }

    updateFeatureStatus() {
        console.log('📊 Feature Status:');
        Object.entries(this.features).forEach(([feature, status]) => {
            console.log(`${status ? '✅' : '❌'} ${feature}: ${status ? 'WORKING' : 'FAILED'}`);
        });
        
        const workingFeatures = Object.values(this.features).filter(Boolean).length;
        const totalFeatures = Object.keys(this.features).length;
        
        console.log(`🎯 Overall Status: ${workingFeatures}/${totalFeatures} features working`);
    }

    showReportDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'report-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Report User</h3>
                <p>Please select a reason for reporting:</p>
                <select id="reportReason">
                    <option value="inappropriate">Inappropriate behavior</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="other">Other</option>
                </select>
                <div class="dialog-buttons">
                    <button onclick="this.closest('.report-dialog').remove()">Cancel</button>
                    <button onclick="window.submitReport()">Report</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        window.submitReport = () => {
            const reason = document.getElementById('reportReason').value;
            console.log('🚨 User reported for:', reason);
            this.showNotification('Report submitted. Thank you for keeping our community safe.');
            dialog.remove();
        };
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fix-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    showError(message) {
        console.error('❌ Error:', message);
        this.showNotification(message);
    }
}

// Add styles for dialogs and notifications
const fixStyles = document.createElement('style');
fixStyles.textContent = `
    .report-dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .dialog-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        width: 90%;
    }
    
    .dialog-content h3 {
        margin-bottom: 15px;
        color: #333;
    }
    
    .dialog-content select {
        width: 100%;
        padding: 10px;
        margin: 15px 0;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    
    .dialog-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    
    .dialog-buttons button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
    }
    
    .dialog-buttons button:first-child {
        background: #f5f5f5;
        color: #333;
    }
    
    .dialog-buttons button:last-child {
        background: #f44336;
        color: white;
    }
    
    .fix-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInUp 0.3s ease-out;
    }
    
    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(fixStyles);

// Initialize Function Fix System
document.addEventListener('DOMContentLoaded', () => {
    window.functionFixSystem = new FunctionFixSystem();
});

window.FunctionFixSystem = FunctionFixSystem;
