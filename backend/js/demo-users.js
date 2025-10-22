// Demo Users System for Saathi TV

class DemoUsersSystem {
    constructor() {
        this.demoUsers = [
            {
                id: 'demo_1',
                name: 'Alex',
                country: 'US',
                flag: '🇺🇸',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            },
            {
                id: 'demo_2',
                name: 'Sarah',
                country: 'UK',
                flag: '🇬🇧',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
                video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
            },
            {
                id: 'demo_3',
                name: 'Raj',
                country: 'IN',
                flag: '🇮🇳',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            },
            {
                id: 'demo_4',
                name: 'Emma',
                country: 'CA',
                flag: '🇨🇦',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
                video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
            },
            {
                id: 'demo_5',
                name: 'Lucas',
                country: 'AU',
                flag: '🇦🇺',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
                video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
            }
        ];
        
        this.currentUserIndex = 0;
        this.isActive = false;
        this.init();
    }

    init() {
        console.log('🎭 Demo Users System initialized');
        this.setupDemoMode();
        this.addDemoControls();
    }

    setupDemoMode() {
        // Add demo mode toggle
        const demoToggle = document.createElement('button');
        demoToggle.className = 'demo-toggle';
        demoToggle.innerHTML = '🎭 Demo Mode';
        demoToggle.onclick = () => this.toggleDemoMode();
        
        const header = document.querySelector('.chat-header');
        if (header) {
            header.appendChild(demoToggle);
        }
    }

