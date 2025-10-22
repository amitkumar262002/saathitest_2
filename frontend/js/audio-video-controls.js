// Audio and Video Controls Fix for Saathi TV

class AudioVideoControls {
    constructor() {
        this.localStream = null;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.controls = {
            toggleVideo: null,
            toggleAudio: null,
            nextBtn: null,
            stopBtn: null
        };
        
        this.init();
    }

    init() {
        this.setupControlElements();
        this.setupEventListeners();
        this.updateButtonStates();
        console.log('🎛️ Audio/Video Controls initialized');
    }

    setupControlElements() {
        this.controls.toggleVideo = document.getElementById('toggleVideo');
        this.controls.toggleAudio = document.getElementById('toggleAudio');
        this.controls.nextBtn = document.getElementById('nextBtn');
        this.controls.stopBtn = document.getElementById('stopBtn');
        
        // Ensure all controls exist
        Object.entries(this.controls).forEach(([key, element]) => {
            if (!element) {
                console.warn(`Control element ${key} not found`);
            }
        });
    }

    setupEventListeners() {
        // Video toggle
        if (this.controls.toggleVideo) {
            this.controls.toggleVideo.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleVideo();
            });
        }

        // Audio toggle - FIXED
        if (this.controls.toggleAudio) {
            this.controls.toggleAudio.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAudio();
            });
        }

        // Next button
        if (this.controls.nextBtn) {
            this.controls.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextUser();
            });
        }

        // Stop button
        if (this.controls.stopBtn) {
            this.controls.stopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.stopChat();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case 'v':
                    e.preventDefault();
                    this.toggleVideo();
                    break;
                case 'm':
                    e.preventDefault();
                    this.toggleAudio();
                    break;
                case 'n':
                    e.preventDefault();
                    this.nextUser();
                    break;
                case 'escape':
                    e.preventDefault();
                    this.stopChat();
                    break;
            }
        });
    }

    setLocalStream(stream) {
        this.localStream = stream;
        this.updateButtonStates();
    }

    toggleVideo() {
        console.log('🎥 Toggling video...');
        
        if (!this.localStream) {
            this.showNotification('No video stream available', 'error');
            return;
        }

        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length === 0) {
            this.showNotification('No video track found', 'error');
            return;
        }

        const videoTrack = videoTracks[0];
        this.isVideoEnabled = !this.isVideoEnabled;
        videoTrack.enabled = this.isVideoEnabled;

        // Update button state
        this.updateVideoButton();
        
        // Show notification
        this.showNotification(
            this.isVideoEnabled ? 'Camera turned on' : 'Camera turned off',
            'info'
        );

        // Update local video display
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.style.opacity = this.isVideoEnabled ? '1' : '0.3';
        }

        console.log(`Video ${this.isVideoEnabled ? 'enabled' : 'disabled'}`);
    }

    toggleAudio() {
        console.log('🎤 Toggling audio...');
        
        if (!this.localStream) {
            this.showNotification('No audio stream available', 'error');
            return;
        }

        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length === 0) {
            this.showNotification('No audio track found', 'error');
            return;
        }

        const audioTrack = audioTracks[0];
        this.isAudioEnabled = !this.isAudioEnabled;
        audioTrack.enabled = this.isAudioEnabled;

        // Update button state
        this.updateAudioButton();
        
        // Show notification
        this.showNotification(
            this.isAudioEnabled ? 'Microphone turned on' : 'Microphone turned off',
            'info'
        );

        // Visual feedback
        this.addButtonFeedback(this.controls.toggleAudio);

        console.log(`Audio ${this.isAudioEnabled ? 'enabled' : 'disabled'}`);
    }

    updateVideoButton() {
        const button = this.controls.toggleVideo;
        if (!button) return;

        if (this.isVideoEnabled) {
            button.classList.add('active');
            button.classList.remove('inactive');
            button.title = 'Turn off camera (V)';
        } else {
            button.classList.remove('active');
            button.classList.add('inactive');
            button.title = 'Turn on camera (V)';
        }

        // Update icon
        const icon = button.querySelector('svg path');
        if (icon) {
            if (this.isVideoEnabled) {
                icon.setAttribute('d', 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z');
            } else {
                icon.setAttribute('d', 'M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82l-3.28-3.28c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L18.18 17.18c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L17 13.5V17c0 .55.45 1 1 1h1.73L21 19.27V6.5z');
            }
        }
    }

    updateAudioButton() {
        const button = this.controls.toggleAudio;
        if (!button) return;

        if (this.isAudioEnabled) {
            button.classList.add('active');
            button.classList.remove('inactive');
            button.title = 'Turn off microphone (M)';
        } else {
            button.classList.remove('active');
            button.classList.add('inactive');
            button.title = 'Turn on microphone (M)';
        }

        // Update icon
        const icon = button.querySelector('svg path');
        if (icon) {
            if (this.isAudioEnabled) {
                icon.setAttribute('d', 'M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6.7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4-1.27 1.27-2.76 2.19-4.4 2.73v2.5c2.89-.86 5-3.54 5-6.64 0-.55.45-1 1-1s1 .45 1 1c0 4.28-2.99 7.88-7 8.77v2.28c0 .55-.45 1-1 1s-1-.45-1-1v-2.28c-4.01-.89-7-4.49-7-8.77 0-.55.45-1 1-1s1 .45 1 1c0 3.1 2.11 5.78 5 6.64v-2.5c-1.64-.54-3.13-1.46-4.4-2.73-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0C8.28 9.16 10.07 10 12 10s3.72-.84 5.3-2.3z');
            } else {
                icon.setAttribute('d', 'M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V4c0-1.1-.9-2-2-2s-2 .9-2 2v.18l3.98 3.98zM4.27 3L3 4.27l6.01 6.01V11c0 1.1.9 2 2 2 .11 0 .22-.01.33-.03l1.17 1.17c-.8.21-1.69.36-2.5.36-3.31 0-6-2.69-6-6H2c0 4.72 3.05 8.44 7 9.49v2.51h2v-2.51c.94-.2 1.82-.57 2.55-1.08L20.73 21 22 19.73 4.27 3z');
            }
        }
    }

    updateButtonStates() {
        this.updateVideoButton();
        this.updateAudioButton();
    }

    addButtonFeedback(button) {
        if (!button) return;

        // Add visual feedback
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);

        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'button-ripple';
        ripple.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    nextUser() {
        console.log('⏭️ Finding next user...');
        
        if (window.saathiTV) {
            window.saathiTV.nextUser();
        } else {
            this.showNotification('Chat system not available', 'error');
        }

        this.addButtonFeedback(this.controls.nextBtn);
    }

    stopChat() {
        console.log('⏹️ Stopping chat...');
        
        if (window.saathiTV) {
            window.saathiTV.stopChat();
        } else {
            // Fallback: hide video chat section
            const videoSection = document.getElementById('videoChat');
            if (videoSection) {
                videoSection.style.display = 'none';
            }
        }

        this.addButtonFeedback(this.controls.stopBtn);
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `control-notification ${type}`;
            notification.textContent = message;
            
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '10px 15px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                zIndex: '10000',
                animation: 'slideIn 0.3s ease-out'
            });

            const colors = {
                info: '#2196F3',
                success: '#4CAF50',
                warning: '#FF9800',
                error: '#f44336'
            };
            notification.style.background = colors[type] || colors.info;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    // Method to be called when starting chat
    onChatStart(stream) {
        this.setLocalStream(stream);
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.updateButtonStates();
    }

    // Method to be called when stopping chat
    onChatStop() {
        this.localStream = null;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.updateButtonStates();
    }
}

// Add CSS for button states and animations
const controlStyles = document.createElement('style');
controlStyles.textContent = `
    .control-btn {
        position: relative;
        transition: all 0.3s ease;
    }
    
    .control-btn.active {
        background: #4CAF50;
        color: white;
        box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
    }
    
    .control-btn.inactive {
        background: #f44336;
        color: white;
        box-shadow: 0 0 15px rgba(244, 67, 54, 0.4);
    }
    
    .control-btn:hover {
        transform: scale(1.05);
    }
    
    .control-btn:active {
        transform: scale(0.95);
    }
    
    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    .control-notification {
        animation: slideIn 0.3s ease-out;
    }
`;

document.head.appendChild(controlStyles);

// Initialize controls
document.addEventListener('DOMContentLoaded', () => {
    window.audioVideoControls = new AudioVideoControls();
});

// Export for global use
window.AudioVideoControls = AudioVideoControls;
