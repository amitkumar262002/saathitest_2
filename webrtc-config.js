// WebRTC Configuration for Saathi TV
// STUN/TURN server configuration for NAT traversal

const webrtcConfig = {
    // Development configuration (free STUN servers)
    development: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
    },

    // Production configuration (with TURN servers)
    production: {
        iceServers: [
            // STUN servers (free)
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            
            // TURN servers (requires credentials)
            // Uncomment and configure when you have TURN servers
            /*
            {
                urls: 'turn:your-turn-server.com:3478',
                username: process.env.TURN_USER || 'your-turn-username',
                credential: process.env.TURN_PASS || 'your-turn-password'
            },
            {
                urls: 'turns:your-turn-server.com:5349',
                username: process.env.TURN_USER || 'your-turn-username',
                credential: process.env.TURN_PASS || 'your-turn-password'
            }
            */
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
    }
};

// TURN Server Setup Instructions
/*
=== TURN Server Setup for Production ===

1. **Coturn (Open Source TURN Server)**
   - Install: sudo apt-get install coturn
   - Config: /etc/turnserver.conf
   - Example config:
     ```
     listening-port=3478
     tls-listening-port=5349
     relay-device=eth0
     min-port=10000
     max-port=20000
     fingerprint
     lt-cred-mech
     user=username:password
     realm=your-domain.com
     cert=/path/to/cert.pem
     pkey=/path/to/private.key
     ```

2. **Xirsys (Commercial TURN Service)**
   - Sign up at xirsys.com
   - Get credentials from dashboard
   - Use their API to get ICE servers

3. **Twilio STUN/TURN (Commercial)**
   - Sign up at twilio.com
   - Use their Network Traversal Service
   - Get credentials via API

4. **Environment Variables**
   Set these in your deployment:
   - TURN_URL=turn:your-server.com:3478
   - TURN_USER=your-username
   - TURN_PASS=your-password
*/

// Get configuration based on environment
function getWebRTCConfig() {
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname !== 'localhost';
    
    const config = isProduction ? webrtcConfig.production : webrtcConfig.development;
    
    // Add TURN servers from environment variables if available
    if (process.env.TURN_URL && process.env.TURN_USER && process.env.TURN_PASS) {
        config.iceServers.push({
            urls: process.env.TURN_URL,
            username: process.env.TURN_USER,
            credential: process.env.TURN_PASS
        });
    }
    
    return config;
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { webrtcConfig, getWebRTCConfig };
} else {
    window.webrtcConfig = webrtcConfig;
    window.getWebRTCConfig = getWebRTCConfig;
}
