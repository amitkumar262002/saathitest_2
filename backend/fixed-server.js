// FIXED Saathi TV Backend Server - WebRTC & User Tracking Corrected
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup with proper CORS
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "https://saathi-tv.com"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// FIXED Room and User Management System
class FixedRoomManager {
    constructor() {
        this.rooms = new Map();           // roomId -> { id, users[], createdAt, isActive }
        this.users = new Map();           // socketId -> { id, roomId, joinedAt, isActive }
        this.waitingQueue = new Set();    // Set of socketIds waiting for match
        this.socketRoomMap = new Map();   // socketId -> roomId (for quick lookup)
        
        this.stats = {
            onlineUsers: 0,
            usersInRooms: 0,
            waitingUsers: 0,
            activeRooms: 0,
            totalConnections: 0
        };
        
        // Start periodic cleanup and stats broadcast
        this.startPeriodicTasks();
    }
    
    startPeriodicTasks() {
        // Broadcast stats every 2 seconds
        setInterval(() => {
            this.updateStats();
            this.broadcastStats();
        }, 2000);
        
        // Cleanup inactive rooms every 30 seconds
        setInterval(() => {
            this.cleanupInactiveRooms();
        }, 30000);
    }
    
    // FIXED: Add user with proper tracking
    addUser(socketId) {
        this.users.set(socketId, {
            id: socketId,
            roomId: null,
            joinedAt: Date.now(),
            isActive: true,
            lastSeen: Date.now()
        });
        
        this.stats.totalConnections++;
        console.log(`✅ User added: ${socketId} (Total: ${this.users.size})`);
        return true;
    }
    
    // FIXED: Remove user and cleanup properly
    removeUser(socketId) {
        const user = this.users.get(socketId);
        if (!user) return false;
        
        // Remove from waiting queue
        this.waitingQueue.delete(socketId);
        
        // Leave room if in one
        if (user.roomId) {
            this.leaveRoom(socketId);
        }
        
        // Remove user
        this.users.delete(socketId);
        this.socketRoomMap.delete(socketId);
        
        console.log(`❌ User removed: ${socketId} (Remaining: ${this.users.size})`);
        return true;
    }
    
    // FIXED: Find match with proper queue management
    findMatch(socketId) {
        // Don't match with self or if already in queue
        if (this.waitingQueue.has(socketId)) {
            console.log(`⏳ User ${socketId} already in waiting queue`);
            return null;
        }
        
        // Look for someone in the waiting queue
        for (const waitingSocketId of this.waitingQueue) {
            if (waitingSocketId !== socketId) {
                // Remove both from waiting queue
                this.waitingQueue.delete(waitingSocketId);
                
                console.log(`🎉 Match found: ${socketId} <-> ${waitingSocketId}`);
                return waitingSocketId;
            }
        }
        
        // No match found, add to waiting queue
        this.waitingQueue.add(socketId);
        console.log(`⏳ Added to queue: ${socketId} (Queue size: ${this.waitingQueue.size})`);
        return null;
    }
    
    // FIXED: Create room with proper user assignment
    createRoom(user1Id, user2Id) {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const room = {
            id: roomId,
            users: [user1Id, user2Id],
            createdAt: Date.now(),
            isActive: true,
            lastActivity: Date.now()
        };
        
        this.rooms.set(roomId, room);
        
        // Update user room assignments
        const user1 = this.users.get(user1Id);
        const user2 = this.users.get(user2Id);
        
        if (user1) {
            user1.roomId = roomId;
            this.socketRoomMap.set(user1Id, roomId);
        }
        if (user2) {
            user2.roomId = roomId;
            this.socketRoomMap.set(user2Id, roomId);
        }
        
        console.log(`🏠 Room created: ${roomId} for users [${user1Id}, ${user2Id}]`);
        return roomId;
    }
    
    // FIXED: Leave room with proper cleanup
    leaveRoom(socketId) {
        const roomId = this.socketRoomMap.get(socketId);
        if (!roomId) return false;
        
        const room = this.rooms.get(roomId);
        if (!room) return false;
        
        // Remove user from room
        room.users = room.users.filter(id => id !== socketId);
        
        // Update user
        const user = this.users.get(socketId);
        if (user) {
            user.roomId = null;
        }
        this.socketRoomMap.delete(socketId);
        
        console.log(`👋 User ${socketId} left room ${roomId}`);
        
        // If room is empty, delete it
        if (room.users.length === 0) {
            this.rooms.delete(roomId);
            console.log(`🗑️ Empty room deleted: ${roomId}`);
        } else {
            // Notify remaining users
            room.users.forEach(userId => {
                io.to(userId).emit('peer_left', { roomId });
            });
        }
        
        return true;
    }
    
    // FIXED: Update stats accurately
    updateStats() {
        this.stats.onlineUsers = this.users.size;
        this.stats.usersInRooms = Array.from(this.users.values()).filter(u => u.roomId).length;
        this.stats.waitingUsers = this.waitingQueue.size;
        this.stats.activeRooms = this.rooms.size;
    }
    
