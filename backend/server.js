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
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "https://cdnjs.cloudflare.com",
                "https://www.gstatic.com",
                "https://apis.google.com"
            ],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: [
                "'self'", 
                "wss:", 
                "https:",
                "https://identitytoolkit.googleapis.com",
                "https://securetoken.googleapis.com",
                "https://firestore.googleapis.com"
            ],
            fontSrc: [
                "'self'", 
                "https:",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
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

// Serve static files from frontend and backend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname)));

// Serve the main index.html from backend directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Enhanced Room and User Management with Advanced Live Tracking
class EnhancedRoomManager {
    constructor() {
        this.rooms = new Map();
        this.users = new Map();
        this.waitingUsers = new Map();
        this.onlineUsers = new Set();
        this.usersInRooms = new Map();
        this.userPresence = new Map(); // Track user presence states
        this.userActivity = new Map(); // Track user activity patterns
        this.geographicDistribution = new Map(); // Track users by country
        this.deviceTypes = new Map(); // Track device types
        this.connectionQuality = new Map(); // Track connection quality
        this.userStats = {
            totalConnections: 0,
            activeUsers: 0,
            totalRooms: 0,
            onlineUsers: 0,
            usersInRooms: 0,
            waitingUsers: 0,
            averageWaitTime: 0,
            peakUsers: 0,
            geographicDistribution: new Map(),
            deviceTypes: new Map(),
            connectionQuality: new Map()
        };
        
        // Start enhanced monitoring
        this.startEnhancedStatsUpdater();
        this.startPresenceMonitor();
        this.startGeographicTracker();
        this.startDeviceTracker();
    }
    
    startEnhancedStatsUpdater() {
        setInterval(() => {
            this.updateEnhancedStats();
            this.broadcastEnhancedStats();
        }, 2000); // Update every 2 seconds
    }
    
    startPresenceMonitor() {
        setInterval(() => {
            this.monitorUserPresence();
        }, 10000); // Check every 10 seconds
    }
    
    startGeographicTracker() {
        setInterval(() => {
            this.updateGeographicStats();
        }, 5000); // Update every 5 seconds
    }
    
    startDeviceTracker() {
        setInterval(() => {
            this.updateDeviceStats();
        }, 5000); // Update every 5 seconds
    }
    
    startStatsUpdater() {
        setInterval(() => {
            this.updateStats();
            this.broadcastStats();
        }, 2000); // Update every 2 seconds
    }
    
    updateEnhancedStats() {
        this.userStats.onlineUsers = this.onlineUsers.size;
        this.userStats.usersInRooms = this.usersInRooms.size;
        this.userStats.waitingUsers = this.waitingUsers.size;
        this.userStats.activeUsers = this.users.size;
        this.userStats.totalRooms = this.rooms.size;
        
        // Calculate average wait time
        const waitingUsers = Array.from(this.waitingUsers.values());
        if (waitingUsers.length > 0) {
            const totalWaitTime = waitingUsers.reduce((sum, user) => {
                return sum + (Date.now() - (user.waitingSince || Date.now()));
            }, 0);
            this.userStats.averageWaitTime = Math.floor(totalWaitTime / waitingUsers.length / 1000);
        }
        
        // Update peak users
        if (this.userStats.onlineUsers > this.userStats.peakUsers) {
            this.userStats.peakUsers = this.userStats.onlineUsers;
        }
        
        // Update geographic distribution
        this.userStats.geographicDistribution = new Map(this.geographicDistribution);
        
        // Update device types
        this.userStats.deviceTypes = new Map(this.deviceTypes);
        
        // Update connection quality
        this.userStats.connectionQuality = new Map(this.connectionQuality);
    }
    
    updateStats() {
        this.userStats.onlineUsers = this.onlineUsers.size;
        this.userStats.usersInRooms = this.usersInRooms.size;
        this.userStats.waitingUsers = this.waitingUsers.size;
        this.userStats.activeUsers = this.users.size;
        this.userStats.totalRooms = this.rooms.size;
    }
    
    broadcastEnhancedStats() {
        const stats = this.getEnhancedStats();
        io.emit('userStats', stats);
        io.emit('enhancedUserStats', stats);
    }
    
    broadcastStats() {
        const stats = this.getStats();
        io.emit('userStats', stats);
        // Debug logging removed - stats are broadcast silently
    }
    
    monitorUserPresence() {
        const now = Date.now();
        const PRESENCE_TIMEOUT = 60000; // 1 minute
        
        for (const [socketId, presence] of this.userPresence) {
            if (now - presence.lastUpdate > PRESENCE_TIMEOUT) {
                this.userPresence.delete(socketId);
                console.log(`👤 User ${socketId} marked as offline`);
                
                // Notify other users
                io.emit('user-presence-update', {
                    userId: socketId,
                    status: 'offline',
                    timestamp: now
                });
            }
        }
    }
    
    updateGeographicStats() {
        // Update geographic distribution based on user preferences
        for (const [socketId, user] of this.users) {
            if (user.preferences && user.preferences.country) {
                const country = user.preferences.country;
                this.geographicDistribution.set(country, 
                    (this.geographicDistribution.get(country) || 0) + 1);
            }
        }
        
        // Broadcast geographic update
        io.emit('geographic-update', {
            distribution: Object.fromEntries(this.geographicDistribution)
        });
    }
    
    updateDeviceStats() {
        // Update device types based on user agent
        for (const [socketId, user] of this.users) {
            if (user.deviceInfo && user.deviceInfo.type) {
                const deviceType = user.deviceInfo.type;
                this.deviceTypes.set(deviceType, 
                    (this.deviceTypes.get(deviceType) || 0) + 1);
            }
        }
        
        // Broadcast device update
        io.emit('device-info-update', {
            deviceTypes: Object.fromEntries(this.deviceTypes)
        });
    }

    addUser(socketId, userInfo) {
        this.users.set(socketId, {
            id: socketId,
            ...userInfo,
            joinedAt: Date.now(),
            roomId: null,
            isActive: true
        });
        this.onlineUsers.add(socketId);
        this.userStats.activeUsers++;
        this.userStats.totalConnections++;
        // User added silently
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
            
            // Remove from online users
            this.onlineUsers.delete(socketId);
            this.usersInRooms.delete(socketId);
            
            // Remove user
            this.users.delete(socketId);
            this.userStats.activeUsers--;
            // User removed silently
        }
    }

    findMatch(socketId, preferences = {}) {
        const user = this.users.get(socketId);
        if (!user) return null;

        console.log(`🔍 Finding match for ${socketId} with preferences:`, preferences);

        // Enhanced matching algorithm for stranger connections
        let bestMatch = null;
        let bestScore = 0;

        // Look for waiting users with compatible preferences
        for (const [waitingSocketId, waitingUser] of this.waitingUsers) {
            if (waitingSocketId === socketId) continue;
            
            // Calculate compatibility score
            const compatibilityScore = this.calculateCompatibility(user, waitingUser, preferences);
            
            console.log(`📊 Compatibility with ${waitingSocketId}: ${compatibilityScore}`);
            
            // Check if this is a better match
            if (compatibilityScore > bestScore) {
                bestMatch = waitingSocketId;
                bestScore = compatibilityScore;
            }
        }

        if (bestMatch && bestScore > 0) {
            // Remove from waiting list
            this.waitingUsers.delete(bestMatch);
            console.log(`✅ Match found: ${socketId} <-> ${bestMatch} (score: ${bestScore})`);
            return bestMatch;
        }

        // No match found, add to waiting list with enhanced data
        const waitingUserData = { 
            ...user, 
            preferences,
            waitingSince: Date.now(),
            matchAttempts: 0
        };
        this.waitingUsers.set(socketId, waitingUserData);
        console.log(`⏳ Added ${socketId} to waiting list (${this.waitingUsers.size} waiting)`);
        return null;
    }

    calculateCompatibility(user1, user2, preferences) {
        let score = 0;
            const user2Prefs = this.waitingUsers.get(user2.id)?.preferences || {};
        
        // Base compatibility score
        score += 10;
        
        // Country preference matching (higher weight)
        if (preferences.country && preferences.country !== 'any') {
            if (user2Prefs.country === preferences.country) {
                score += 30; // Same country preference
            } else if (user2Prefs.country === 'any') {
                score += 15; // User2 accepts any country
            } else {
                return 0; // Incompatible country preferences
            }
        } else if (user2Prefs.country && user2Prefs.country !== 'any') {
            score += 15; // User1 accepts any, user2 has preference
        } else {
            score += 20; // Both accept any country
        }
        
        // Gender preference matching
        if (preferences.gender && preferences.gender !== 'any') {
            if (user2Prefs.gender === preferences.gender) {
                score += 25; // Same gender preference
            } else if (user2Prefs.gender === 'any') {
                score += 10; // User2 accepts any gender
            } else {
                return 0; // Incompatible gender preferences
            }
        } else if (user2Prefs.gender && user2Prefs.gender !== 'any') {
            score += 10; // User1 accepts any, user2 has preference
        } else {
            score += 15; // Both accept any gender
        }
        
        // Age range matching
        if (preferences.ageRange && preferences.ageRange !== 'any') {
            if (user2Prefs.ageRange === preferences.ageRange) {
                score += 20; // Same age range
            } else if (user2Prefs.ageRange === 'any') {
                score += 10; // User2 accepts any age
            } else {
                score += 5; // Different age ranges but not incompatible
            }
        } else if (user2Prefs.ageRange && user2Prefs.ageRange !== 'any') {
            score += 10; // User1 accepts any, user2 has preference
        } else {
            score += 15; // Both accept any age
        }
        
        // Waiting time bonus (prioritize users waiting longer)
        const waitingTime = Date.now() - (this.waitingUsers.get(user2.id)?.waitingSince || Date.now());
        const waitingMinutes = waitingTime / (1000 * 60);
        if (waitingMinutes > 5) {
            score += 15; // Bonus for users waiting more than 5 minutes
        } else if (waitingMinutes > 2) {
            score += 10; // Bonus for users waiting more than 2 minutes
        } else if (waitingMinutes > 1) {
            score += 5; // Small bonus for users waiting more than 1 minute
        }
        
        // Connection quality bonus (if available)
        if (user2Prefs.connectionQuality === 'good') {
            score += 10;
        } else if (user2Prefs.connectionQuality === 'excellent') {
            score += 15;
        }
        
        // Language preference matching
        if (preferences.language && user2Prefs.language) {
            if (preferences.language === user2Prefs.language) {
                score += 20; // Same language preference
            }
        }
        
        // Interests matching
        if (preferences.interests && user2Prefs.interests) {
            const commonInterests = preferences.interests.filter(interest => 
                user2Prefs.interests.includes(interest)
            );
            score += commonInterests.length * 5; // 5 points per common interest
        }
        
        console.log(`📊 Compatibility calculation: ${score} points`);
        return score;
    }

    isCompatible(user1, user2, preferences) {
        // Legacy compatibility check for backward compatibility
        const score = this.calculateCompatibility(user1, user2, preferences);
        return score > 0;
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

        // Track users in rooms
        this.usersInRooms.set(user1Id, roomId);
        this.usersInRooms.set(user2Id, roomId);

        this.userStats.totalRooms++;
        // Room created
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

    calculateEstimatedWaitTime(position) {
        // Estimate wait time based on position and historical data
        const baseWaitTime = 10; // Base 10 seconds
        const positionMultiplier = position * 5; // 5 seconds per position
        const randomVariation = Math.random() * 10; // Random 0-10 seconds
        
        return Math.floor(baseWaitTime + positionMultiplier + randomVariation);
    }
    
    broadcastQueueUpdate() {
        // Send queue updates to all waiting users
        let position = 1;
        for (const [socketId, waitingUser] of this.waitingUsers) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
                const estimatedWaitTime = this.calculateEstimatedWaitTime(position);
                socket.emit('queue-update', {
                    position: position,
                    totalWaiting: this.waitingUsers.size,
                    estimatedWaitTime: estimatedWaitTime,
                    waitingSince: waitingUser.waitingSince
                });
            }
            position++;
        }
    }
    
    getQueueStats() {
        const waitingUsers = Array.from(this.waitingUsers.values());
        const avgWaitTime = waitingUsers.reduce((sum, user) => {
            return sum + (Date.now() - user.waitingSince);
        }, 0) / waitingUsers.length;
        
        return {
            totalWaiting: this.waitingUsers.size,
            averageWaitTime: Math.floor(avgWaitTime / 1000), // in seconds
            longestWaitTime: Math.max(...waitingUsers.map(u => Date.now() - u.waitingSince)) / 1000,
            shortestWaitTime: Math.min(...waitingUsers.map(u => Date.now() - u.waitingSince)) / 1000
        };
    }
    
    getEnhancedStats() {
        return {
            ...this.userStats,
            activeRooms: this.rooms.size,
            waitingUsers: this.waitingUsers.size,
            queueStats: this.getQueueStats(),
            geographicDistribution: Object.fromEntries(this.geographicDistribution),
            deviceTypes: Object.fromEntries(this.deviceTypes),
            connectionQuality: Object.fromEntries(this.connectionQuality),
            userPresence: Object.fromEntries(this.userPresence),
            userActivity: Object.fromEntries(this.userActivity)
        };
    }

    getStats() {
        return {
            ...this.userStats,
            activeRooms: this.rooms.size,
            waitingUsers: this.waitingUsers.size,
            queueStats: this.getQueueStats()
        };
    }
}

