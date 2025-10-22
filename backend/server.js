// Saathi TV Backend Server
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:8080", "https://saathi-tv.com"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "wss:", "https:"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Room and user management
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.users = new Map();
        this.waitingUsers = new Map();
        this.userStats = {
            totalConnections: 0,
            activeUsers: 0,
            totalRooms: 0
        };
    }

    addUser(socketId, userInfo) {
        this.users.set(socketId, {
            id: socketId,
            ...userInfo,
            joinedAt: Date.now(),
            roomId: null,
            isActive: true
        });
        this.userStats.activeUsers++;
        this.userStats.totalConnections++;
    }

    removeUser(socketId) {
        const user = this.users.get(socketId);
        if (user) {
            // Remove from room if in one
            if (user.roomId) {
                this.leaveRoom(socketId, user.roomId);
            }
            
            // Remove from waiting list
            this.waitingUsers.delete(socketId);
            
            // Remove user
            this.users.delete(socketId);
            this.userStats.activeUsers--;
        }
    }

    findMatch(socketId, preferences = {}) {
        const user = this.users.get(socketId);
        if (!user) return null;

        // Look for waiting users with compatible preferences
        for (const [waitingSocketId, waitingUser] of this.waitingUsers) {
            if (waitingSocketId === socketId) continue;
            
            // Check compatibility
            if (this.isCompatible(user, waitingUser, preferences)) {
                // Remove from waiting list
                this.waitingUsers.delete(waitingSocketId);
                return waitingSocketId;
            }
        }

        // No match found, add to waiting list
        this.waitingUsers.set(socketId, { ...user, preferences });
        return null;
    }

    isCompatible(user1, user2, preferences) {
        // Country preference
        if (preferences.country && preferences.country !== 'any') {
            const user2Prefs = this.waitingUsers.get(user2.id)?.preferences || {};
            if (user2Prefs.country && user2Prefs.country !== 'any' && 
                user2Prefs.country !== preferences.country) {
                return false;
            }
        }

        // Gender preference
        if (preferences.gender && preferences.gender !== 'any') {
            const user2Prefs = this.waitingUsers.get(user2.id)?.preferences || {};
            if (user2Prefs.gender && user2Prefs.gender !== 'any' && 
                user2Prefs.gender !== preferences.gender) {
                return false;
            }
        }

        return true;
    }

    createRoom(user1Id, user2Id) {
        const roomId = this.generateRoomId();
        const room = {
            id: roomId,
            users: [user1Id, user2Id],
            createdAt: Date.now(),
            messages: [],
            isActive: true
        };

        this.rooms.set(roomId, room);
        
        // Update user room assignments
        const user1 = this.users.get(user1Id);
        const user2 = this.users.get(user2Id);
        
        if (user1) user1.roomId = roomId;
        if (user2) user2.roomId = roomId;

        this.userStats.totalRooms++;
        return roomId;
    }

    leaveRoom(socketId, roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Remove user from room
        room.users = room.users.filter(id => id !== socketId);
        
        // Update user
        const user = this.users.get(socketId);
        if (user) {
            user.roomId = null;
        }

        // If room is empty, delete it
        if (room.users.length === 0) {
            this.rooms.delete(roomId);
        } else {
            // Notify remaining users
            room.users.forEach(userId => {
                io.to(userId).emit('user-left');
            });
        }
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    addMessage(roomId, message) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.messages.push({
                ...message,
                timestamp: Date.now()
            });
            
            // Keep only last 50 messages
            if (room.messages.length > 50) {
                room.messages = room.messages.slice(-50);
            }
        }
    }

    generateRoomId() {
        return 'room_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getStats() {
        return {
            ...this.userStats,
            activeRooms: this.rooms.size,
            waitingUsers: this.waitingUsers.size
        };
    }
}

// Initialize room manager
const roomManager = new RoomManager();

// API Routes
app.get('/api/stats', (req, res) => {
    res.json(roomManager.getStats());
});

