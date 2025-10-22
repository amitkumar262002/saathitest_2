// GitHub Pages Fix - Disable Backend Dependencies
console.log('🔧 GitHub Pages compatibility mode enabled');

// Only override fetch if not already overridden by localhost-server-fix
if (!window.localhostFix || !window.localhostFix.isLocalhost) {
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // Block localhost backend calls
        if (typeof url === 'string' && (url.includes('localhost:3000') || url.includes('127.0.0.1:3000'))) {
            console.log('🚫 Blocked backend call:', url);
            return Promise.reject(new Error('Backend not available on GitHub Pages'));
        }
        return originalFetch.apply(this, arguments);
    };
}

// Override Socket.io connections
if (window.io) {
    const originalIo = window.io;
    window.io = function(url, options) {
        if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
            console.log('🚫 Blocked Socket.io connection to localhost');
            // Return mock socket object
            return {
                on: function(event, callback) {
                    console.log('📡 Mock socket event:', event);
                    if (event === 'connect') {
                        setTimeout(() => callback(), 100);
                    }
                },
                emit: function(event, data) {
                    console.log('📤 Mock socket emit:', event, data);
                },
                disconnect: function() {
                    console.log('🔌 Mock socket disconnect');
                }
            };
        }
        return originalIo.apply(this, arguments);
    };
}

// Mock backend-dependent functions
window.mockBackendFunctions = {
    // Mock chat functionality
    startChat: function() {
        console.log('💬 Mock chat started (GitHub Pages mode)');
        return Promise.resolve();
    },
    
    // Mock user matching
    findNextUser: function() {
        console.log('👥 Mock user matching (GitHub Pages mode)');
        return Promise.resolve({ id: 'demo-user', name: 'Demo User' });
    },
    
    // Mock reporting
    reportUser: function(reason) {
        console.log('🚩 Mock user report:', reason);
        alert('Report submitted (demo mode)');
        return Promise.resolve();
    }
};

// Show GitHub Pages notice
document.addEventListener('DOMContentLoaded', function() {
    // Add notice banner
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ff6b6b, #ffa500);
        color: white;
        text-align: center;
        padding: 10px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notice.innerHTML = `
        🌐 Demo Mode - Running on GitHub Pages | 
        Real-time features disabled | 
        <a href="#" onclick="this.parentElement.style.display='none'" style="color: white; text-decoration: underline;">Close</a>
    `;
    document.body.appendChild(notice);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        notice.style.display = 'none';
    }, 10000);
});

// Export for global use
window.githubPagesFix = true;