// Initialize enhanced room manager
const roomManager = new EnhancedRoomManager();

// API Routes
app.get('/api/stats', (req, res) => {
    res.json(roomManager.getStats());
});

// Browser check endpoint (simplified)
app.post('/api/browser-check', (req, res) => {
    // Browser data received and processed silently
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
    
    // Add user to enhanced room manager
    roomManager.addUser(socket.id, {
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address,
        deviceInfo: {
            type: getDeviceType(socket.handshake.headers['user-agent']),
            connectionSpeed: 'unknown'
        },
        preferences: {},
        joinedAt: Date.now()
    });
    
    // Initialize user presence
    roomManager.userPresence.set(socket.id, {
        status: 'online',
        lastUpdate: Date.now(),
        location: 'unknown'
    });
    
    // Initialize user activity
    roomManager.userActivity.set(socket.id, []);
    
    // Helper function to detect device type
    function getDeviceType(userAgent) {
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
            return 'mobile';
        } else if (/Tablet|iPad/.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    // Broadcast updated user count
    io.emit('userCount', roomManager.userStats.activeUsers);
    
    // Also emit for simple client compatibility
    io.emit('online_count', { count: roomManager.userStats.activeUsers });

    // Handle enhanced join room request
    socket.on('joinRoomEnhanced', (data) => {
        console.log(`🔍 Enhanced user ${socket.id} requesting to join room with preferences:`, data);
        
        // Update user preferences
        const user = roomManager.users.get(socket.id);
        if (user) {
            user.preferences = { ...user.preferences, ...data };
            roomManager.users.set(socket.id, user);
        }
        
        // Update user presence
        roomManager.userPresence.set(socket.id, {
            ...roomManager.userPresence.get(socket.id),
            status: 'searching',
            lastUpdate: Date.now()
        });
        
        // Update user activity
        const activities = roomManager.userActivity.get(socket.id) || [];
        activities.push({
            action: 'start-search',
            preferences: data,
            timestamp: Date.now()
        });
        roomManager.userActivity.set(socket.id, activities);
        
        // Check if user is already waiting (prevent duplicates)
        if (roomManager.waitingUsers.has(socket.id)) {
            console.log(`⚠️ User ${socket.id} is already in waiting queue`);
            socket.emit('waiting', { 
                message: 'Already searching for a stranger...', 
                position: Array.from(roomManager.waitingUsers.keys()).indexOf(socket.id) + 1
            });
            return;
        }
        
        // Find a match using enhanced algorithm
        const matchedUserId = roomManager.findMatch(socket.id, data);
        
        if (matchedUserId) {
            // Create room with matched user
            const roomId = roomManager.createRoom(socket.id, matchedUserId);
            
            // Join both users to the room
            socket.join(roomId);
            const matchedSocket = io.sockets.sockets.get(matchedUserId);
            if (matchedSocket) {
                matchedSocket.join(roomId);
            }
            
            console.log(`🏠 Enhanced room ${roomId} created for users ${socket.id} and ${matchedUserId}`);
            
            // Update presence for both users
            roomManager.userPresence.set(socket.id, {
                ...roomManager.userPresence.get(socket.id),
                status: 'matched',
                roomId: roomId,
                matchedUserId: matchedUserId,
                lastUpdate: Date.now()
            });
            
            roomManager.userPresence.set(matchedUserId, {
                ...roomManager.userPresence.get(matchedUserId),
                status: 'matched',
                roomId: roomId,
                matchedUserId: socket.id,
                lastUpdate: Date.now()
            });
            
            // Notify both users they joined the room
            socket.emit('roomJoined', roomId);
            if (matchedSocket) {
                matchedSocket.emit('roomJoined', roomId);
            }
            
            // Send enhanced match notification
            const matchInfo = {
                roomId,
                matchedUserId,
                matchTime: Date.now(),
                preferences: data,
                compatibilityScore: roomManager.calculateCompatibility(
                    roomManager.users.get(socket.id),
                    roomManager.users.get(matchedUserId),
                    data
                )
            };
            
            socket.emit('stranger-matched', matchInfo);
            if (matchedSocket) {
                matchedSocket.emit('stranger-matched', {
                    ...matchInfo,
                    matchedUserId: socket.id
                });
            }
            
            // Add small delay to ensure room join is processed
            setTimeout(() => {
                socket.emit('user-joined', { 
                    roomId, 
                    userId: matchedUserId, 
                    isInitiator: true 
                });
                
                if (matchedSocket) {
                    matchedSocket.emit('peer-ready', { 
                        roomId, 
                        userId: socket.id, 
                        isInitiator: false 
                    });
                }
                
                console.log(`✅ Enhanced signaling setup complete for room ${roomId}`);
            }, 100);
            
        } else {
            // No match found, user is in waiting list
            const waitingPosition = roomManager.waitingUsers.size;
            const estimatedWaitTime = roomManager.calculateEstimatedWaitTime(waitingPosition);
            
            socket.emit('waiting', { 
                message: 'Looking for someone to chat with...', 
                position: waitingPosition,
                estimatedWaitTime: estimatedWaitTime,
                totalWaiting: roomManager.waitingUsers.size
            });
            
            console.log(`⏳ Enhanced user ${socket.id} added to waiting list (position: ${waitingPosition}, estimated wait: ${estimatedWaitTime}s)`);
            
            // Send queue update to all waiting users
            roomManager.broadcastQueueUpdate();
        }
    });

    // Handle join room request (enhanced with queue management)
    socket.on('joinRoom', (data) => {
        console.log(`🔍 User ${socket.id} requesting to join room with preferences:`, data);
        
        // Check if user is already waiting (prevent duplicates)
        if (roomManager.waitingUsers.has(socket.id)) {
            console.log(`⚠️ User ${socket.id} is already in waiting queue`);
            socket.emit('waiting', { 
                message: 'Already searching for a stranger...', 
                position: Array.from(roomManager.waitingUsers.keys()).indexOf(socket.id) + 1
            });
            return;
        }
        
        // Find a match
        const matchedUserId = roomManager.findMatch(socket.id, data);
        
        if (matchedUserId) {
            // Create room with matched user
            const roomId = roomManager.createRoom(socket.id, matchedUserId);
            
            // Join both users to the room
            socket.join(roomId);
            const matchedSocket = io.sockets.sockets.get(matchedUserId);
            if (matchedSocket) {
                matchedSocket.join(roomId);
            }
            
            console.log(`🏠 Room ${roomId} created for users ${socket.id} and ${matchedUserId}`);
            
            // Notify both users they joined the room
            socket.emit('roomJoined', roomId);
            if (matchedSocket) {
                matchedSocket.emit('roomJoined', roomId);
            }
            
            // Send match notification with enhanced info
            const matchInfo = {
                roomId,
                matchedUserId,
                matchTime: Date.now(),
                preferences: data
            };
            
            socket.emit('stranger-matched', matchInfo);
            if (matchedSocket) {
                matchedSocket.emit('stranger-matched', {
                    ...matchInfo,
                    matchedUserId: socket.id
                });
            }
            
            // Add small delay to ensure room join is processed
            setTimeout(() => {
                // The newer user (socket.id) should be the initiator
                socket.emit('user-joined', { 
                    roomId, 
                    userId: matchedUserId, 
                    isInitiator: true 
                });
                
                if (matchedSocket) {
                    matchedSocket.emit('peer-ready', { 
                        roomId, 
                        userId: socket.id, 
                        isInitiator: false 
                    });
                }
                
                console.log(`✅ Signaling setup complete for room ${roomId}`);
            }, 100);
            
        } else {
            // No match found, user is in waiting list
            const waitingPosition = roomManager.waitingUsers.size;
            const estimatedWaitTime = this.calculateEstimatedWaitTime(waitingPosition);
            
            socket.emit('waiting', { 
                message: 'Looking for someone to chat with...', 
                position: waitingPosition,
                estimatedWaitTime: estimatedWaitTime,
                totalWaiting: roomManager.waitingUsers.size
            });
            
            console.log(`⏳ User ${socket.id} added to waiting list (position: ${waitingPosition}, estimated wait: ${estimatedWaitTime}s)`);
            
            // Send queue update to all waiting users
            roomManager.broadcastQueueUpdate();
        }
    });

    // Handle simple find match (for simple client)
    socket.on('find_match', () => {
        // Looking for match...
        
        // Check if user is already waiting (prevent duplicates)
        if (roomManager.waitingUsers.has(socket.id)) {
            // Already in queue
            return;
        }
        
        // Find a match using existing room manager
        const matchedUserId = roomManager.findMatch(socket.id, {});
        
        if (matchedUserId) {
            // Create room with matched user
            const roomId = roomManager.createRoom(socket.id, matchedUserId);
            
            // Join both users to the room
            socket.join(roomId);
            io.sockets.sockets.get(matchedUserId)?.join(roomId);
            
            // Notify both users they are matched (simple client format)
            io.to(roomId).emit('matched', {
                roomId: roomId,
                peer1: socket.id,
                peer2: matchedUserId
            });
            
            // Match successful
        } else {
            // No match found, user is in waiting list
            socket.emit('waiting', { 
                message: 'Looking for someone to chat with...',
                position: roomManager.waitingUsers.size 
            });
        }
    });

    // Handle simple signaling (for simple client)
    socket.on('signal', (data) => {
        const { roomId, signal } = data;
        
        // WebRTC signal forwarded
        
        // Forward signal to other user in the room
        socket.to(roomId).emit('signal', {
            from: socket.id,
            signal: signal
        });
    });

    // Handle leave room (simple client)
    socket.on('leave_room', (data) => {
        const { roomId } = data;
        // User leaving room
        
        socket.leave(roomId);
        roomManager.leaveRoom(socket.id, roomId);
        
        // Notify other users in the room
        socket.to(roomId).emit('peer_left', { roomId });
    });

    // Handle leaving room
    socket.on('leaveRoom', (roomId) => {
        // User leaving room
        
        socket.leave(roomId);
        roomManager.leaveRoom(socket.id, roomId);
        
        // Notify other users in the room
        socket.to(roomId).emit('user-left');
    });

    // Handle WebRTC signaling (enhanced)
    socket.on('offer', (data) => {
        console.log(`📤 Forwarding offer from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit('offer', {
            offer: data.offer,
            roomId: data.roomId,
            from: socket.id
        });
    });

    socket.on('answer', (data) => {
        console.log(`📤 Forwarding answer from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit('answer', {
            answer: data.answer,
            roomId: data.roomId,
            from: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        console.log(`🧊 Forwarding ICE candidate from ${socket.id} to room ${data.roomId}`);
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
        
        // Message sent
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
        // User reported
        
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
        // User disconnected
        
        // Remove user from room manager
        roomManager.removeUser(socket.id);
        
        // Broadcast updated user count
        io.emit('userCount', roomManager.userStats.activeUsers);
        
        // Also emit for simple client compatibility
        io.emit('online_count', { count: roomManager.userStats.activeUsers });
    });

    // Handle enhanced heartbeat
    socket.on('heartbeat', (data) => {
        // Update user presence
        roomManager.userPresence.set(socket.id, {
            ...roomManager.userPresence.get(socket.id),
            status: 'online',
            lastUpdate: Date.now(),
            deviceInfo: data.deviceInfo
        });
        
        // Update user activity
        const activities = roomManager.userActivity.get(socket.id) || [];
        activities.push({
            action: 'heartbeat',
            timestamp: Date.now(),
            deviceInfo: data.deviceInfo
        });
        roomManager.userActivity.set(socket.id, activities);
        
        // Update device info in user record
        const user = roomManager.users.get(socket.id);
        if (user && data.deviceInfo) {
            user.deviceInfo = { ...user.deviceInfo, ...data.deviceInfo };
            roomManager.users.set(socket.id, user);
        }
    });
    
    // Handle user presence updates
    socket.on('user-presence-update', (data) => {
        roomManager.userPresence.set(socket.id, {
            ...roomManager.userPresence.get(socket.id),
            ...data,
            lastUpdate: Date.now()
        });
        
        // Broadcast presence update to other users
        socket.broadcast.emit('user-presence-update', {
            userId: socket.id,
            ...data,
            timestamp: Date.now()
        });
    });
    
    // Handle user activity updates
    socket.on('user-activity-update', (data) => {
        const activities = roomManager.userActivity.get(socket.id) || [];
        activities.push({
            ...data,
            timestamp: Date.now()
        });
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.splice(0, activities.length - 100);
        }
        
        roomManager.userActivity.set(socket.id, activities);
        
        // Broadcast activity update to other users
        socket.broadcast.emit('user-activity-update', {
            userId: socket.id,
            ...data,
            timestamp: Date.now()
        });
    });
    
    // Handle connection quality updates
    socket.on('connection-quality-update', (data) => {
        roomManager.connectionQuality.set(socket.id, data.quality);
        
        // Update user record
        const user = roomManager.users.get(socket.id);
        if (user) {
            user.connectionQuality = data.quality;
            roomManager.users.set(socket.id, user);
        }
        
        // Broadcast quality update
        io.emit('connection-quality-update', {
            userId: socket.id,
            quality: data.quality,
            timestamp: Date.now()
        });
    });

    // Handle browser check data
    socket.on('browser-check', (data) => {
        // Browser check received
        
        // You can store this data in database or process it
        if (data.type === 'element-data') {
            // Element update logged
        } else if (data.type === 'console-data') {
            // Console log received
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
            // Removing inactive user from waiting list
            roomManager.waitingUsers.delete(socketId);
        }
    }
}, 5 * 60 * 1000); // Run every 5 minutes

// Start server on port 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Saathi TV server running on port ${PORT}`);
    console.log(`📱 Website available at http://localhost:${PORT}`);
    
    if (PORT !== 3000) {
        console.log(`⚠️  Port 3000 was busy, using port ${PORT} instead`);
    }
});

// Also try to start a redirect server on port 3000
const redirectApp = express();

// Serve redirect page for port 3000
redirectApp.get('*', (req, res) => {
    const targetUrl = `http://localhost:3001${req.path}${req.search || ''}`;
    
    // Send redirect page
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Redirecting to Saathi TV...</title>
            <meta http-equiv="refresh" content="2;url=${targetUrl}">
        </head>
        <body style="font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <h1>🚀 Saathi TV</h1>
            <p>Redirecting to the correct server...</p>
            <p>If you're not redirected, <a href="${targetUrl}" style="color: #FFD700;">click here</a></p>
            <script>
                setTimeout(() => {
                    window.location.href = '${targetUrl}';
                }, 2000);
            </script>
        </body>
        </html>
    `);
});

// Try to start redirect server on port 3000
try {
    redirectApp.listen(3000, () => {
        console.log(`🔄 Redirect server running on port 3000 -> redirects to ${PORT}`);
    });
} catch (error) {
    console.log(`ℹ️  Could not start redirect server on port 3000: ${error.message}`);
}

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