    // FIXED: Broadcast stats to all clients
    broadcastStats() {
        io.emit('userStats', this.stats);
        io.emit('online_count', { count: this.stats.onlineUsers });
    }
    
    // FIXED: Cleanup inactive rooms
    cleanupInactiveRooms() {
        const now = Date.now();
        const ROOM_TIMEOUT = 10 * 60 * 1000; // 10 minutes
        
        for (const [roomId, room] of this.rooms) {
            if (now - room.lastActivity > ROOM_TIMEOUT) {
                console.log(`🧹 Cleaning up inactive room: ${roomId}`);
                
                // Notify users and remove them
                room.users.forEach(userId => {
                    const user = this.users.get(userId);
                    if (user) {
                        user.roomId = null;
                        this.socketRoomMap.delete(userId);
                    }
                });
                
                this.rooms.delete(roomId);
            }
        }
    }
    
    getStats() {
        return { ...this.stats };
    }
}

// Initialize fixed room manager
const roomManager = new FixedRoomManager();

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        stats: roomManager.getStats()
    });
});

app.get('/api/stats', (req, res) => {
    res.json(roomManager.getStats());
});

// FIXED Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    
    // Add user to room manager
    roomManager.addUser(socket.id);
    
    // Send initial stats
    socket.emit('userStats', roomManager.getStats());
    
    // FIXED: Handle find match request
    socket.on('find_match', (preferences = {}) => {
        console.log(`🔍 Find match request from ${socket.id}`);
        
        const matchedUserId = roomManager.findMatch(socket.id);
        
        if (matchedUserId) {
            // Create room for matched users
            const roomId = roomManager.createRoom(socket.id, matchedUserId);
            
            // Join both users to socket room
            socket.join(roomId);
            const matchedSocket = io.sockets.sockets.get(matchedUserId);
            if (matchedSocket) {
                matchedSocket.join(roomId);
            }
            
            // Notify both users of the match
            const matchData = {
                roomId: roomId,
                peers: [socket.id, matchedUserId]
            };
            
            // Send match notification
            socket.emit('matched', { ...matchData, isInitiator: true });
            io.to(matchedUserId).emit('matched', { ...matchData, isInitiator: false });
            
            console.log(`✅ Match created: Room ${roomId} for ${socket.id} & ${matchedUserId}`);
        } else {
            // Send waiting status
            socket.emit('waiting', { 
                message: 'Looking for someone to chat with...',
                queuePosition: roomManager.waitingQueue.size
            });
        }
    });
    
    // FIXED: Handle WebRTC signaling with proper room validation
    socket.on('signal', (data) => {
        const { roomId, payload } = data;
        
        // Validate user is in the room
        const userRoomId = roomManager.socketRoomMap.get(socket.id);
        if (userRoomId !== roomId) {
            console.warn(`⚠️ Signal from ${socket.id} for wrong room ${roomId} (user in ${userRoomId})`);
            return;
        }
        
        // Forward signal to other user in room
        socket.to(roomId).emit('signal', {
            from: socket.id,
            payload: payload
        });
        
        console.log(`📡 Signal forwarded in room ${roomId}: ${payload.type || 'ice-candidate'}`);
    });
    
    // FIXED: Handle leave room
    socket.on('leave_room', (data) => {
        const { roomId } = data;
        console.log(`🚪 Leave room request from ${socket.id} for room ${roomId}`);
        
        socket.leave(roomId);
        roomManager.leaveRoom(socket.id);
    });
    
    // FIXED: Handle chat messages
    socket.on('chat_message', (data) => {
        const { roomId, message } = data;
        const userRoomId = roomManager.socketRoomMap.get(socket.id);
        
        if (userRoomId === roomId) {
            socket.to(roomId).emit('chat_message', {
                from: socket.id,
                message: message,
                timestamp: Date.now()
            });
            console.log(`💬 Chat message in room ${roomId}`);
        }
    });
    
    // FIXED: Handle heartbeat for connection monitoring
    socket.on('heartbeat', () => {
        const user = roomManager.users.get(socket.id);
        if (user) {
            user.lastSeen = Date.now();
        }
        socket.emit('heartbeat_ack');
    });
    
    // FIXED: Handle disconnection with proper cleanup
    socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${socket.id} (Reason: ${reason})`);
        
        // Remove user and cleanup
        roomManager.removeUser(socket.id);
        
        // Broadcast updated stats
        setTimeout(() => {
            roomManager.updateStats();
            roomManager.broadcastStats();
        }, 100);
    });
    
    // Handle errors
    socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
    });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 FIXED Saathi TV server running on port ${PORT}`);
    console.log(`📱 Website available at http://localhost:${PORT}`);
    console.log(`🔧 WebRTC signaling and user tracking FIXED`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io, roomManager };
