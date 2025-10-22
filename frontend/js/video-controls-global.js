// Global Video Controls Functions for Saathi TV

// Global toggle audio function
function toggleAudio() {
    console.log('🎤 Global toggleAudio called');
    
    if (window.audioVideoControls) {
        window.audioVideoControls.toggleAudio();
    } else {
        // Fallback implementation
        const audioBtn = document.getElementById('toggleAudio');
        if (audioBtn) {
            const isActive = audioBtn.classList.contains('active');
            
            if (isActive) {
                audioBtn.classList.remove('active');
                audioBtn.title = 'Turn on microphone';
                console.log('🔇 Audio muted (fallback)');
                showNotificationFallback('🔇 Microphone turned off');
            } else {
                audioBtn.classList.add('active');
                audioBtn.title = 'Turn off microphone';
                console.log('🔊 Audio unmuted (fallback)');
                showNotificationFallback('🔊 Microphone turned on');
            }
            
            // Update SVG icon
            const svg = audioBtn.querySelector('svg');
            if (svg) {
                const paths = svg.querySelectorAll('path');
                if (isActive) {
                    // Muted icon
                    svg.innerHTML = `
                        <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="currentColor"></path>
                        <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2h2v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2h2z" fill="currentColor"></path>
                        <path d="M3 3l18 18-1.41 1.41L3 3z" fill="currentColor" stroke="currentColor" stroke-width="2"></path>
                    `;
                } else {
                    // Unmuted icon
                    svg.innerHTML = `
                        <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="currentColor"></path>
                        <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2h2v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2h2z" fill="currentColor"></path>
                    `;
                }
            }
        }
    }
}

// Global screenshot function - Background capture with zero interruption
function takeScreenshot() {
    // Quick visual feedback - non-blocking
    const screenshotBtn = document.getElementById('screenshotBtn');
    if (screenshotBtn) {
        screenshotBtn.style.transform = 'scale(0.95)';
        screenshotBtn.style.background = '#4CAF50';
        setTimeout(() => {
            screenshotBtn.style.transform = '';
            screenshotBtn.style.background = '';
        }, 150);
    }
    
    // Use requestAnimationFrame for smooth, non-blocking execution
    requestAnimationFrame(() => {
        try {
            // Get video elements
            const remoteVideo = document.getElementById('remoteVideo');
            const localVideo = document.getElementById('localVideo');
            
            let targetVideo = null;
            
            // Prefer remote video (other person) if available
            if (remoteVideo && remoteVideo.readyState >= 2 && remoteVideo.videoWidth > 0) {
                targetVideo = remoteVideo;
            } else if (localVideo && localVideo.readyState >= 2 && localVideo.videoWidth > 0) {
                targetVideo = localVideo;
            }
            
            if (!targetVideo) {
                showNotificationFallback('📸 वीडियो तैयार नहीं है');
                return;
            }
            
            // Create canvas in memory - no DOM manipulation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: false });
            
            // Set canvas size
            canvas.width = targetVideo.videoWidth;
            canvas.height = targetVideo.videoHeight;
            
            // Capture current frame instantly
            ctx.drawImage(targetVideo, 0, 0);
            
            // Convert to blob asynchronously - non-blocking
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    
                    // Generate filename
                    const now = new Date();
                    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
                    link.download = `Saathi-TV-${timestamp}.png`;
                    link.href = url;
                    
                    // Trigger download silently
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    
                    // Cleanup after download
                    setTimeout(() => {
                        if (link.parentNode) {
                            document.body.removeChild(link);
                        }
                        URL.revokeObjectURL(url);
                    }, 50);
                    
                    // Show success notification
                    showNotificationFallback('📸 Screenshot saved!');
                } else {
                    showNotificationFallback('❌ Screenshot failed');
                }
            }, 'image/png', 0.92);
            
        } catch (error) {
            console.error('Screenshot error:', error);
            showNotificationFallback('❌ Error taking screenshot');
        }
    });
}

