// Debug Connection Script
console.log('🐛 Debug Connection Script Loading...');

// Check connection status every 5 seconds
setInterval(() => {
    console.log('🐛 Connection Debug Status:');
    console.log('- Window location:', window.location.href);
    console.log('- Socket.io available:', !!window.io);
    console.log('- SaathiTV exists:', !!window.saathiTV);
    
    if (window.saathiTV) {
        console.log('- Socket exists:', !!window.saathiTV.socket);
        console.log('- Socket connected:', window.saathiTV.socket?.connected);
        console.log('- Is connected:', window.saathiTV.isConnected);
    }
    
    if (window.userStatsDisplay) {
        console.log('- Stats display exists:', true);
        console.log('- Current stats:', window.userStatsDisplay.stats);
    }
    
    console.log('---');
}, 5000);

// Force connection test
function forceConnectionTest() {
    console.log('🔧 Force connection test...');
    
    if (window.io) {
        const testSocket = io('http://localhost:3000');
        
        testSocket.on('connect', () => {
            console.log('✅ Force test: Connected!');
            console.log('Socket ID:', testSocket.id);
            
            // Test user stats
            testSocket.on('userStats', (stats) => {
                console.log('📊 Received stats:', stats);
            });
            
            setTimeout(() => {
                testSocket.disconnect();
                console.log('🔌 Force test: Disconnected');
            }, 3000);
        });
        
        testSocket.on('connect_error', (error) => {
            console.error('❌ Force test: Connection error:', error);
        });
    }
}

// Run force test after 3 seconds
setTimeout(forceConnectionTest, 3000);

console.log('✅ Debug Connection Script Loaded');
