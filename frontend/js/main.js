// Main JavaScript for Saathi TV
class SaathiTV {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.userCount = 0;
        this.currentRoom = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserCount();
        this.setupNavigation();
        
        // Connect to socket server
        this.connectToServer();
    }

    setupEventListeners() {
        // Start chat button - using navbar button and premium chat button
        const premiumChatBtn = document.querySelector('.premium-chat-btn');
        const navChatBtn = document.getElementById('startChatBtn'); // navbar button
        
        if (premiumChatBtn) {
            // Remove existing onclick and add our handler
            premiumChatBtn.removeAttribute('onclick');
            premiumChatBtn.addEventListener('click', () => this.handlePremiumChatClick());
        }

        // Navigation toggle for mobile
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
                
                // Close mobile menu
                navMenu.classList.remove('active');
            });
        });

        // Video controls
        this.setupVideoControls();

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Prevent right-click on videos (optional security measure)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'VIDEO') {
                e.preventDefault();
            }
        });
    }

    setupVideoControls() {
        // Video controls are now handled in fixVideoControls function
        // This ensures proper event binding and state management
    }

    connectToServer() {
        try {
            // Connect to backend server
            const serverUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : window.location.origin;
            
            this.socket = io(serverUrl);
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
                this.isConnected = true;
                this.updateConnectionStatus('Connected', 'connected');
                
                // Connect WebRTC manager to socket after connection is established
                if (window.webRTCManager) {
                    window.webRTCManager.setSocket(this.socket);
                }
                
                // Connect chat manager to socket
                if (window.chatManager) {
                    window.chatManager.setSocket(this.socket);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
                this.isConnected = false;
                this.updateConnectionStatus('Disconnected', 'disconnected');
            });

            this.socket.on('userCount', (count) => {
                this.userCount = count;
                this.updateUserCount();
            });

            this.socket.on('roomJoined', (roomId) => {
                this.currentRoom = roomId;
                this.updateConnectionStatus('Connected to room', 'connected');
            });

            this.socket.on('user-joined', (data) => {
                console.log('User joined:', data);
                this.updateConnectionStatus('User found!', 'connected');
            });

            this.socket.on('user-left', () => {
                console.log('User left the room');
                this.updateConnectionStatus('User disconnected', 'disconnected');
                this.handleUserLeft();
            });

            this.socket.on('waiting', (data) => {
                console.log('Waiting for match:', data);
                this.updateConnectionStatus(data.message || 'Looking for someone...', 'connecting');
            });

        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.updateConnectionStatus('Connection failed', 'disconnected');
        }
    }

    handlePremiumChatClick() {
        // Check if user is logged in first
        if (!this.isUserLoggedIn()) {
            // Redirect to login page
            window.location.href = 'login.html';
            return;
        }
        
        // Start premium chat
        this.startVideoChat();
    }
    
    isUserLoggedIn() {
        // Check multiple possible session storage locations
        const secureSession = localStorage.getItem('saathiTV_secure_session') || 
                            sessionStorage.getItem('saathiTV_current_session');
        const userSession = localStorage.getItem('saathiTVUser') || 
                          sessionStorage.getItem('saathiTVSession');
        const currentUser = localStorage.getItem('saathi_current_user');
        
        // Check if login system indicates user is logged in
        if (window.loginSystem && window.loginSystem.isUserLoggedIn()) {
            return true;
        }
        
        // Check other session types
        return !!(secureSession || userSession || currentUser);
    }
    
    redirectToLogin() {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?return=${currentUrl}`;
    }

    async startChat() {
        // Account blocking is disabled - proceed with chat
        console.log('🚀 Starting chat (blocking checks disabled)');
        
        // Note: Blocking functionality is currently disabled

        // Handle premium chat button
        const premiumBtn = document.querySelector('.premium-chat-btn');
        const activeBtn = premiumBtn;
        
        let btnText, btnLoader;
        
        if (activeBtn) {
            btnText = activeBtn.querySelector('.btn-text') || activeBtn.querySelector('.btn-main-text');
            btnLoader = activeBtn.querySelector('.btn-loader');
            
            // Show loading state
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-block';
            activeBtn.disabled = true;
        }

        try {
            // Get user preferences
            const country = document.getElementById('countrySelect').value;
            const gender = document.getElementById('genderSelect').value;

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
            localVideo.srcObject = stream;

            // Initialize WebRTC
            if (window.webRTCManager) {
                window.webRTCManager.setLocalStream(stream);
            }

            // Initialize audio/video controls
            if (window.audioVideoControls) {
                window.audioVideoControls.onChatStart(stream);
            }

            // Show video chat interface
            this.showVideoChat();

            // Start security monitoring
            if (window.securityManager) {
                window.securityManager.startMonitoring();
            }

            // Join chat room
            if (this.socket) {
                this.socket.emit('joinRoom', { country, gender });
                this.updateConnectionStatus('Looking for someone...', 'connecting');
            }

        } catch (error) {
            console.error('Error starting chat:', error);
            alert('Unable to access camera/microphone. Please check permissions and try again.');
            
            // Reset button state
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            if (activeBtn) activeBtn.disabled = false;
        }
    }

    showVideoChat() {
        const heroSection = document.querySelector('.hero');
        const videoChatSection = document.getElementById('videoChat');
        
        heroSection.style.display = 'none';
        videoChatSection.style.display = 'block';
        videoChatSection.classList.add('fade-in');

        // Hide navigation
        document.querySelector('.navbar').style.display = 'none';
    }

    hideVideoChat() {
        const heroSection = document.querySelector('.hero');
        const videoChatSection = document.getElementById('videoChat');
        
        videoChatSection.style.display = 'none';
        heroSection.style.display = 'flex';

        // Show navigation
        document.querySelector('.navbar').style.display = 'block';

        // Reset button state
        const premiumBtn = document.querySelector('.premium-chat-btn');
        const activeBtn = premiumBtn;
        
        if (activeBtn) {
            const btnText = activeBtn.querySelector('.btn-text') || activeBtn.querySelector('.btn-main-text');
            const btnLoader = activeBtn.querySelector('.btn-loader');
            
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            activeBtn.disabled = false;
        }
    }

    stopChat() {
        // Stop local stream
        const localVideo = document.getElementById('localVideo');
        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
        }

        // Stop remote stream
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo.srcObject) {
            remoteVideo.srcObject = null;
        }

        // Close WebRTC connection
        if (window.webRTCManager) {
            window.webRTCManager.closeConnection();
        }

        // Leave room

        // Reset button state - using premium button
        const premiumBtn = document.querySelector('.premium-chat-btn');
        if (premiumBtn) {
            const btnText = premiumBtn.querySelector('.btn-text') || premiumBtn.querySelector('.btn-main-text');
            const btnLoader = premiumBtn.querySelector('.btn-loader');
            
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            premiumBtn.disabled = false;
        }
    }

    stopChat() {
    // Stop local stream
    const localVideo = document.getElementById('localVideo');
    if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }

    // Stop remote stream
    const remoteVideo = document.getElementById('remoteVideo');
    if (remoteVideo.srcObject) {
        remoteVideo.srcObject = null;
            this.socket.emit('leaveRoom', this.currentRoom);
            
            // Close current WebRTC connection
            if (window.webRTCManager) {
                window.webRTCManager.closeConnection();
            }

            // Clear remote video
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = null;

            // Join new room
            const country = document.getElementById('countrySelect').value;
            const gender = document.getElementById('genderSelect').value;
            this.socket.emit('joinRoom', { country, gender });
            
            this.updateConnectionStatus('Looking for someone new...', 'connecting');
        }
    }

    toggleVideo() {
        const localVideo = document.getElementById('localVideo');
        const toggleBtn = document.getElementById('toggleVideo');
        
        if (localVideo && localVideo.srcObject) {
            const videoTrack = localVideo.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                
                // Update button state
                if (toggleBtn) {
                    if (videoTrack.enabled) {
                        toggleBtn.classList.remove('inactive');
                        toggleBtn.classList.add('active');
                    } else {
                        toggleBtn.classList.remove('active');
                        toggleBtn.classList.add('inactive');
                    }
                }
                
                // Show notification
                showNotification(
                    videoTrack.enabled ? 'Camera turned on' : 'Camera turned off',
                    'info'
                );
            }
        }
    }

    toggleAudio() {
        const localVideo = document.getElementById('localVideo');
        const toggleBtn = document.getElementById('toggleAudio');
        
        if (localVideo && localVideo.srcObject) {
            const audioTrack = localVideo.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                
                // Update button state
                if (toggleBtn) {
                    if (audioTrack.enabled) {
                        toggleBtn.classList.remove('inactive');
                        toggleBtn.classList.add('active');
                    } else {
                        toggleBtn.classList.remove('active');
                        toggleBtn.classList.add('inactive');
                    }
                }
                
                // Show notification
                showNotification(
                    audioTrack.enabled ? 'Microphone turned on' : 'Microphone turned off',
                    'info'
                );
            }
        }
    }

    updateConnectionStatus(text, status) {
        const statusElement = document.getElementById('connectionStatus');
        const statusText = statusElement.querySelector('.status-text');
        const statusIndicator = statusElement.querySelector('.status-indicator');
        
        statusText.textContent = text;
        statusIndicator.className = `status-indicator ${status}`;
    }

    updateUserCount() {
        const userCountElement = document.getElementById('userCount');
        if (userCountElement) {
            // Simulate user count if not connected to server
            const count = this.userCount || Math.floor(Math.random() * 50000) + 10000;
            userCountElement.textContent = count.toLocaleString();
        }
    }

    handleUserLeft() {
        // Clear remote video
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = null;

        // Close WebRTC connection
        if (window.webRTCManager) {
            window.webRTCManager.closeConnection();
        }

        // Show option to find new user
        setTimeout(() => {
            if (confirm('The other user has left. Would you like to find someone new?')) {
                this.nextUser();
            } else {
                this.stopChat();
            }
        }, 1000);
    }

    setupNavigation() {
        // Smooth scrolling for all internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to navbar
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    }

    handleResize() {
        // Handle responsive layout changes
        const videoWrapper = document.querySelector('.video-wrapper');
        if (videoWrapper && window.innerWidth <= 768) {
            // Mobile layout adjustments
            videoWrapper.style.gridTemplateColumns = '1fr';
            videoWrapper.style.gridTemplateRows = '1fr 1fr';
        } else if (videoWrapper) {
            // Desktop layout
            videoWrapper.style.gridTemplateColumns = '1fr 1fr';
            videoWrapper.style.gridTemplateRows = 'none';
        }
    }
}

// Utility functions
function showNotification(message, type = 'info') {
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function isMobile() {
    return window.innerWidth <= 768;
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

// Show splash screen first
function showSplashScreen() {
    // Check if we're coming from splash
    if (!sessionStorage.getItem('splashShown')) {
        sessionStorage.setItem('splashShown', 'true');
        window.location.href = 'splash.html';
        return;
    }
}

// Page navigation function
function showPage(page) {
    const pages = {
        'privacy': 'Privacy Policy - We respect your privacy and protect your data.',
        'terms': 'Terms of Service - Please read our terms and conditions.',
        'contact': 'Contact Us - Email: support@saathi-tv.com | Phone: +1-234-567-8900',
        'support': 'Support - Need help? Check our FAQ or contact our support team.'
    };
    
    if (pages[page]) {
        alert(pages[page]);
    }
}

// Fix video control functions
function fixVideoControls() {
    const toggleVideo = document.getElementById('toggleVideo');
    const toggleAudio = document.getElementById('toggleAudio');
    const nextBtn = document.getElementById('nextBtn');
    const stopBtn = document.getElementById('stopBtn');

    if (toggleVideo) {
        toggleVideo.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            if (isActive) {
                this.classList.remove('active');
                this.classList.add('inactive');
            } else {
                this.classList.remove('inactive');
                this.classList.add('active');
            }
            
            if (window.saathiTV) {
                window.saathiTV.toggleVideo();
            }
        });
    }

    if (toggleAudio) {
        toggleAudio.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            if (isActive) {
                this.classList.remove('active');
                this.classList.add('inactive');
            } else {
                this.classList.remove('inactive');
                this.classList.add('active');
            }
            
            if (window.saathiTV) {
                window.saathiTV.toggleAudio();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (window.saathiTV) {
                window.saathiTV.nextUser();
            }
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            if (window.saathiTV) {
                window.saathiTV.stopChat();
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show splash screen on first visit
    showSplashScreen();
    
    window.saathiTV = new SaathiTV();
    
    // Fix video controls
    fixVideoControls();
    
    // Add loading animation to images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('fade-in');
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-up');
            }
        });
    }, observerOptions);

    // Observe sections for animations
    document.querySelectorAll('.feature-card, .rule-card, .about-text').forEach(el => {
        observer.observe(el);
    });
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('Connection lost. Please check your internet.', 'warning');
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Export for use in other files
window.SaathiTV = SaathiTV;