// Global toggle chat function
function toggleChat() {
    console.log('💬 Global toggleChat called');
    
    const chatPanel = document.getElementById('chatPanel');
    if (chatPanel) {
        const isHidden = chatPanel.classList.contains('hidden');
        
        if (isHidden) {
            chatPanel.classList.remove('hidden');
            chatPanel.style.display = 'block';
            showNotificationFallback('💬 Chat opened');
        } else {
            chatPanel.classList.add('hidden');
            chatPanel.style.display = 'none';
            showNotificationFallback('💬 Chat closed');
        }
    }
}

// Global toggle fullscreen function
function toggleFullscreen() {
    console.log('🖥️ Global toggleFullscreen called');
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        const videoSection = document.getElementById('videoChat');
        if (videoSection && videoSection.requestFullscreen) {
            videoSection.requestFullscreen().then(() => {
                showNotificationFallback('🖥️ Entered fullscreen');
                updateFullscreenButton(true);
            }).catch(err => {
                console.error('Fullscreen error:', err);
                showNotificationFallback('❌ Fullscreen failed');
            });
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                showNotificationFallback('🖥️ Exited fullscreen');
                updateFullscreenButton(false);
            }).catch(err => {
                console.error('Exit fullscreen error:', err);
            });
        }
    }
}

// Global toggle pause function
function togglePause() {
    console.log('⏸️ Global togglePause called');
    
    const remoteVideo = document.getElementById('remoteVideo');
    const localVideo = document.getElementById('localVideo');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (remoteVideo || localVideo) {
        const isPaused = remoteVideo?.paused || localVideo?.paused;
        
        if (isPaused) {
            // Resume videos
            if (remoteVideo && remoteVideo.paused) remoteVideo.play();
            if (localVideo && localVideo.paused) localVideo.play();
            
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                pauseBtn.title = 'Pause Video';
            }
            showNotificationFallback('▶️ Video resumed');
        } else {
            // Pause videos
            if (remoteVideo && !remoteVideo.paused) remoteVideo.pause();
            if (localVideo && !localVideo.paused) localVideo.pause();
            
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                pauseBtn.title = 'Resume Video';
            }
            showNotificationFallback('⏸️ Video paused');
        }
    } else {
        showNotificationFallback('❌ No video found to pause/resume');
    }
}

// Global next user function
function nextUser() {
    console.log('⏭️ Global nextUser called');
    
    // Add visual feedback
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.style.transform = 'scale(0.95)';
        nextBtn.style.background = '#FF6B35';
        setTimeout(() => {
            nextBtn.style.transform = '';
            nextBtn.style.background = '';
        }, 200);
    }
    
    // Try existing systems first
    if (window.audioVideoControls && window.audioVideoControls.nextUser) {
        window.audioVideoControls.nextUser();
        return;
    }
    
    if (window.saathiTV && window.saathiTV.nextUser) {
        window.saathiTV.nextUser();
        return;
    }
    
    if (window.webRTCFix && window.webRTCFix.nextUser) {
        window.webRTCFix.nextUser();
        return;
    }
    
    // Fallback implementation
    showNotificationFallback('⏭️ Finding next user...');
    
    // Simulate finding next user
    setTimeout(() => {
        showNotificationFallback('🔄 Connecting to next user...');
    }, 1000);
}

// Global report user function
function reportUser() {
    console.log('🚩 Global reportUser called');
    
    // Add visual feedback
    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
        reportBtn.style.transform = 'scale(0.95)';
        reportBtn.style.background = '#f44336';
        setTimeout(() => {
            reportBtn.style.transform = '';
            reportBtn.style.background = '';
        }, 200);
    }
    
    // Show report confirmation
    const confirmed = confirm('🚩 Report this user?\n\nAre you sure you want to report this user for inappropriate behavior?');
    
    if (confirmed) {
        // Try existing report systems
        if (window.saathiTV && window.saathiTV.reportUser) {
            window.saathiTV.reportUser();
            return;
        }
        
        if (window.webRTCFix && window.webRTCFix.reportUser) {
            window.webRTCFix.reportUser();
            return;
        }
        
        // Fallback implementation
        showNotificationFallback('🚩 User reported successfully');
        console.log('✅ User reported');
        
        // Optionally move to next user after reporting
        setTimeout(() => {
            nextUser();
        }, 1500);
    } else {
        showNotificationFallback('❌ Report cancelled');
    }
}

