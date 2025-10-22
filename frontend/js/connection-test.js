// Simple Connection Test for Debugging
console.log('🔧 Connection Test Script Loaded');

// Test WebRTC Manager Initialization
window.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM Loaded - Testing Connection Components');
    
    // Check if WebRTC Manager exists
    setTimeout(() => {
        console.log('🔧 WebRTC Manager exists:', !!window.webRTCManager);
        console.log('🔧 SaathiTV exists:', !!window.saathiTV);
        
        if (window.saathiTV) {
            console.log('🔧 Socket exists:', !!window.saathiTV.socket);
            console.log('🔧 Socket connected:', window.saathiTV.socket?.connected);
        }
        
        if (window.webRTCManager) {
            console.log('🔧 WebRTC socket set:', !!window.webRTCManager.socket);
        }
    }, 2000);
});

// Override console.log to add timestamps for debugging
const originalLog = console.log;
console.log = function(...args) {
    const timestamp = new Date().toLocaleTimeString();
    originalLog(`[${timestamp}]`, ...args);
};

// Test socket events
if (typeof io !== 'undefined') {
    console.log('🔧 Socket.io library loaded');
} else {
    console.error('❌ Socket.io library not loaded');
}
