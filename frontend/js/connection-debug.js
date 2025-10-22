// Connection Debug System - Find and fix connection issues
console.log('🔍 Connection Debug System loaded');

class ConnectionDebugger {
    constructor() {
        this.debugInfo = {};
        this.init();
    }
    
    init() {
        console.log('🚀 Starting connection debugging...');
        
        // Debug immediately
        this.debugAllSystems();
        
        // Debug again after 2 seconds
        setTimeout(() => {
            this.debugAllSystems();
            this.attemptManualConnection();
        }, 2000);
        
        // Add debug button to UI
        this.addDebugButton();
    }
    
    debugAllSystems() {
        console.log('=== 🔍 CONNECTION DEBUG REPORT ===');
        
        // Check if all scripts loaded
        this.checkScriptLoading();
        
        // Check localStorage support
        this.checkLocalStorage();
        
        // Check BroadcastChannel support
        this.checkBroadcastChannel();
        
        // Check auto-join manager
        this.checkAutoJoinManager();
        
        // Check cross-tab connection
        this.checkCrossTabConnection();
        
        // Check active sessions
        this.checkActiveSessions();
        
        console.log('=== 🔍 DEBUG REPORT END ===');
    }
    
    checkScriptLoading() {
        const scripts = [
            'window.autoJoinManager',
            'window.crossTabConnection', 
            'window.webRTCManager',
            'window.saathiTV'
        ];
        
        console.log('📜 Script Loading Status:');
        scripts.forEach(script => {
            const exists = this.getNestedProperty(window, script.split('.').slice(1));
            console.log(`  ${script}: ${exists ? '✅' : '❌'}`);
            this.debugInfo[script] = !!exists;
        });
    }
    
    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            console.log('💾 localStorage: ✅ Working');
            this.debugInfo.localStorage = true;
        } catch (error) {
            console.log('💾 localStorage: ❌ Not working -', error.message);
            this.debugInfo.localStorage = false;
        }
    }
    
    checkBroadcastChannel() {
        try {
            const testChannel = new BroadcastChannel('test');
            testChannel.close();
            console.log('📡 BroadcastChannel: ✅ Supported');
            this.debugInfo.broadcastChannel = true;
        } catch (error) {
            console.log('📡 BroadcastChannel: ❌ Not supported -', error.message);
            this.debugInfo.broadcastChannel = false;
        }
    }
    
    checkAutoJoinManager() {
        if (window.autoJoinManager) {
            console.log('🎯 Auto-Join Manager: ✅ Loaded');
            console.log('  - Mock Users:', window.autoJoinManager.mockUsers?.length || 0);
            console.log('  - Is Searching:', window.autoJoinManager.isSearching);
            this.debugInfo.autoJoinManager = true;
        } else {
            console.log('🎯 Auto-Join Manager: ❌ Not loaded');
            this.debugInfo.autoJoinManager = false;
        }
    }
    
    checkCrossTabConnection() {
        if (window.crossTabConnection) {
            console.log('🔗 Cross-Tab Connection: ✅ Loaded');
            console.log('  - Session ID:', window.crossTabConnection.sessionId);
            console.log('  - Is Connected:', window.crossTabConnection.isConnected);
            console.log('  - Partner ID:', window.crossTabConnection.partnerId);
            this.debugInfo.crossTabConnection = true;
        } else {
            console.log('🔗 Cross-Tab Connection: ❌ Not loaded');
            this.debugInfo.crossTabConnection = false;
        }
    }
    
    checkActiveSessions() {
        try {
            const sessions = JSON.parse(localStorage.getItem('saathi-tv-sessions') || '{}');
            console.log('👥 Active Sessions:', Object.keys(sessions).length);
            Object.entries(sessions).forEach(([id, session]) => {
                console.log(`  - ${id}: ${session.status} (${new Date(session.timestamp).toLocaleTimeString()})`);
            });
            this.debugInfo.activeSessions = Object.keys(sessions).length;
        } catch (error) {
            console.log('👥 Active Sessions: ❌ Error reading -', error.message);
            this.debugInfo.activeSessions = 0;
        }
    }
    
    getNestedProperty(obj, path) {
        return path.reduce((current, key) => current && current[key], obj);
    }
    
    attemptManualConnection() {
        console.log('🔧 Attempting manual connection fix...');
        
        if (!window.crossTabConnection) {
            console.log('❌ Cross-tab connection not available, creating manual system...');
            this.createManualConnectionSystem();
        } else {
            console.log('✅ Cross-tab connection available, triggering search...');
            window.crossTabConnection.startSearching();
        }
    }
    
    createManualConnectionSystem() {
        console.log('🛠️ Creating manual connection system...');
        
        // Simple localStorage-based connection
        window.manualConnection = {
            sessionId: 'manual_' + Math.random().toString(36).substr(2, 9),
            
            startLooking: function() {
                console.log('🔍 Manual: Starting to look for partner...');
                
                const sessions = this.getSessions();
                sessions[this.sessionId] = {
                    id: this.sessionId,
                    timestamp: Date.now(),
                    status: 'looking'
                };
                localStorage.setItem('manual-sessions', JSON.stringify(sessions));
                
                // Update status
                this.updateStatus('Looking for someone...', 'connecting');
                
                // Check for partners every 2 seconds
                this.searchInterval = setInterval(() => {
                    this.checkForPartner();
                }, 2000);
            },
            
            checkForPartner: function() {
                const sessions = this.getSessions();
                
                for (const [id, session] of Object.entries(sessions)) {
                    if (id !== this.sessionId && 
                        session.status === 'looking' && 
                        Date.now() - session.timestamp < 30000) {
                        
                        console.log('🎉 Manual: Found partner!', id);
                        this.connectToPartner(id);
                        return;
                    }
                }
            },
            
            connectToPartner: function(partnerId) {
                clearInterval(this.searchInterval);
                
                // Update both sessions to connected
                const sessions = this.getSessions();
                sessions[this.sessionId].status = 'connected';
                sessions[this.sessionId].partnerId = partnerId;
                sessions[partnerId].status = 'connected';
                sessions[partnerId].partnerId = this.sessionId;
                
                localStorage.setItem('manual-sessions', JSON.stringify(sessions));
                
                this.updateStatus('Connected!', 'connected');
                
                // Create fake remote video
                this.createFakeVideo();
                
                // Show notification
                if (window.autoJoinManager) {
                    window.autoJoinManager.showNotification('Connected via manual system!', 'success');
                }
                
                console.log('✅ Manual connection established!');
            },
            
            createFakeVideo: function() {
                if (window.autoJoinManager) {
                    window.autoJoinManager.createFakeRemoteVideo();
                }
            },
            
            getSessions: function() {
                try {
                    return JSON.parse(localStorage.getItem('manual-sessions') || '{}');
                } catch (error) {
                    return {};
                }
            },
            
            updateStatus: function(text, status) {
                const statusElement = document.getElementById('connectionStatus');
                if (statusElement) {
                    const statusText = statusElement.querySelector('.status-text');
                    const statusIndicator = statusElement.querySelector('.status-indicator');
                    
                    if (statusText) statusText.textContent = text;
                    if (statusIndicator) statusIndicator.className = `status-indicator ${status}`;
                }
                console.log('📊 Manual Status:', text);
            }
        };
        
        // Override auto-join to use manual system
        if (window.autoJoinManager) {
            window.autoJoinManager.startAutoJoin = function(country, gender) {
                console.log('🔄 Using manual connection system');
                window.manualConnection.startLooking();
            };
        }
        
        console.log('✅ Manual connection system created');
    }
    
    addDebugButton() {
        // Add debug button to video controls
        setTimeout(() => {
            const controls = document.querySelector('.video-controls');
            if (controls) {
                const debugBtn = document.createElement('button');
                debugBtn.innerHTML = '🔍';
                debugBtn.className = 'video-control-btn ripple';
                debugBtn.title = 'Debug Connection';
                debugBtn.style.cssText = `
                    background: #FF6B35 !important;
                    color: white !important;
                    font-size: 16px !important;
                `;
                
                debugBtn.onclick = () => {
                    this.debugAllSystems();
                    this.showDebugModal();
                };
                
                controls.appendChild(debugBtn);
                console.log('🔍 Debug button added to controls');
            }
        }, 3000);
    }
    
    showDebugModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: monospace;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1a1a1a;
            padding: 20px;
            border-radius: 10px;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
            border: 2px solid #FF6B35;
        `;
        
        content.innerHTML = `
            <h3 style="color: #FF6B35; margin-top: 0;">🔍 Connection Debug Report</h3>
            <pre style="font-size: 12px; line-height: 1.4;">
Auto-Join Manager: ${this.debugInfo.autoJoinManager ? '✅' : '❌'}
Cross-Tab Connection: ${this.debugInfo.crossTabConnection ? '✅' : '❌'}
localStorage: ${this.debugInfo.localStorage ? '✅' : '❌'}
BroadcastChannel: ${this.debugInfo.broadcastChannel ? '✅' : '❌'}
Active Sessions: ${this.debugInfo.activeSessions || 0}

${window.crossTabConnection ? `Session ID: ${window.crossTabConnection.sessionId}
Is Connected: ${window.crossTabConnection.isConnected}
Partner ID: ${window.crossTabConnection.partnerId || 'None'}` : 'Cross-tab connection not available'}
            </pre>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #FF6B35; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                Close
            </button>
            <button onclick="window.manualConnection && window.manualConnection.startLooking()" 
                    style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px 0 0 10px;">
                Force Connect
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
}

// Initialize debugger
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.connectionDebugger = new ConnectionDebugger();
    }, 1000);
});

// Export for manual use
window.ConnectionDebugger = ConnectionDebugger;

console.log('🔍 Connection Debug System ready');
