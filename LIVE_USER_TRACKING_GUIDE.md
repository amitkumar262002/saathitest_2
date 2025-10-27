# 🎥 Saathi TV - Live User Tracking & Stranger Matching System

## Overview

Saathi TV now features a comprehensive **Live User Tracking** and **Stranger Matching** system that allows users to find and connect with strangers for video chat. The system uses real-time WebSocket communication, intelligent matching algorithms, and enhanced notifications to create a seamless stranger-to-stranger connection experience.

## 🌟 Key Features

### 1. Live User Tracking
- **Real-time user statistics** showing online users, waiting users, and active chats
- **Live updates** every 2 seconds with current system state
- **User queue management** with position tracking and estimated wait times
- **Connection monitoring** with automatic cleanup of inactive users

### 2. Intelligent Stranger Matching
- **Compatibility scoring system** that matches users based on preferences
- **Multi-factor matching** including country, gender, age range, and interests
- **Waiting time prioritization** to ensure fair matching
- **Preference-based filtering** for personalized connections

### 3. Enhanced Notifications
- **Real-time notifications** for matches, queue updates, and connection status
- **Sound and vibration support** for better user experience
- **Customizable notification types** with different visual styles
- **Auto-dismissal** with progress indicators

### 4. Queue Management
- **Position tracking** in the waiting queue
- **Estimated wait times** based on current queue length
- **Queue statistics** including average wait times
- **Automatic cleanup** of inactive waiting users

## 🏗️ System Architecture

### Backend Components

#### RoomManager Class (`backend/server.js`)
```javascript
class RoomManager {
    // Live user tracking
    users: Map<socketId, userInfo>
    waitingUsers: Map<socketId, waitingUserData>
    onlineUsers: Set<socketId>
    
    // Enhanced matching algorithm
    findMatch(socketId, preferences)
    calculateCompatibility(user1, user2, preferences)
    
    // Queue management
    broadcastQueueUpdate()
    calculateEstimatedWaitTime(position)
    getQueueStats()
}
```

#### Key Methods:
- `findMatch()` - Enhanced matching with compatibility scoring
- `calculateCompatibility()` - Multi-factor compatibility calculation
- `broadcastQueueUpdate()` - Real-time queue position updates
- `getQueueStats()` - Comprehensive queue statistics

### Frontend Components

#### LiveUserTracking Class (`frontend/js/live-user-tracking.js`)
```javascript
class LiveUserTracking {
    // Real-time stats
    userStats: Object
    userQueue: Array
    pairingPreferences: Object
    
    // Core functions
    findStranger()
    stopSearching()
    updatePreferences(prefs)
    getUserStats()
}
```

#### StrangerNotificationSystem Class (`frontend/js/stranger-notifications.js`)
```javascript
class StrangerNotificationSystem {
    // Notification management
    notifications: Array
    soundEnabled: Boolean
    vibrationEnabled: Boolean
    
    // Core functions
    showNotification(message, type, options)
    showMatchNotification(data)
    showQueueNotification(data)
}
```

## 🎯 Matching Algorithm

The system uses a sophisticated compatibility scoring system:

### Compatibility Factors:
1. **Country Preference** (30 points for exact match)
2. **Gender Preference** (25 points for exact match)
3. **Age Range** (20 points for exact match)
4. **Waiting Time Bonus** (5-15 points based on wait duration)
5. **Connection Quality** (10-15 points)
6. **Language Preference** (20 points for exact match)
7. **Common Interests** (5 points per shared interest)

### Scoring Logic:
```javascript
calculateCompatibility(user1, user2, preferences) {
    let score = 10; // Base score
    
    // Country matching
    if (preferences.country === user2Prefs.country) score += 30;
    else if (user2Prefs.country === 'any') score += 15;
    else return 0; // Incompatible
    
    // Gender matching
    if (preferences.gender === user2Prefs.gender) score += 25;
    else if (user2Prefs.gender === 'any') score += 10;
    else return 0; // Incompatible
    
    // Additional factors...
    return score;
}
```

## 📊 Real-Time Statistics

The system provides live statistics including:

- **Online Users**: Total connected users
- **Waiting Users**: Users in the matching queue
- **Active Rooms**: Current video chat sessions
- **Queue Stats**: Average wait times, longest/shortest waits
- **Connection Stats**: Total connections, active users

## 🔔 Notification System

### Notification Types:
- **Success**: Match found, connection established
- **Error**: Connection failed, errors
- **Warning**: Timeouts, warnings
- **Info**: Queue updates, status changes
- **Match**: Stranger matched notifications
- **Queue**: Queue position updates