    toggleDemoMode() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.startDemoMode();
            this.showNotification('🎭 Demo mode activated');
        } else {
            this.stopDemoMode();
            this.showNotification('📹 Live mode activated');
        }
    }

    startDemoMode() {
        console.log('🎭 Starting demo mode...');
        this.loadDemoUser(this.currentUserIndex);
        
        // Update demo toggle
        const toggle = document.querySelector('.demo-toggle');
        if (toggle) {
            toggle.innerHTML = '📹 Live Mode';
            toggle.style.background = '#4CAF50';
        }
    }

    stopDemoMode() {
        console.log('📹 Stopping demo mode...');
        
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.src = '';
            remoteVideo.poster = '';
        }
        
        // Update demo toggle
        const toggle = document.querySelector('.demo-toggle');
        if (toggle) {
            toggle.innerHTML = '🎭 Demo Mode';
            toggle.style.background = '#FF6B35';
        }
        
        this.updateConnectionStatus('Looking for someone...', '📡');
    }

    loadDemoUser(index) {
        const user = this.demoUsers[index];
        if (!user) return;

        console.log('👤 Loading demo user:', user.name);

        // Update remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.src = user.video;
            remoteVideo.poster = user.avatar;
            remoteVideo.muted = true; // Mute demo videos
            remoteVideo.loop = true;
            
            remoteVideo.onloadeddata = () => {
                console.log('✅ Demo video loaded for', user.name);
            };
        }

        // Update connection status
        this.updateConnectionStatus(
            `Connected to ${user.name}`,
            user.flag,
            user.country
        );

        // Add demo user info overlay
        this.addUserInfoOverlay(user);
    }

    nextDemoUser() {
        if (!this.isActive) return;
        
        this.currentUserIndex = (this.currentUserIndex + 1) % this.demoUsers.length;
        this.loadDemoUser(this.currentUserIndex);
        
        const user = this.demoUsers[this.currentUserIndex];
        this.showNotification(`🔄 Connected to ${user.name} from ${user.country}`);
    }

    updateConnectionStatus(text, icon, country = '') {
        const statusBadge = document.getElementById('connectionBadge');
        if (statusBadge) {
            const statusIcon = statusBadge.querySelector('.status-icon');
            const statusText = statusBadge.querySelector('.status-text');
            const countryInfo = statusBadge.querySelector('.country-info');
            
            if (statusIcon) statusIcon.textContent = icon;
            if (statusText) statusText.textContent = text;
            
            if (countryInfo && country) {
                const flag = countryInfo.querySelector('.flag');
                const countryName = countryInfo.querySelector('.country-name');
                
                if (flag) flag.textContent = icon;
                if (countryName) countryName.textContent = country + '.';
            }
        }
    }

    addUserInfoOverlay(user) {
        // Remove existing overlay
        const existingOverlay = document.querySelector('.demo-user-info');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create new overlay
        const overlay = document.createElement('div');
        overlay.className = 'demo-user-info';
        overlay.innerHTML = `
            <div class="user-info-content">
                <div class="user-avatar">
                    <img src="${user.avatar}" alt="${user.name}" onerror="this.style.display='none'">
                </div>
                <div class="user-details">
                    <span class="user-name">${user.name}</span>
                    <span class="user-location">${user.flag} ${user.country}</span>
                </div>
            </div>
        `;

        const remoteVideoContainer = document.querySelector('.left-side');
        if (remoteVideoContainer) {
            remoteVideoContainer.appendChild(overlay);
        }
    }

    addDemoControls() {
        // Override next button for demo mode
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            const originalClick = nextBtn.onclick;
            nextBtn.onclick = () => {
                if (this.isActive) {
                    this.nextDemoUser();
                } else if (originalClick) {
                    originalClick();
                }
            };
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fix-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Enhanced Report System
class EnhancedReportSystem {
    constructor() {
        this.reportReasons = [
            { id: 'inappropriate', text: '🚫 Inappropriate behavior', severity: 'high' },
            { id: 'nudity', text: '🔞 Nudity or sexual content', severity: 'high' },
            { id: 'harassment', text: '😠 Harassment or bullying', severity: 'high' },
            { id: 'spam', text: '📢 Spam or advertising', severity: 'medium' },
            { id: 'violence', text: '⚔️ Violence or threats', severity: 'high' },
            { id: 'fake', text: '🎭 Fake or misleading profile', severity: 'low' },
            { id: 'underage', text: '👶 Underage user', severity: 'high' },
            { id: 'other', text: '❓ Other reason', severity: 'medium' }
        ];
        
        this.init();
    }

    init() {
        this.setupQuickReportButtons();
        console.log('🚨 Enhanced Report System initialized');
    }

    setupQuickReportButtons() {
        // Add quick report buttons next to Next/Stop
        const leftControls = document.querySelector('.left-controls');
        if (leftControls) {
            const quickReportBtn = document.createElement('button');
            quickReportBtn.className = 'ometv-btn report-quick-btn';
            quickReportBtn.innerHTML = '🚨 Report';
            quickReportBtn.onclick = () => this.showQuickReport();
            
            leftControls.appendChild(quickReportBtn);
        }
    }

    showQuickReport() {
        const modal = document.createElement('div');
        modal.className = 'report-modal';
        modal.innerHTML = `
            <div class="report-content">
                <h3>🚨 Report User</h3>
                <p>Select the reason for reporting this user:</p>
                <div class="report-reasons">
                    ${this.reportReasons.map(reason => `
                        <button class="report-reason ${reason.severity}" data-reason="${reason.id}">
                            ${reason.text}
                        </button>
                    `).join('')}
                </div>
                <div class="report-actions">
                    <button class="report-cancel">Cancel</button>
                    <button class="report-block">🚫 Block & Report</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle reason selection
        modal.querySelectorAll('.report-reason').forEach(btn => {
            btn.onclick = () => {
                const reason = btn.dataset.reason;
                this.submitReport(reason, btn.textContent);
                modal.remove();
            };
        });

        // Handle block & report
        modal.querySelector('.report-block').onclick = () => {
            this.blockAndReport();
            modal.remove();
        };

        // Handle cancel
        modal.querySelector('.report-cancel').onclick = () => {
            modal.remove();
        };

        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    submitReport(reasonId, reasonText) {
        console.log('📝 Report submitted:', reasonId, reasonText);
        
        // Show success notification
        this.showNotification('✅ Report submitted successfully');
        
        // Auto-next to new user
        setTimeout(() => {
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) nextBtn.click();
        }, 1000);
    }

    blockAndReport() {
        console.log('🚫 User blocked and reported');
        this.showNotification('🚫 User blocked and reported');
        
        // Auto-next to new user
        setTimeout(() => {
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) nextBtn.click();
        }, 500);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fix-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Enhanced CSS for demo users and report system
const demoUsersCSS = `
    .demo-toggle {
        background: #FF6B35;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 15px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-left: 15px;
    }

    .demo-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
    }

    .demo-user-info {
        position: absolute;
        top: 15px;
        left: 15px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
        z-index: 10;
        animation: slideInLeft 0.3s ease-out;
    }

    .user-info-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .user-avatar img {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #FFD700;
    }

    .user-details {
        display: flex;
        flex-direction: column;
    }

    .user-name {
        font-weight: 600;
        font-size: 14px;
        color: #FFD700;
    }

    .user-location {
        font-size: 11px;
        opacity: 0.8;
    }

    .report-quick-btn {
        background: #f44336 !important;
        color: white !important;
        min-width: 70px !important;
    }

    .report-quick-btn:hover {
        background: #d32f2f !important;
        transform: translateY(-2px) !important;
    }

    .report-reason.high {
        border-left: 4px solid #f44336;
    }

    .report-reason.medium {
        border-left: 4px solid #FF9800;
    }

    .report-reason.low {
        border-left: 4px solid #4CAF50;
    }

    .report-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        justify-content: space-between;
    }

    .report-cancel {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .report-cancel:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .report-block {
        background: #f44336;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .report-block:hover {
        background: #d32f2f;
        transform: scale(1.05);
    }

    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .demo-user-info {
            top: 10px;
            left: 10px;
            padding: 8px 12px;
        }
        
        .user-avatar img {
            width: 30px;
            height: 30px;
        }
        
        .user-name {
            font-size: 12px;
        }
        
        .user-location {
            font-size: 10px;
        }
        
        .demo-toggle {
            padding: 4px 8px;
            font-size: 11px;
            margin-left: 10px;
        }
    }
`;

// Apply CSS
const demoUsersStyleElement = document.createElement('style');
demoUsersStyleElement.textContent = demoUsersCSS;
document.head.appendChild(demoUsersStyleElement);

// Initialize systems
document.addEventListener('DOMContentLoaded', () => {
    window.demoUsersSystem = new DemoUsersSystem();
    window.enhancedReportSystem = new EnhancedReportSystem();
    console.log('🎭 Demo Users and Enhanced Report Systems loaded');
});

window.DemoUsersSystem = DemoUsersSystem;
window.EnhancedReportSystem = EnhancedReportSystem;
