// Localhost Server Connection Fix
console.log('🔧 Localhost Server Fix loaded');

// Check if we're running on localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

// Mock backend server responses (available globally)
const mockBackendResponses = {
    '/api/health': { status: 'ok', message: 'Mock server running' },
    '/api/users/online': { count: Math.floor(Math.random() * 1000) + 100 },
    '/api/chat/connect': { success: true, roomId: 'mock-room-' + Date.now() },
    '/api/user/profile': { id: 'demo-user', name: 'Demo User' }
};

if (isLocalhost) {
    console.log('🏠 Running on localhost - applying server fixes');
    
    // Override fetch for localhost backend calls
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Check if it's a backend API call
        if (typeof url === 'string' && (url.includes(':3000') || url.includes('/api/'))) {
            console.log('🔄 Mocking backend call:', url);
            
            // Extract the path from the URL
            let path = url;
            if (url.includes('://')) {
                path = '/' + url.split('/').slice(3).join('/');
            }
            
            // Find matching mock response
            const mockResponse = mockBackendResponses[path] || mockBackendResponses['/api/health'];
            
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });
        }
        
        // For non-backend calls, use original fetch
        return originalFetch.apply(this, arguments);
    };
    
    // Mock WebSocket connections
    if (window.WebSocket) {
        const OriginalWebSocket = window.WebSocket;
        window.WebSocket = function(url, protocols) {
            console.log('🔄 Mocking WebSocket connection:', url);
            
            // Create a mock WebSocket object
            const mockSocket = {
                readyState: 1, // OPEN
                send: function(data) {
                    console.log('📤 Mock WebSocket send:', data);
                },
                close: function() {
                    console.log('🔌 Mock WebSocket close');
                    this.readyState = 3; // CLOSED
                },
                addEventListener: function(event, callback) {
                    console.log('👂 Mock WebSocket event listener:', event);
                    if (event === 'open') {
                        setTimeout(callback, 100);
                    }
                }
            };
            
            // Simulate connection events
            setTimeout(() => {
                if (mockSocket.onopen) mockSocket.onopen();
            }, 100);
            
            return mockSocket;
        };
    }
    
    // Show localhost development notice
    window.addEventListener('DOMContentLoaded', function() {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            max-width: 250px;
        `;
        notice.innerHTML = `
            🏠 <strong>Localhost Mode</strong><br>
            Backend calls are mocked<br>
            <a href="#" onclick="this.parentElement.style.display='none'" style="color: white; text-decoration: underline; font-size: 10px;">Close</a>
        `;
        document.body.appendChild(notice);
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (notice.parentElement) {
                notice.style.display = 'none';
            }
        }, 8000);
    });
    
} else {
    console.log('🌐 Running on remote server - no localhost fixes needed');
}

// Export for global use
window.localhostFix = {
    isLocalhost,
    mockBackendResponses
};

console.log('✅ Localhost Server Fix ready');
