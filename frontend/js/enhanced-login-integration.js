// Enhanced Login Integration for Saathi TV

class EnhancedLoginIntegration {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔗 Initializing Enhanced Login Integration...');
        this.setupNavbarIntegration();
        this.setupRealSocialLogin();
        this.checkLoginStatus();
        console.log('✅ Enhanced Login Integration initialized');
    }

    setupNavbarIntegration() {
        const navUserSection = document.getElementById('navUserSection');
        if (navUserSection) {
            this.updateNavbar();
        }
    }

    updateNavbar() {
        const navUserSection = document.getElementById('navUserSection');
        if (!navUserSection) return;

        if (this.isLoggedIn()) {
            // Show user profile
            navUserSection.innerHTML = `
                <div class="nav-user-profile">
                    <div class="user-avatar">${this.currentUser.avatar}</div>
                    <span class="user-name">${this.currentUser.name}</span>
                </div>
            `;
        } else {
            // Show login button
            navUserSection.innerHTML = `
                <a href="login.html" class="nav-login-link">
                    <i class="fas fa-user"></i> Login
                </a>
            `;
        }
    }

    setupRealSocialLogin() {
        // Override social login functions with real implementations
        window.loginWithFacebook = () => this.realFacebookLogin();
        window.loginWithGoogle = () => this.realGoogleLogin();
        window.loginWithVK = () => this.realVKLogin();
    }

    // Real Facebook Login
    async realFacebookLogin() {
        console.log('📘 Initiating real Facebook login...');
        
        try {
            // Facebook Login URL
            const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
                `client_id=YOUR_FACEBOOK_APP_ID&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + '/login.html')}&` +
                `scope=email,public_profile&` +
                `response_type=code&` +
                `state=facebook_login`;

            // Open Facebook login in new window
            const popup = window.open(
                facebookAuthUrl,
                'facebook_login',
                'width=600,height=600,scrollbars=yes,resizable=yes'
            );

            // Monitor popup for completion
            const result = await this.monitorPopup(popup, 'facebook');
            
            if (result.success) {
                await this.handleSocialLoginSuccess(result.user, 'facebook');
            }

        } catch (error) {
            console.error('Facebook login error:', error);
            this.showError('Facebook login failed. Please try again.');
        }
    }

    // Real Google Login
    async realGoogleLogin() {
        console.log('🌐 Initiating real Google login...');
        
        try {
            // Google OAuth URL
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=YOUR_GOOGLE_CLIENT_ID&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + '/login.html')}&` +
                `scope=email profile&` +
                `response_type=code&` +
                `state=google_login`;

            // Open Google login in new window
            const popup = window.open(
                googleAuthUrl,
                'google_login',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );

            // Monitor popup for completion
            const result = await this.monitorPopup(popup, 'google');
            
            if (result.success) {
                await this.handleSocialLoginSuccess(result.user, 'google');
            }

        } catch (error) {
            console.error('Google login error:', error);
            this.showError('Google login failed. Please try again.');
        }
    }

    // Real VK Login
    async realVKLogin() {
        console.log('🔵 Initiating real VK login...');
        
        try {
            // VK OAuth URL
            const vkAuthUrl = `https://oauth.vk.com/authorize?` +
                `client_id=YOUR_VK_APP_ID&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + '/login.html')}&` +
                `scope=email&` +
                `response_type=code&` +
                `v=5.131&` +
                `state=vk_login`;

            // Open VK login in new window
            const popup = window.open(
                vkAuthUrl,
                'vk_login',
                'width=600,height=500,scrollbars=yes,resizable=yes'
            );

            // Monitor popup for completion
            const result = await this.monitorPopup(popup, 'vk');
            
            if (result.success) {
                await this.handleSocialLoginSuccess(result.user, 'vk');
            }

        } catch (error) {
            console.error('VK login error:', error);
            this.showError('VK login failed. Please try again.');
        }
    }

    // Monitor popup window for OAuth completion
    monitorPopup(popup, provider) {
        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    
                    // Check if we received auth data
                    const authData = sessionStorage.getItem(`${provider}_auth_result`);
                    
                    if (authData) {
                        const result = JSON.parse(authData);
                        sessionStorage.removeItem(`${provider}_auth_result`);
                        resolve(result);
                    } else {
                        resolve({ success: false, error: 'Login cancelled' });
                    }
                }
            }, 1000);

            // Timeout after 5 minutes
            setTimeout(() => {
                clearInterval(checkClosed);
                if (!popup.closed) {
                    popup.close();
                }
                reject(new Error('Login timeout'));
            }, 300000);
        });
    }

    async handleSocialLoginSuccess(user, provider) {
        console.log(`✅ ${provider} login successful:`, user);
        
        this.currentUser = {
            id: user.id || this.generateId(),
            name: user.name || `${provider} User`,
            email: user.email || `user@${provider}.com`,
            avatar: user.picture || '👤',
            provider: provider,
            loginTime: new Date().toISOString()
        };

        // Store session
        const session = {
            user: this.currentUser,
            timestamp: Date.now(),
            method: provider,
            sessionId: this.generateId()
        };

        localStorage.setItem('saathiTV_secure_session', JSON.stringify(session));
        
        // Update UI
        this.updateNavbar();
        this.showSuccess(`Welcome ${this.currentUser.name}!`);
        
        // Redirect to video chat
        setTimeout(() => {
            window.location.href = 'index.html#videoChat';
        }, 2000);
    }

    checkLoginStatus() {
        const session = localStorage.getItem('saathiTV_secure_session') || 
                      sessionStorage.getItem('saathiTV_current_session');
        
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (this.isValidSession(sessionData)) {
                    this.currentUser = sessionData.user;
                    this.updateNavbar();
                } else {
                    this.clearSession();
                }
            } catch (error) {
                this.clearSession();
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isValidSession(session) {
        if (!session || !session.user || !session.timestamp) return false;
        
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        const timeout = 30 * 60 * 1000; // 30 minutes
        
        return sessionAge < timeout;
    }

    logout() {
        console.log('👋 Logging out user...');
        
        this.currentUser = null;
        this.clearSession();
        this.updateNavbar();
        this.showSuccess('Logged out successfully!');
        
        // Redirect to home if on video chat
        if (window.location.hash === '#videoChat') {
            window.location.hash = '#home';
            // Auto-reload removed - user can manually refresh if needed
        }
    }

    clearSession() {
        localStorage.removeItem('saathiTV_secure_session');
        sessionStorage.removeItem('saathiTV_current_session');
    }

    generateId() {
        return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `enhanced-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => notification.remove(), 4000);
    }
}

// Enhanced CSS for navbar integration
const enhancedLoginCSS = `
    .nav-user-section {
        display: flex;
        align-items: center;
    }

    .nav-login-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: linear-gradient(45deg, #FF6B35, #F7931E);
        color: white;
        text-decoration: none;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    .nav-login-link:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
    }

    .nav-user-profile {
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
        cursor: pointer;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(45deg, #FF6B35, #F7931E);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }

    .user-name {
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        padding: 8px;
        display: none;
        z-index: 1000;
    }

    .nav-user-profile:hover .user-dropdown {
        display: block;
    }

    .logout-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        border-radius: 6px;
        font-size: 14px;
        white-space: nowrap;
        transition: all 0.3s ease;
    }

    .logout-btn:hover {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
    }

    .enhanced-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #4CAF50;
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        max-width: 350px;
    }

    .enhanced-notification.show {
        transform: translateX(0);
    }

    .enhanced-notification.error {
        border-left-color: #f44336;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px 20px;
    }

    .notification-content i {
        font-size: 18px;
        color: #4CAF50;
    }

    .enhanced-notification.error .notification-content i {
        color: #f44336;
    }

    .notification-content span {
        flex: 1;
        font-size: 14px;
        color: #333;
    }

    .notification-content button {
        background: none;
        border: none;
        font-size: 18px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
    }

    @media (max-width: 768px) {
        .nav-user-profile {
            gap: 6px;
        }
        
        .user-name {
            display: none;
        }
        
        .nav-login-link {
            padding: 6px 12px;
            font-size: 12px;
        }
    }
`;

// Apply CSS
const enhancedLoginStyleElement = document.createElement('style');
enhancedLoginStyleElement.textContent = enhancedLoginCSS;
document.head.appendChild(enhancedLoginStyleElement);

// Initialize enhanced login integration
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedLogin = new EnhancedLoginIntegration();
    console.log('🔗 Enhanced Login Integration loaded');
});

window.EnhancedLoginIntegration = EnhancedLoginIntegration;
