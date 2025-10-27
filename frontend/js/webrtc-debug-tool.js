// WebRTC Debug Tool
console.log('🔧 WebRTC Debug Tool Loading...');

class WebRTCDebugTool {
    constructor() {
        this.debugInfo = {
            socketStatus: 'Unknown',
            mediaStatus: 'Unknown',
            peerConnectionStatus: 'Unknown',
            iceConnectionStatus: 'Unknown',
            roomId: null,
            isInitiator: null,
            lastError: null
        };
        
        this.init();
    }
    
    init() {
        this.createDebugPanel();
        this.startMonitoring();
    }
    
    createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'webrtcDebugPanel';
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 300px;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        `;
        
        debugPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #4CAF50;">
                🔧 WebRTC Debug Info
                <button onclick="this.parentElement.parentElement.style.display='none'" style="float: right; background: #f44336; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer;">×</button>
            </div>
            <div id="debugContent">
                <div>Socket: <span id="debugSocket">Unknown</span></div>
                <div>Media: <span id="debugMedia">Unknown</span></div>
                <div>Peer Connection: <span id="debugPeerConnection">Unknown</span></div>
                <div>ICE Connection: <span id="debugIceConnection">Unknown</span></div>
                <div>Room ID: <span id="debugRoomId">None</span></div>
                <div>Role: <span id="debugRole">Unknown</span></div>
                <div>Last Error: <span id="debugError">None</span></div>
            </div>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: #2196F3;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 10000;
            font-size: 12px;
        `;
        toggleBtn.textContent = '🔧 Debug';
        toggleBtn.onclick = () => {
            const panel = document.getElementById('webrtcDebugPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        };
        
        document.body.appendChild(toggleBtn);
    }
    
    startMonitoring() {
        setInterval(() => {
            this.updateDebugInfo();
        }, 1000);
    }
    
    updateDebugInfo() {
        // Check socket status
        if (window.unifiedWebRTC && window.unifiedWebRTC.socket) {
            this.debugInfo.socketStatus = window.unifiedWebRTC.socket.connected ? 'Connected' : 'Disconnected';
        }
        
        // Check media status
        if (window.unifiedWebRTC && window.unifiedWebRTC.localStream) {
            const videoTrack = window.unifiedWebRTC.localStream.getVideoTracks()[0];
            const audioTrack = window.unifiedWebRTC.localStream.getAudioTracks()[0];
            this.debugInfo.mediaStatus = `Video: ${videoTrack ? 'OK' : 'None'}, Audio: ${audioTrack ? 'OK' : 'None'}`;
        }
        
        // Check peer connection status
        if (window.unifiedWebRTC && window.unifiedWebRTC.peerConnection) {
            this.debugInfo.peerConnectionStatus = window.unifiedWebRTC.peerConnection.connectionState;
            this.debugInfo.iceConnectionStatus = window.unifiedWebRTC.peerConnection.iceConnectionState;
        }
        
        // Check room info
        if (window.unifiedWebRTC) {
            this.debugInfo.roomId = window.unifiedWebRTC.roomId || 'None';
            this.debugInfo.isInitiator = window.unifiedWebRTC.isInitiator ? 'Initiator' : 'Receiver';
        }
        
        this.updateDebugDisplay();
    }
    
    updateDebugDisplay() {
        const elements = {
            debugSocket: this.debugInfo.socketStatus,
            debugMedia: this.debugInfo.mediaStatus,
            debugPeerConnection: this.debugInfo.peerConnectionStatus,
            debugIceConnection: this.debugInfo.iceConnectionStatus,
            debugRoomId: this.debugInfo.roomId,
            debugRole: this.debugInfo.isInitiator,
            debugError: this.debugInfo.lastError || 'None'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // Color coding
                if (id === 'debugSocket') {
                    element.style.color = value === 'Connected' ? '#4CAF50' : '#f44336';
                } else if (id === 'debugPeerConnection') {
                    element.style.color = value === 'connected' ? '#4CAF50' : 
                                         value === 'failed' ? '#f44336' : '#FF9800';
                } else if (id === 'debugIceConnection') {
                    element.style.color = value === 'connected' || value === 'completed' ? '#4CAF50' : 
                                         value === 'failed' ? '#f44336' : '#FF9800';
                }
            }
        });
    }
    
    logError(error) {
        this.debugInfo.lastError = error;
        console.error('🔧 WebRTC Debug:', error);
    }
}

// Initialize debug tool
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Starting WebRTC Debug Tool...');
    window.webrtcDebugTool = new WebRTCDebugTool();
});

// Global error handler
window.addEventListener('error', (event) => {
    if (window.webrtcDebugTool && event.error) {
        window.webrtcDebugTool.logError(event.error.message);
    }
});

console.log('✅ WebRTC Debug Tool Loaded');
