// Simple Connection Fix for Local Testing
console.log('🔧 Connection Fix Loading...');

// Force localhost connection for local testing
window.FORCE_LOCALHOST = true;

// Override socket connection
const originalIO = window.io;
if (originalIO) {
    window.io = function(url, options) {
        // Force localhost for local testing
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.FORCE_LOCALHOST) {
            url = 'http://localhost:3001';
        }
        
        console.log('🔌 Connecting to:', url);
        return originalIO(url, options);
    };
}

// Simple connection test
function testConnection() {
    console.log('🧪 Testing connection...');
    
    const testSocket = io('http://localhost:3001');
    
    testSocket.on('connect', () => {
        console.log('✅ Test connection successful!');
        testSocket.disconnect();
    });
    
    testSocket.on('connect_error', (error) => {
        console.error('❌ Test connection failed:', error);
    });
    
    setTimeout(() => {
        testSocket.disconnect();
    }, 5000);
}

// Test connection when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testConnection, 2000);
});

console.log('✅ Connection Fix Loaded');
