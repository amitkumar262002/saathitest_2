// Production-Ready Signaling Server for Saathi TV
// Handles WebRTC signaling, matchmaking, and online user tracking

const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:8080", "https://saathi-tv.com"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Optional Redis support for horizontal scaling
const Redis = require('ioredis');
const redisUrl = process.env.REDIS_URL || null;
const redis = redisUrl ? new Redis(redisUrl) : null;

// In-memory storage (fallback when Redis not available)
const waitingQueue = [];
const activeRooms = new Map();
const onlineUsers = new Set();
const userSockets = new Map(); // socketId -> user info

// Configuration
const config = {
    maxWaitTime: 30000, // 30 seconds max wait time
    heartbeatInterval: 10000, // 10 seconds
    roomTimeout: 300000, // 5 minutes room timeout
    maxUsersPerRoom: 2
};

class SignalingServer {
    constructor() {
        this.stats = {
            totalConnections: 0,
            activeUsers: 0,
            activeRooms: 0,
            waitingUsers: 0,
            totalMatches: 0
        };
        
        this.startStatsUpdater();
        this.startCleanupTask();
    }

    // Get accurate online count
    getOnlineCount() {
        if (redis) {
            // For multi-instance deployments, use Redis
            return redis.scard('online_users').catch(() => onlineUsers.size);
        }
        return onlineUsers.size;
    }

    // Add user to online tracking
    async addOnlineUser(socketId, userInfo = {}) {
        onlineUsers.add(socketId);
        userSockets.set(socketId, {
            id: socketId,
            joinedAt: Date.now(),
            lastHeartbeat: Date.now(),
            roomId: null,
            preferences: {},
            ...userInfo
        });

        if (redis) {
            await redis.sadd('online_users', socketId);
            await redis.setex(`user:${socketId}`, 60, JSON.stringify(userSockets.get(socketId)));
        }

        this.updateStats();
        console.log(`👤 User ${socketId} added. Online: ${onlineUsers.size}`);
    }

    // Remove user from online tracking
    async removeOnlineUser(socketId) {
        const user = userSockets.get(socketId);
        
        if (user) {
            // Remove from waiting queue
            const queueIndex = waitingQueue.findIndex(u => u.id === socketId);
            if (queueIndex !== -1) {
                waitingQueue.splice(queueIndex, 1);
            }

            // Leave room if in one
            if (user.roomId) {
                this.leaveRoom(socketId, user.roomId);
            }
        }

        onlineUsers.delete(socketId);
        userSockets.delete(socketId);

        if (redis) {
            await redis.srem('online_users', socketId);
            await redis.del(`user:${socketId}`);
        }

        this.updateStats();
        console.log(`👤 User ${socketId} removed. Online: ${onlineUsers.size}`);
    }

    // Find a match for user
    findMatch(socketId, preferences = {}) {
        const user = userSockets.get(socketId);
        if (!user) return null;

        console.log(`🔍 Finding match for ${socketId}. Queue: ${waitingQueue.length}`);

        // Look for compatible users in waiting queue
        for (let i = 0; i < waitingQueue.length; i++) {
            const waitingUser = waitingQueue[i];
            
            if (waitingUser.id === socketId) continue;
            
            // Check if user is still online
            if (!onlineUsers.has(waitingUser.id)) {
                waitingQueue.splice(i, 1);
                i--;
                continue;
            }

            // Check compatibility
            if (this.areCompatible(preferences, waitingUser.preferences)) {
                // Remove from queue and return match
                waitingQueue.splice(i, 1);
                console.log(`✅ Match found: ${socketId} <-> ${waitingUser.id}`);
                return waitingUser.id;
            }
        }

        // No match found, add to waiting queue
        const queueUser = {
            id: socketId,
            preferences,
            timestamp: Date.now()
        };
        
        waitingQueue.push(queueUser);
        console.log(`⏳ Added ${socketId} to queue. Total waiting: ${waitingQueue.length}`);
        
        return null;
    }

    // Check if two users are compatible
    areCompatible(prefs1, prefs2) {
        // Country compatibility
        if (prefs1.country && prefs1.country !== 'any' && 
            prefs2.country && prefs2.country !== 'any' && 
            prefs1.country !== prefs2.country) {
            return false;
        }

        // Gender compatibility (simplified)
        if (prefs1.gender && prefs1.gender !== 'any' && 
            prefs2.gender && prefs2.gender !== 'any' && 
            prefs1.gender !== prefs2.gender) {
            return false;
        }

        return true;
    }

    // Create room for matched users
    createRoom(user1Id, user2Id) {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        const room = {
            id: roomId,
            users: [user1Id, user2Id],
            createdAt: Date.now(),
            lastActivity: Date.now(),
            status: 'active'
        };

        activeRooms.set(roomId, room);

        // Update user room assignments
        const user1 = userSockets.get(user1Id);
        const user2 = userSockets.get(user2Id);
        
        if (user1) user1.roomId = roomId;
        if (user2) user2.roomId = roomId;

        this.stats.totalMatches++;
        this.updateStats();

        console.log(`🏠 Room ${roomId} created for ${user1Id} and ${user2Id}`);
        return roomId;
    }