// Browser check endpoint
app.post('/api/browser-check', (req, res) => {
    const browserData = req.body;
    console.log('🔍 Browser Check Data:', {
        type: browserData.type,
        timestamp: browserData.timestamp,
        browser: browserData.browserInfo?.browser,
        os: browserData.browserInfo?.os
    });
    
    // Store browser data (you can save to database here)
    if (browserData.type === 'element-data') {
        console.log('📋 Element:', browserData.element.tagName, browserData.element.id || browserData.element.className);
    } else if (browserData.type === 'console-data') {
        console.log('💬 Console:', browserData.console.type, browserData.console.message);
    }
    
    res.json({ status: 'received', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/user-count', (req, res) => {
    res.json({ count: roomManager.userStats.activeUsers });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Add user to room manager
    roomManager.addUser(socket.id, {
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address
    });

    // Broadcast updated user count
    io.emit('userCount', roomManager.userStats.activeUsers);

    // Handle join room request
    socket.on('joinRoom', (data) => {
        console.log(`User ${socket.id} requesting to join room with preferences:`, data);
        
        // Find a match
        const matchedUserId = roomManager.findMatch(socket.id, data);
        
        if (matchedUserId) {
            // Create room with matched user
            const roomId = roomManager.createRoom(socket.id, matchedUserId);
            
            // Join both users to the room
            socket.join(roomId);
            io.sockets.sockets.get(matchedUserId)?.join(roomId);
            
            // Notify both users they joined the room
            socket.emit('roomJoined', roomId);
            io.to(matchedUserId).emit('roomJoined', roomId);
            
            // Only the first user (socket.id) should be the initiator
            socket.emit('user-joined', { roomId, userId: matchedUserId, isInitiator: true });
            io.to(matchedUserId).emit('peer-ready', { roomId, userId: socket.id, isInitiator: false });
            
            console.log(`Room ${roomId} created for users ${socket.id} and ${matchedUserId}`);
        } else {
            // No match found, user is in waiting list
            socket.emit('waiting', { message: 'Looking for someone to chat with...' });
        }
    });

    // Handle leaving room
    socket.on('leaveRoom', (roomId) => {
        console.log(`User ${socket.id} leaving room ${roomId}`);
        
        socket.leave(roomId);
        roomManager.leaveRoom(socket.id, roomId);
        
        // Notify other users in the room
        socket.to(roomId).emit('user-left');
    });

    // Handle WebRTC signaling
    socket.on('offer', (data) => {
        console.log(`Offer from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit('offer', {
            offer: data.offer,
            roomId: data.roomId,
            from: socket.id
        });
    });

    socket.on('answer', (data) => {
        console.log(`Answer from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit('answer', {
            answer: data.answer,
            roomId: data.roomId,
            from: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        console.log(`ICE candidate from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit('ice-candidate', {
            candidate: data.candidate,
            roomId: data.roomId,
            from: socket.id
        });
    });

    // Handle chat messages
    socket.on('message', (data) => {
        const user = roomManager.users.get(socket.id);
        if (!user || !user.roomId) return;

        const message = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            text: data.text,
            from: socket.id,
            timestamp: Date.now()
        };

        // Add message to room
        roomManager.addMessage(user.roomId, message);
        
        // Broadcast to room (excluding sender)
        socket.to(user.roomId).emit('message', message);
        
        console.log(`Message in room ${user.roomId}: ${data.text}`);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        const user = roomManager.users.get(socket.id);
        if (user && user.roomId) {
            socket.to(user.roomId).emit('typing', { from: socket.id });
        }
    });

    socket.on('stop-typing', (data) => {
        const user = roomManager.users.get(socket.id);
        if (user && user.roomId) {
            socket.to(user.roomId).emit('stop-typing', { from: socket.id });
        }
    });

    // Handle user reporting
    socket.on('report-user', (data) => {
        console.log(`User ${socket.id} reported user ${data.reportedUserId} for: ${data.reason}`);
        
        // In a real application, you would store this in a database
        // and implement moderation features
        
        // For now, just log it
        const report = {
            reporter: socket.id,
            reported: data.reportedUserId,
            reason: data.reason,
            timestamp: Date.now()
        };
        
        // You could implement auto-moderation here
        // For example, if a user gets multiple reports, temporarily ban them
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
        
        // Remove user from room manager
        roomManager.removeUser(socket.id);
        
        // Broadcast updated user count
        io.emit('userCount', roomManager.userStats.activeUsers);
    });

    // Handle browser check data
    socket.on('browser-check', (data) => {
        console.log(`🔍 Browser Check from ${socket.id}:`, {
            type: data.type,
            browser: data.browserInfo?.browser,
            timestamp: data.timestamp
        });
        
        // You can store this data in database or process it
        if (data.type === 'element-data') {
            console.log('📋 Element Update:', data.element.tagName, data.element.action);
        } else if (data.type === 'console-data') {
            console.log('💬 Console Log:', data.console.type, data.console.message.substring(0, 100));
        }
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Periodic cleanup
setInterval(() => {
    const now = Date.now();
    const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    // Clean up inactive rooms
    for (const [roomId, room] of roomManager.rooms) {
        if (now - room.createdAt > ROOM_TIMEOUT) {
            console.log(`Cleaning up inactive room: ${roomId}`);
            roomManager.rooms.delete(roomId);
        }
    }
    
    // Clean up waiting users who have been waiting too long
    const WAIT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    for (const [socketId, waitingUser] of roomManager.waitingUsers) {
        if (now - waitingUser.joinedAt > WAIT_TIMEOUT) {
            console.log(`Removing user from waiting list: ${socketId}`);
            roomManager.waitingUsers.delete(socketId);
        }
    }
}, 5 * 60 * 1000); // Run every 5 minutes

// Start server with port conflict handling
const PORT = process.env.PORT || 3000;

// Function to find available port
function findAvailablePort(startPort) {
    return new Promise((resolve) => {
        const testServer = require('http').createServer();
        testServer.listen(startPort, () => {
            const port = testServer.address().port;
            testServer.close(() => resolve(port));
        });
        testServer.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// Start server with automatic port selection
async function startServer() {
    try {
        const availablePort = await findAvailablePort(PORT);
        
        server.listen(availablePort, () => {
            console.log(`🚀 Saathi TV server running on port ${availablePort}`);
            console.log(`📱 Frontend available at http://localhost:${availablePort}`);
            console.log(`🔌 Socket.io server ready for connections`);
            
            if (availablePort !== PORT) {
                console.log(`⚠️  Port ${PORT} was busy, using port ${availablePort} instead`);
            }
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`❌ Port ${availablePort} is already in use`);
                console.log('🔄 Trying next available port...');
                startServer();
            } else {
                console.error('Server error:', err);
            }
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

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

module.exports = { app, server, io, roomManager };
