// Ultra Simple WebRTC Server - Direct Peer Matching
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.io with simple CORS
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Simple peer management
class SimplePeerManager {
    constructor() {
        this.waitingUsers = new Set();
        this.connectedPairs = new Map(); // socketId -> peerId
        this.userSockets = new Map(); // socketId -> socket
    }
    
    addUser(socket) {
        this.userSockets.set(socket.id, socket);
        console.log(`👤 User added: ${socket.id} (Total: ${this.userSockets.size})`);
    }
    
    removeUser(socketId) {
        // Remove from waiting
        this.waitingUsers.delete(socketId);
        
        // Disconnect from peer if connected
        const peerId = this.connectedPairs.get(socketId);
        if (peerId) {
            this.disconnectPair(socketId, peerId);
        }
        
        // Remove from user list
        this.userSockets.delete(socketId);
        console.log(`❌ User removed: ${socketId} (Remaining: ${this.userSockets.size})`);
    }
    
    findPeer(socketId) {
        console.log(`🔍 Finding peer for ${socketId}...`);
        
        // Don't match with self
        if (this.waitingUsers.has(socketId)) {
            console.log(`⏳ ${socketId} already waiting`);
            return null;
        }
        
        // Look for someone waiting
        for (const waitingId of this.waitingUsers) {
            if (waitingId !== socketId) {
                // Remove from waiting list
                this.waitingUsers.delete(waitingId);
                
                // Create connection pair
                this.connectedPairs.set(socketId, waitingId);
                this.connectedPairs.set(waitingId, socketId);
                
                console.log(`🎉 Peer match: ${socketId} <-> ${waitingId}`);
                return waitingId;
            }
        }
        
        // No peer found, add to waiting list
        this.waitingUsers.add(socketId);
        console.log(`⏳ Added to waiting list: ${socketId} (Queue: ${this.waitingUsers.size})`);
        return null;
    }
    
    disconnectPair(socketId, peerId) {
        console.log(`💔 Disconnecting pair: ${socketId} <-> ${peerId}`);
        
        // Remove from connected pairs
        this.connectedPairs.delete(socketId);
        this.connectedPairs.delete(peerId);
        
        // Notify peer of disconnection
        const peerSocket = this.userSockets.get(peerId);
        if (peerSocket) {
            peerSocket.emit('peer-disconnected');
        }
    }
    
    getStats() {
        return {
            totalUsers: this.userSockets.size,
            waitingUsers: this.waitingUsers.size,
            connectedPairs: this.connectedPairs.size / 2
        };
    }
}

const peerManager = new SimplePeerManager();

// API endpoint for stats
app.get('/api/stats', (req, res) => {
    res.json(peerManager.getStats());
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    // Add user to manager
    peerManager.addUser(socket);
    
    // Broadcast stats
    io.emit('stats', peerManager.getStats());
    
    // Handle peer finding
    socket.on('find-peer', () => {
        console.log(`🔍 Peer find request from ${socket.id}`);
        
        const peerId = peerManager.findPeer(socket.id);
        
        if (peerId) {
            // Notify both users of the match
            socket.emit('peer-found', peerId);
            
            const peerSocket = peerManager.userSockets.get(peerId);
            if (peerSocket) {
                peerSocket.emit('peer-calling', socket.id);
            }
            
            console.log(`✅ Match created: ${socket.id} -> ${peerId}`);
        } else {
            console.log(`⏳ ${socket.id} added to waiting queue`);
        }
        
        // Broadcast updated stats
        io.emit('stats', peerManager.getStats());
    });
    
    // Handle WebRTC signaling
    socket.on('webrtc-offer', (data) => {
        console.log(`📤 Offer: ${socket.id} -> ${data.to}`);
        const targetSocket = peerManager.userSockets.get(data.to);
        if (targetSocket) {
            targetSocket.emit('webrtc-offer', {
                from: socket.id,
                offer: data.offer
            });
        }
    });
    
    socket.on('webrtc-answer', (data) => {
        console.log(`📤 Answer: ${socket.id} -> ${data.to}`);
        const targetSocket = peerManager.userSockets.get(data.to);
        if (targetSocket) {
            targetSocket.emit('webrtc-answer', {
                from: socket.id,
                answer: data.answer
            });
        }
    });
    
    socket.on('webrtc-ice', (data) => {
        console.log(`🧊 ICE: ${socket.id} -> ${data.to}`);
        const targetSocket = peerManager.userSockets.get(data.to);
        if (targetSocket) {
            targetSocket.emit('webrtc-ice', {
                from: socket.id,
                candidate: data.candidate
            });
        }
    });
    
    // Handle peer disconnection
    socket.on('disconnect-peer', (peerId) => {
        console.log(`💔 Disconnect request: ${socket.id} -> ${peerId}`);
        peerManager.disconnectPair(socket.id, peerId);
        io.emit('stats', peerManager.getStats());
    });
    
    // Handle stop finding
    socket.on('stop-finding', () => {
        console.log(`🛑 Stop finding: ${socket.id}`);
        peerManager.waitingUsers.delete(socket.id);
        
        const peerId = peerManager.connectedPairs.get(socket.id);
        if (peerId) {
            peerManager.disconnectPair(socket.id, peerId);
        }
        
        io.emit('stats', peerManager.getStats());
    });
    
    // Handle socket disconnection
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
        
        peerManager.removeUser(socket.id);
        
        // Broadcast updated stats
        io.emit('stats', peerManager.getStats());
    });
    
    // Handle errors
    socket.on('error', (error) => {
        console.error(`❌ Socket error ${socket.id}:`, error);
    });
});

// Start server
const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
    console.log(`🚀 Ultra Simple WebRTC Server running on port ${PORT}`);
    console.log(`📱 Website: http://localhost:${PORT}`);
    console.log(`🎥 Video Chat: http://localhost:${PORT}/ultra-simple-video-chat.html`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
});

// Periodic stats logging and broadcasting
setInterval(() => {
    const stats = peerManager.getStats();
    if (stats.totalUsers > 0) {
        console.log(`📊 Live Stats: ${stats.totalUsers} users online, ${stats.waitingUsers} waiting, ${stats.connectedPairs} active pairs`);
        
        // Broadcast stats to all connected users
        io.emit('stats', stats);
    }
}, 5000); // Every 5 seconds for real-time updates

// Enhanced user activity tracking
setInterval(() => {
    // Clean up inactive connections
    const now = Date.now();
    const INACTIVE_TIMEOUT = 60000; // 1 minute
    
    for (const [socketId, socket] of peerManager.userSockets) {
        if (!socket.connected) {
            console.log(`🧹 Cleaning up inactive user: ${socketId}`);
            peerManager.removeUser(socketId);
        }
    }
}, 30000); // Every 30 seconds

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io, peerManager };
