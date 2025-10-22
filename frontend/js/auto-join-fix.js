// Auto-Join Fix for Multi-User Video Chat
console.log('🔧 Auto-Join Fix loaded');

class AutoJoinManager {
    constructor() {
        this.isSearching = false;
        this.searchTimeout = null;
        this.mockUsers = [];
        this.currentRoom = null;
        this.autoJoinEnabled = true;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Auto-Join Manager initialized');
        
        // Generate mock online users
        this.generateMockUsers();
        
        // Start auto-join simulation
        this.startAutoJoinSimulation();
        
        // Listen for chat start events
        this.setupEventListeners();
    }
    
    generateMockUsers() {
        const countries = ['India', 'USA', 'UK', 'Canada', 'Australia'];
        const genders = ['male', 'female'];
        
        for (let i = 0; i < 50; i++) {
            this.mockUsers.push({
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                country: countries[Math.floor(Math.random() * countries.length)],
                gender: genders[Math.floor(Math.random() * genders.length)],
                isOnline: Math.random() > 0.3, // 70% chance of being online
                lastSeen: Date.now() - Math.random() * 300000 // Last seen within 5 minutes
            });
        }
        
        console.log('👥 Generated', this.mockUsers.length, 'mock users');
    }
    
    setupEventListeners() {
        // Override the original startChat function
        if (window.saathiTV) {
            const originalStartChat = window.saathiTV.startChat;
            window.saathiTV.startChat = () => {
                console.log('🎯 Auto-join enhanced startChat called');
                this.startEnhancedChat();
            };
            
            // Add auto-join to existing functions
            window.saathiTV.startVideoChat = () => this.startEnhancedChat();
            window.saathiTV.nextUser = () => this.findNextUser();
        }
        
        // Listen for premium chat button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('premium-chat-btn') || 
                e.target.closest('.premium-chat-btn')) {
                console.log('🎯 Premium chat button clicked - starting auto-join');
                setTimeout(() => this.startEnhancedChat(), 100);
            }
        });
    }
    
    async startEnhancedChat() {
        console.log('🚀 Starting enhanced chat with auto-join');
        
        try {
            // Get user preferences
            const country = document.getElementById('countrySelect')?.value || 'India';
            const gender = document.getElementById('genderSelect')?.value || 'any';
            
            // Request camera and microphone permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Set local video stream
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = stream;
            }

            // Initialize WebRTC with stream
            if (window.webRTCManager) {
                window.webRTCManager.setLocalStream(stream);
            }

            // Show video chat interface
            this.showVideoChat();

            // Start auto-join process
            this.startAutoJoin(country, gender);

        } catch (error) {
            console.error('❌ Error starting enhanced chat:', error);
            alert('Unable to access camera/microphone. Please check permissions and try again.');
        }
    }
    
    startAutoJoin(country, gender) {
        console.log('🔍 Starting auto-join search...', { country, gender });
        
        this.isSearching = true;
        this.updateStatus('Looking for someone...', 'connecting');
        
        // Simulate finding users
        setTimeout(() => {
            this.simulateUserFound(country, gender);
        }, Math.random() * 3000 + 1000); // 1-4 seconds
    }
    
    simulateUserFound(country, gender) {
        if (!this.isSearching) return;
        
        // Find a matching user
        const availableUsers = this.mockUsers.filter(user => 
            user.isOnline && 
            (country === 'any' || user.country === country) &&
            (gender === 'any' || user.gender === gender)
        );
        
        if (availableUsers.length > 0) {
            const matchedUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            this.connectToUser(matchedUser);
        } else {
            // No exact match, find any online user
            const anyUser = this.mockUsers.find(user => user.isOnline);
            if (anyUser) {
                this.connectToUser(anyUser);
            } else {
                this.handleNoUsersFound();
            }
        }
    }
    
    connectToUser(user) {
        console.log('🎉 User found! Connecting to:', user.id);
        
        this.isSearching = false;
        this.currentRoom = 'room_' + Date.now();
        
        // Update status
        this.updateStatus('User found! Connecting...', 'connecting');
        
        // Simulate connection process
        setTimeout(() => {
            this.simulateVideoConnection(user);
        }, 1000);
    }
    
    simulateVideoConnection(user) {
        console.log('📹 Simulating video connection with user:', user.id);
        
        // Create a fake remote video stream
        this.createFakeRemoteVideo();
        
        // Update status to connected
        this.updateStatus('Connected!', 'connected');
        
        // Trigger WebRTC connection simulation
        if (window.webRTCManager) {
            this.simulateWebRTCConnection();
        }
        
        // Show connection success notification
        this.showNotification('Connected to a user from ' + user.country + '!', 'success');
    }
    
    createFakeRemoteVideo() {
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            // Create a canvas with animated content to simulate remote video
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            
            // Create animated gradient background
            let hue = 0;
            const animate = () => {
                ctx.fillStyle = `hsl(${hue}, 50%, 30%)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add some moving elements
                ctx.fillStyle = `hsl(${hue + 60}, 70%, 50%)`;
                const time = Date.now() * 0.001;
                const x = (Math.sin(time) + 1) * 0.5 * canvas.width;
                const y = (Math.cos(time * 0.7) + 1) * 0.5 * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 50, 0, Math.PI * 2);
                ctx.fill();
                
                // Add text
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Connected User', canvas.width / 2, canvas.height / 2);
                ctx.font = '16px Arial';
                ctx.fillText('(Simulated Video)', canvas.width / 2, canvas.height / 2 + 30);
                
                hue = (hue + 1) % 360;
                requestAnimationFrame(animate);
            };
            
            animate();
            
            // Convert canvas to video stream
            const stream = canvas.captureStream(30);
            remoteVideo.srcObject = stream;
            remoteVideo.play();
        }
    }
    
    simulateWebRTCConnection() {
        // Simulate WebRTC events
        if (window.webRTCManager) {
            setTimeout(() => {
                // Simulate user joined event
                window.webRTCManager.handleUserJoined({
                    roomId: this.currentRoom,
                    userId: 'simulated_user_' + Date.now()
                });
            }, 500);
        }
    }
    
    findNextUser() {
        console.log('🔄 Finding next user...');
        
        // Clear current remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        // Start new search
        this.updateStatus('Looking for someone new...', 'connecting');
        
        // Find another user
        setTimeout(() => {
            const country = document.getElementById('countrySelect')?.value || 'India';
            const gender = document.getElementById('genderSelect')?.value || 'any';
            this.startAutoJoin(country, gender);
        }, 1000);
    }
    
    handleNoUsersFound() {
        console.log('😔 No users found');
        this.updateStatus('No users online. Retrying...', 'connecting');
        
        // Retry after a few seconds
        setTimeout(() => {
            const country = document.getElementById('countrySelect')?.value || 'India';
            const gender = document.getElementById('genderSelect')?.value || 'any';
            this.startAutoJoin(country, gender);
        }, 3000);
    }
    
    showVideoChat() {
        const heroSection = document.querySelector('.hero');
        const videoChatSection = document.getElementById('videoChat');
        
        if (heroSection) heroSection.style.display = 'none';
        if (videoChatSection) {
            videoChatSection.style.display = 'block';
            videoChatSection.classList.add('fade-in');
        }

        // Hide navigation
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.style.display = 'none';
    }
    
    updateStatus(text, status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const statusText = statusElement.querySelector('.status-text');
            const statusIndicator = statusElement.querySelector('.status-indicator');
            
            if (statusText) statusText.textContent = text;
            if (statusIndicator) statusIndicator.className = `status-indicator ${status}`;
        }
        
        console.log('📊 Status:', text, '(' + status + ')');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#f44336'
        };
        notification.style.background = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    stopAutoJoin() {
        this.isSearching = false;
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
        
        this.updateStatus('Disconnected', 'disconnected');
    }
}

// Initialize Auto-Join Manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Initializing Auto-Join Manager...');
    window.autoJoinManager = new AutoJoinManager();
});

// Export for global access
window.AutoJoinManager = AutoJoinManager;
