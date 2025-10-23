// Simple WebRTC Signaling Server for Saathi TV
// Handles user pairing, online count, and WebRTC signaling

const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer();

// Setup Socket.IO with CORS
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for testing
        methods: ["GET", "POST"]
    }
});

// In-memory storage
const waitingUsers = []; // Array of users waiting for match
const activeRooms = new Map(); // roomId -> {user1, user2, createdAt}
const onlineUsers = new Set(); // Set of all connected socket IDs

console.log('🚀 Saathi TV Signaling Server Starting...');

// Socket connection handler
io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    
    // Add to online users
    onlineUsers.add(socket.id);
    
    // Broadcast updated online count to all clients
    broadcastOnlineCount();
    
    // Handle find match request
    socket.on('find_match', () => {
        console.log(`🔍 ${socket.id} looking for match...`);
        
        // Check if user is already waiting (prevent duplicates)
        if (waitingUsers.includes(socket.id)) {
            console.log(`⚠️ ${socket.id} already in waiting queue`);
            return;
        }
        
        // If someone is waiting, pair them
        if (waitingUsers.length > 0) {
            const waitingUser = waitingUsers.shift(); // Remove first waiting user
            
            // Verify the waiting user is still online
            if (!onlineUsers.has(waitingUser)) {
                console.log(`❌ Waiting user ${waitingUser} no longer online`);
                // Try again with current user
                socket.emit('find_match');
                return;
            }
            
            // Create room for the pair
            const roomId = createRoom(socket.id, waitingUser);
            
            // Join both users to the Socket.IO room
            socket.join(roomId);
            io.sockets.sockets.get(waitingUser)?.join(roomId);
            
            // Notify both users they are matched
            io.to(roomId).emit('matched', {
                roomId: roomId,
                peer1: socket.id,
                peer2: waitingUser
            });
            
            console.log(`✅ Matched ${socket.id} with ${waitingUser} in room ${roomId}`);
            
        } else {
            // No one waiting, add current user to waiting queue
            waitingUsers.push(socket.id);
            socket.emit('waiting', {
                message: 'Looking for someone to chat with...',
                position: waitingUsers.length
            });
            
            console.log(`⏳ ${socket.id} added to waiting queue (position: ${waitingUsers.length})`);
        }
    });
    
    // Handle WebRTC signaling (SDP offers, answers, ICE candidates)
    socket.on('signal', (data) => {
        const { roomId, signal } = data;
        
        console.log(`📡 Signal from ${socket.id} in room ${roomId}: ${signal.type || 'ice-candidate'}`);
        
        // Forward signal to other user in the room
        socket.to(roomId).emit('signal', {
            from: socket.id,
            signal: signal
        });
        
        // Update room activity
        const room = activeRooms.get(roomId);
        if (room) {
            room.lastActivity = Date.now();
        }
    });
    
    // Handle user leaving a room
    socket.on('leave_room', (data) => {
        const { roomId } = data;
        console.log(`🚪 ${socket.id} leaving room ${roomId}`);
        
        leaveRoom(socket.id, roomId);
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`👋 User disconnected: ${socket.id} (${reason})`);
        
        // Remove from online users
        onlineUsers.delete(socket.id);
        
        // Remove from waiting queue if present
        const waitingIndex = waitingUsers.indexOf(socket.id);
        if (waitingIndex !== -1) {
            waitingUsers.splice(waitingIndex, 1);
            console.log(`🗑️ Removed ${socket.id} from waiting queue`);
        }
        
        // Handle room cleanup
        cleanupUserRooms(socket.id);
        
        // Broadcast updated online count
        broadcastOnlineCount();
    });
    
    // Handle heartbeat for connection monitoring
    socket.on('ping', () => {
        socket.emit('pong');
    });
});

// Create a new room for two users
function createRoom(user1, user2) {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const room = {
        id: roomId,
        user1: user1,
        user2: user2,
        createdAt: Date.now(),
        lastActivity: Date.now()
    };
    
    activeRooms.set(roomId, room);
    
    console.log(`🏠 Created room ${roomId} for users ${user1} and ${user2}`);
    return roomId;
}

// Handle user leaving a room
function leaveRoom(socketId, roomId) {
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    // Notify the other user in the room
    const otherUser = room.user1 === socketId ? room.user2 : room.user1;
    const otherSocket = io.sockets.sockets.get(otherUser);
    
    if (otherSocket) {
        otherSocket.emit('peer_left', { roomId });
        otherSocket.leave(roomId);
    }
    
    // Remove the room
    activeRooms.delete(roomId);
    console.log(`🗑️ Room ${roomId} deleted`);
}

// Clean up all rooms containing a specific user
function cleanupUserRooms(socketId) {
    for (const [roomId, room] of activeRooms) {
        if (room.user1 === socketId || room.user2 === socketId) {
            console.log(`🧹 Cleaning up room ${roomId} for disconnected user ${socketId}`);
            leaveRoom(socketId, roomId);
            break; // User should only be in one room
        }
    }
}

// Broadcast online user count to all clients
function broadcastOnlineCount() {
    const count = onlineUsers.size;
    io.emit('online_count', { count });
    console.log(`📊 Broadcasting online count: ${count}`);
}

// Periodic cleanup of inactive rooms (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    const ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    
    for (const [roomId, room] of activeRooms) {
        if (now - room.lastActivity > ROOM_TIMEOUT) {
            console.log(`🧹 Cleaning up inactive room: ${roomId}`);
            activeRooms.delete(roomId);
        }
    }
    
    console.log(`📈 Server stats - Online: ${onlineUsers.size}, Waiting: ${waitingUsers.length}, Active Rooms: ${activeRooms.size}`);
}, 5 * 60 * 1000);

// Health check endpoint
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        online_users: onlineUsers.size,
        waiting_users: waitingUsers.length,
        active_rooms: activeRooms.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🎯 Saathi TV Signaling Server running on port ${PORT}`);
    console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
    console.log(`📱 Ready for client connections!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});
