// Simple Connection Test for WebRTC
console.log('🧪 Simple Connection Test Loading...');

class SimpleConnectionTest {
    constructor() {
        this.testResults = {
            socketConnection: false,
            mediaAccess: false,
            webrtcSupport: false,
            iceConnectivity: false
        };
        
        this.init();
    }
    
    init() {
        console.log('🔬 Initializing connection tests...');
        setTimeout(() => {
            this.runTests();
        }, 3000); // Wait for other systems to load
    }
    
    async runTests() {
        console.log('🚀 Running connection tests...');
        
        // Test 1: Socket Connection
        await this.testSocketConnection();
        
        // Test 2: Media Access
        await this.testMediaAccess();
        
        // Test 3: WebRTC Support
        await this.testWebRTCSupport();
        
        // Test 4: ICE Connectivity
        await this.testICEConnectivity();
        
        // Display results
        this.displayResults();
    }
    
    async testSocketConnection() {
        console.log('🔌 Testing socket connection...');
        
        try {
            // Check if socket is available
            if (window.io) {
                const testSocket = window.io('http://localhost:3001', {
                    timeout: 5000,
                    forceNew: true
                });
                
                return new Promise((resolve) => {
                    testSocket.on('connect', () => {
                        console.log('✅ Socket connection test passed');
                        this.testResults.socketConnection = true;
                        testSocket.disconnect();
                        resolve(true);
                    });
                    
                    testSocket.on('connect_error', () => {
                        console.log('❌ Socket connection test failed');
                        this.testResults.socketConnection = false;
                        resolve(false);
                    });
                    
                    setTimeout(() => {
                        console.log('⏰ Socket connection test timeout');
                        this.testResults.socketConnection = false;
                        testSocket.disconnect();
                        resolve(false);
                    }, 5000);
                });
            } else {
                console.log('❌ Socket.io not available');
                this.testResults.socketConnection = false;
            }
        } catch (error) {
            console.log('❌ Socket connection test error:', error);
            this.testResults.socketConnection = false;
        }
    }
    
    async testMediaAccess() {
        console.log('📹 Testing media access...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            console.log('✅ Media access test passed');
            this.testResults.mediaAccess = true;
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            
        } catch (error) {
            console.log('❌ Media access test failed:', error);
            this.testResults.mediaAccess = false;
        }
    }
    
    async testWebRTCSupport() {
        console.log('🔗 Testing WebRTC support...');
        
        try {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            console.log('✅ WebRTC support test passed');
            this.testResults.webrtcSupport = true;
            
            pc.close();
            
        } catch (error) {
            console.log('❌ WebRTC support test failed:', error);
            this.testResults.webrtcSupport = false;
        }
    }
    
    async testICEConnectivity() {
        console.log('🧊 Testing ICE connectivity...');
        
        try {
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            
            return new Promise((resolve) => {
                let candidateFound = false;
                
                pc.onicecandidate = (event) => {
                    if (event.candidate && !candidateFound) {
                        candidateFound = true;
                        console.log('✅ ICE connectivity test passed');
                        this.testResults.iceConnectivity = true;
                        pc.close();
                        resolve(true);
                    }
                };
                
                // Create a dummy data channel to trigger ICE gathering
                pc.createDataChannel('test');
                pc.createOffer().then(offer => {
                    return pc.setLocalDescription(offer);
                });
                
                setTimeout(() => {
                    if (!candidateFound) {
                        console.log('❌ ICE connectivity test failed - timeout');
                        this.testResults.iceConnectivity = false;
                        pc.close();
                        resolve(false);
                    }
                }, 10000);
            });
            
        } catch (error) {
            console.log('❌ ICE connectivity test error:', error);
            this.testResults.iceConnectivity = false;
        }
    }
    
    displayResults() {
        console.log('📊 Connection Test Results:');
        console.log('🔌 Socket Connection:', this.testResults.socketConnection ? '✅ PASS' : '❌ FAIL');
        console.log('📹 Media Access:', this.testResults.mediaAccess ? '✅ PASS' : '❌ FAIL');
        console.log('🔗 WebRTC Support:', this.testResults.webrtcSupport ? '✅ PASS' : '❌ FAIL');
        console.log('🧊 ICE Connectivity:', this.testResults.iceConnectivity ? '✅ PASS' : '❌ FAIL');
        
        const allPassed = Object.values(this.testResults).every(result => result === true);
        
        if (allPassed) {
            console.log('🎉 All tests passed! WebRTC should work properly.');
            this.showTestResult('All connection tests passed! ✅', 'success');
        } else {
            console.log('⚠️ Some tests failed. WebRTC may not work properly.');
            this.showTestResult('Some connection tests failed. Check console for details. ⚠️', 'warning');
            this.suggestFixes();
        }
    }
    
    suggestFixes() {
        console.log('🔧 Suggested fixes:');
        
        if (!this.testResults.socketConnection) {
            console.log('- Check if server is running on localhost:3001');
            console.log('- Check firewall settings');
        }
        
        if (!this.testResults.mediaAccess) {
            console.log('- Allow camera/microphone permissions');
            console.log('- Use HTTPS if on a remote server');
        }
        
        if (!this.testResults.webrtcSupport) {
            console.log('- Update your browser to latest version');
            console.log('- Use Chrome, Firefox, or Safari');
        }
        
        if (!this.testResults.iceConnectivity) {
            console.log('- Check network/firewall settings');
            console.log('- May need TURN server for restrictive networks');
        }
    }
    
    showTestResult(message, type) {
        // Create test result notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#FF9800'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }
}

// Initialize connection test
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 Starting Simple Connection Test...');
    window.simpleConnectionTest = new SimpleConnectionTest();
});

console.log('✅ Simple Connection Test Loaded');