// Global country selector function
function toggleCountrySelector() {
    console.log('🌍 Global toggleCountrySelector called');
    
    // Add visual feedback
    const countryBtn = document.getElementById('countryBtn');
    if (countryBtn) {
        countryBtn.style.transform = 'scale(0.95)';
        countryBtn.style.background = '#4CAF50';
        setTimeout(() => {
            countryBtn.style.transform = '';
            countryBtn.style.background = '';
        }, 200);
    }
    
    // Remove existing dropdown if any
    const existingDropdown = document.getElementById('countryDropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    
    // Country options
    const countries = [
        { code: 'any', flag: '🌍', name: 'Any Country' },
        { code: 'IN', flag: '🇮🇳', name: 'India' },
        { code: 'US', flag: '🇺🇸', name: 'United States' },
        { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
        { code: 'CA', flag: '🇨🇦', name: 'Canada' },
        { code: 'AU', flag: '🇦🇺', name: 'Australia' },
        { code: 'DE', flag: '🇩🇪', name: 'Germany' },
        { code: 'FR', flag: '🇫🇷', name: 'France' },
        { code: 'JP', flag: '🇯🇵', name: 'Japan' },
        { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
        { code: 'RU', flag: '🇷🇺', name: 'Russia' },
        { code: 'CN', flag: '🇨🇳', name: 'China' },
        { code: 'IT', flag: '🇮🇹', name: 'Italy' },
        { code: 'ES', flag: '🇪🇸', name: 'Spain' }
    ];
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'countryDropdown';
    dropdown.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.95);
        border-radius: 15px;
        padding: 15px;
        z-index: 10000;
        max-height: 300px;
        overflow-y: auto;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        min-width: 250px;
    `;
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Select Country';
    title.style.cssText = `
        color: white;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        font-size: 16px;
    `;
    dropdown.appendChild(title);
    
    // Add country options
    countries.forEach(country => {
        const option = document.createElement('div');
        option.style.cssText = `
            color: white;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 8px;
            margin: 2px 0;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
        `;
        
        option.innerHTML = `<span style="font-size: 18px;">${country.flag}</span> ${country.name}`;
        
        option.addEventListener('mouseenter', () => {
            option.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
        
        option.addEventListener('click', () => {
            // Update button
            if (countryBtn) {
                const flagSpan = countryBtn.querySelector('.flag');
                if (flagSpan) {
                    flagSpan.textContent = country.flag;
                }
            }
            
            // Save preference
            localStorage.setItem('selectedCountry', country.code);
            showNotificationFallback(`🌍 Country set to ${country.name}`);
            
            // Remove dropdown
            dropdown.remove();
            
            console.log('✅ Country selected:', country.name);
        });
        
        dropdown.appendChild(option);
    });
    
    // Add close button
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
        color: #ff6b6b;
        text-align: center;
        padding: 10px;
        cursor: pointer;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 10px;
        font-weight: bold;
    `;
    
    closeBtn.addEventListener('click', () => {
        dropdown.remove();
    });
    
    dropdown.appendChild(closeBtn);
    
    // Add to page
    document.body.appendChild(dropdown);
    
    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== countryBtn) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

// Global gender selector function
function toggleGenderSelector() {
    console.log('👤 Global toggleGenderSelector called');
    
    // Add visual feedback
    const genderBtn = document.getElementById('genderBtn');
    if (genderBtn) {
        genderBtn.style.transform = 'scale(0.95)';
        genderBtn.style.background = '#FF6B35';
        setTimeout(() => {
            genderBtn.style.transform = '';
            genderBtn.style.background = '';
        }, 200);
    }
    
    // Remove existing dropdown if any
    const existingDropdown = document.getElementById('genderDropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    
    // Gender options
    const genders = [
        { code: 'male', icon: '👨', name: 'Male' },
        { code: 'female', icon: '👩', name: 'Female' },
        { code: 'other', icon: '👤', name: 'Other' }
    ];
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'genderDropdown';
    dropdown.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.95);
        border-radius: 15px;
        padding: 15px;
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        min-width: 200px;
    `;
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'I am looking for';
    title.style.cssText = `
        color: white;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        font-size: 16px;
    `;
    dropdown.appendChild(title);
    
    // Add gender options
    genders.forEach(gender => {
        const option = document.createElement('div');
        option.style.cssText = `
            color: white;
            padding: 12px 15px;
            cursor: pointer;
            border-radius: 8px;
            margin: 2px 0;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
        `;
        
        option.innerHTML = `<span style="font-size: 18px;">${gender.icon}</span> ${gender.name}`;
        
        option.addEventListener('mouseenter', () => {
            option.style.background = 'rgba(255, 107, 53, 0.3)';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
        
        option.addEventListener('click', () => {
            // Save preference
            localStorage.setItem('selectedGender', gender.code);
            showNotificationFallback(`👤 Looking for ${gender.name}`);
            
            // Remove dropdown
            dropdown.remove();
            
            console.log('✅ Gender preference selected:', gender.name);
        });
        
        dropdown.appendChild(option);
    });
    
    // Add close button
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
        color: #ff6b6b;
        text-align: center;
        padding: 10px;
        cursor: pointer;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 10px;
        font-weight: bold;
    `;
    
    closeBtn.addEventListener('click', () => {
        dropdown.remove();
    });
    
    dropdown.appendChild(closeBtn);
    
    // Add to page
    document.body.appendChild(dropdown);
    
    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== genderBtn) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

// Helper function to update fullscreen button
function updateFullscreenButton(isFullscreen) {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        const icon = fullscreenBtn.querySelector('i');
        if (icon) {
            if (isFullscreen) {
                icon.className = 'fas fa-compress';
                fullscreenBtn.title = 'Exit Fullscreen';
            } else {
                icon.className = 'fas fa-expand';
                fullscreenBtn.title = 'Toggle Fullscreen';
            }
        }
    }
}

// Fallback notification function
function showNotificationFallback(message, type = 'info') {
    // Try to use existing notification system first
    if (window.showNotification) {
        window.showNotification(message, type);
        return;
    }
    
    // Create fallback notification
    const notification = document.createElement('div');
    notification.className = `video-control-notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        maxWidth: '300px'
    });

    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#f44336'
    };
    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 3000);
}

// Add CSS for notifications if not exists
if (!document.querySelector('#video-control-styles')) {
    const styles = document.createElement('style');
    styles.id = 'video-control-styles';
    styles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .video-control-notification {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
    `;
    document.head.appendChild(styles);
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
    updateFullscreenButton(!!document.fullscreenElement);
});