    // Handle user leaving room
    leaveRoom(socketId, roomId) {
        const room = activeRooms.get(roomId);
        if (!room) return;

        // Remove user from room
        room.users = room.users.filter(id => id !== socketId);
        
        // Update user info
        const user = userSockets.get(socketId);
        if (user) {
            user.roomId = null;
        }

        // If room is empty, delete it
        if (room.users.length === 0) {
            activeRooms.delete(roomId);
            console.log(`🏠 Room ${roomId} deleted (empty)`);
        } else {
            // Notify remaining users
            room.users.forEach(userId => {
                const socket = io.sockets.sockets.get(userId);
                if (socket) {
                    socket.emit('peer_left', { roomId });
                }
            });
            console.log(`🚪 User ${socketId} left room ${roomId}`);
        }

        this.updateStats();
    }

    // Update and broadcast statistics
    updateStats() {
        this.stats.activeUsers = onlineUsers.size;
        this.stats.activeRooms = activeRooms.size;
        this.stats.waitingUsers = waitingQueue.length;
    }

    startStatsUpdater() {
        setInterval(() => {
            this.updateStats();
            io.emit('online_count', { count: this.stats.activeUsers });
            io.emit('user_stats', this.stats);
        }, 2000);
    }

    // Cleanup inactive rooms and users
    startCleanupTask() {
        setInterval(() => {
            const now = Date.now();
            
            // Clean up inactive rooms
            for (const [roomId, room] of activeRooms) {
                if (now - room.lastActivity > config.roomTimeout) {
                    console.log(`🧹 Cleaning up inactive room: ${roomId}`);
                    activeRooms.delete(roomId);
                }
            }
            
            // Clean up waiting queue
            for (let i = waitingQueue.length - 1; i >= 0; i--) {
                const user = waitingQueue[i];
                if (now - user.timestamp > config.maxWaitTime || !onlineUsers.has(user.id)) {
                    waitingQueue.splice(i, 1);
                }
            }
            
            this.updateStats();
        }, 30000); // Run every 30 seconds
    }
}

// Initialize signaling server
const signalingServer = new SignalingServer();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    
    // Add to online users
    signalingServer.addOnlineUser(socket.id, {
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address
    });

    // Handle find match request
    socket.on('find_match', async (preferences = {}) => {
        console.log(`🎯 Match request from ${socket.id}:`, preferences);
        
        const matchedUserId = signalingServer.findMatch(socket.id, preferences);
        
        if (matchedUserId) {
            // Create room for matched users
            const roomId = signalingServer.createRoom(socket.id, matchedUserId);
            
            // Join both users to socket room
            socket.join(roomId);
            const matchedSocket = io.sockets.sockets.get(matchedUserId);
            if (matchedSocket) {
                matchedSocket.join(roomId);
            }
            
            // Notify both users of successful match
            io.to(roomId).emit('matched', { 
                roomId, 
                peers: [socket.id, matchedUserId] 
            });
            
            console.log(`🎉 Match successful: ${roomId}`);
        } else {
            // No match found, user is in waiting queue
            socket.emit('waiting', { 
                message: 'Looking for someone to chat with...',
                queuePosition: waitingQueue.length 
            });
        }
    });

    // Handle WebRTC signaling
    socket.on('signal', ({ roomId, payload }) => {
        console.log(`📡 Signal from ${socket.id} to room ${roomId}:`, payload.type || 'ice-candidate');
        socket.to(roomId).emit('signal', { 
            from: socket.id, 
            payload 
        });
        
        // Update room activity
        const room = activeRooms.get(roomId);
        if (room) {
            room.lastActivity = Date.now();
        }
    });

    // Handle leaving room
    socket.on('leave_room', ({ roomId }) => {
        console.log(`🚪 User ${socket.id} leaving room ${roomId}`);
        socket.leave(roomId);
        signalingServer.leaveRoom(socket.id, roomId);
    });

    // Handle heartbeat for connection monitoring
    socket.on('heartbeat', () => {
        const user = userSockets.get(socket.id);
        if (user) {
            user.lastHeartbeat = Date.now();
        }
        socket.emit('heartbeat_ack');
    });

    // Handle chat messages
    socket.on('chat_message', ({ roomId, message }) => {
        const user = userSockets.get(socket.id);
        if (user && user.roomId === roomId) {
            socket.to(roomId).emit('chat_message', {
                from: socket.id,
                message,
                timestamp: Date.now()
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
        signalingServer.removeOnlineUser(socket.id);
    });

    // Handle connection errors
    socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
    });
});

// Health check endpoint
const app = require('express')();
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats: signalingServer.stats,
        uptime: process.uptime()
    });
});

app.get('/stats', (req, res) => {
    res.json(signalingServer.stats);
});

// Start server
const PORT = process.env.SOCKET_IO_PORT || process.env.PORT || 3001;

http.listen(PORT, () => {
    console.log(`🚀 Signaling server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 Stats endpoint: http://localhost:${PORT}/stats`);
    
    if (redis) {
        console.log(`🔴 Redis connected for scaling`);
    } else {
        console.log(`💾 Using in-memory storage`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    http.close(() => {
        console.log('Server closed');
        if (redis) redis.disconnect();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    http.close(() => {
        console.log('Server closed');
        if (redis) redis.disconnect();
        process.exit(0);
    });
});

module.exports = { app: http, io, signalingServer };