### Features:
- **Sound notifications** with different tones for each type
- **Vibration patterns** for mobile devices
- **Auto-dismissal** with progress bars
- **Click-to-dismiss** functionality
- **Maximum notification limit** to prevent spam

## 🚀 Usage Guide

### For Users:

1. **Set Preferences**:
   ```javascript
   // Set your matching preferences
   window.liveUserTracking.updatePreferences({
       country: 'US',
       gender: 'any',
       ageRange: '18-25',
       interests: ['music', 'gaming']
   });
   ```

2. **Find a Stranger**:
   ```javascript
   // Start looking for a stranger
   window.liveUserTracking.findStranger();
   ```

3. **Monitor Queue**:
   ```javascript
   // Check your position and wait time
   const stats = window.liveUserTracking.getUserStats();
   console.log('Queue position:', stats.queuePosition);
   ```

### For Developers:

1. **Initialize the System**:
   ```javascript
   // The system auto-initializes on page load
   // Access via global objects:
   window.liveUserTracking
   window.strangerNotifications
   window.unifiedWebRTC
   ```

2. **Customize Notifications**:
   ```javascript
   // Show custom notifications
   window.strangerNotifications.showNotification(
       'Custom message', 
       'success', 
       { delay: 5000, sound: true }
   );
   ```

3. **Monitor Events**:
   ```javascript
   // Listen for matching events
   socket.on('stranger-matched', (data) => {
       console.log('Matched with:', data.matchedUserId);
   });
   
   socket.on('queue-update', (data) => {
       console.log('Queue position:', data.position);
   });
   ```

## 🧪 Testing

### Test Page: `frontend/stranger-matching-test.html`

The test page provides a comprehensive testing interface:

1. **Open multiple browser tabs** to simulate different users
2. **Set different preferences** in each tab
3. **Click "Find Stranger"** to test matching
4. **Monitor live stats** and queue positions
5. **Test notifications** with different types
6. **Check system logs** for detailed events

### Test Scenarios:

1. **Basic Matching**: Two users with compatible preferences
2. **Preference Filtering**: Users with specific country/gender preferences
3. **Queue Management**: Multiple users waiting for matches
4. **Notification Testing**: All notification types and features
5. **Connection Testing**: WebRTC connection establishment

## 🔧 Configuration

### Server Configuration:
```javascript
// Backend server settings
const PORT = process.env.PORT || 3001;
const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WAIT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

### Client Configuration:
```javascript
// WebRTC configuration
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Additional STUN servers...
    ],
    iceCandidatePoolSize: 10
};
```

## 📈 Performance Features

- **Automatic cleanup** of inactive users and rooms
- **Rate limiting** to prevent abuse
- **Connection pooling** for better performance
- **Efficient data structures** using Maps and Sets
- **Minimal memory footprint** with automatic garbage collection

## 🔒 Security Features

- **Input validation** for all user preferences
- **Rate limiting** on API endpoints
- **CORS protection** with specific origins
- **Helmet security headers**
- **User reporting system** for moderation

## 🌐 Browser Support

- **Chrome/Edge**: Full support with WebRTC
- **Firefox**: Full support with WebRTC
- **Safari**: Full support with WebRTC
- **Mobile browsers**: Full support with touch controls

## 📱 Mobile Optimization

- **Touch-friendly controls** for mobile devices
- **Responsive design** for all screen sizes
- **Vibration support** for notifications
- **Optimized video quality** for mobile networks
- **Battery-efficient** connection management

## 🚀 Getting Started

1. **Start the server**:
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Open the test page**:
   ```
   http://localhost:3001/stranger-matching-test.html
   ```

3. **Test the system**:
   - Open multiple tabs
   - Set different preferences
   - Click "Find Stranger"
   - Monitor the matching process

## 🎉 Success Metrics

The system successfully provides:
- **Sub-second matching** for compatible users
- **Real-time updates** with 2-second refresh rate
- **High compatibility scores** for better matches
- **Smooth WebRTC connections** between matched users
- **Comprehensive notification system** for user engagement

## 🔮 Future Enhancements

- **Machine learning** for better matching algorithms
- **Video quality adaptation** based on connection speed
- **Advanced filtering** options (interests, hobbies, etc.)
- **Group matching** for multiple users
- **Geographic proximity** matching
- **Language detection** and matching
- **User rating system** for better connections

---

**Saathi TV** - Connecting strangers, creating friendships! 🎥✨