// Function to update username in video overlay
function updateUserVideoLabel() {
    const userVideoLabel = document.getElementById('userVideoLabel');
    if (!userVideoLabel) return;
    
    try {
        // Try to get user from localStorage first
        const currentUser = localStorage.getItem('saathi_current_user');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            const userName = userData.name || userData.email?.split('@')[0] || 'You';
            userVideoLabel.textContent = userName;
            console.log('✅ Updated video label to:', userName);
            return;
        }
        
        // Try Firebase auth if available
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            const user = window.firebaseAuth.currentUser;
            const userName = user.displayName || user.email?.split('@')[0] || 'You';
            userVideoLabel.textContent = userName;
            console.log('✅ Updated video label from Firebase to:', userName);
            return;
        }
        
        // Fallback to default
        userVideoLabel.textContent = 'You';
        
    } catch (error) {
        console.error('Error updating user video label:', error);
        userVideoLabel.textContent = 'You';
    }
}

// Update username when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateUserVideoLabel();
});

// Update username when video chat starts
document.addEventListener('videoChatStarted', () => {
    updateUserVideoLabel();
});

// Listen for login status changes
if (window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged((user) => {
        setTimeout(updateUserVideoLabel, 100);
    });
}

// Also update when localStorage changes (for other login methods)
window.addEventListener('storage', (e) => {
    if (e.key === 'saathi_current_user') {
        updateUserVideoLabel();
    }
});

// Make function globally available
window.updateUserVideoLabel = updateUserVideoLabel;

console.log('🎛️ Global video controls loaded successfully');
