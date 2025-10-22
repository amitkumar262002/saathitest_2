// Complete Login System for Saathi TV

class LoginSystem {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.loginCallbacks = [];
        
        this.init();
    }

    init() {
        console.log('🔐 Initializing Login System...');
        
        // Check if user is already logged in
        this.checkLoginStatus();
        
        // Setup login handlers
        this.setupLoginHandlers();
        
        // Setup navbar login button
        this.setupNavbarLogin();
        
        console.log('✅ Login System initialized');
    }

    checkLoginStatus() {
        const savedUser = localStorage.getItem('saathiTVUser');
        const sessionUser = sessionStorage.getItem('saathiTVSession');
        
        if (savedUser || sessionUser) {
            try {
                this.currentUser = JSON.parse(savedUser || sessionUser);
                this.isLoggedIn = true;
                this.updateUIForLoggedInUser();
                console.log('👤 User already logged in:', this.currentUser.name);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                this.logout();
            }
        }
    }

    setupLoginHandlers() {
        // Handle login form submission
        window.handleLogin = (event) => {
            event.preventDefault();
            this.processLogin(event.target);
        };

        // Handle social logins
        window.loginWithGoogle = () => {
            this.socialLogin('google');
        };

        window.loginWithFacebook = () => {
            this.socialLogin('facebook');
        };


        // Handle forgot password
        window.handleForgotPassword = (event) => {
            event.preventDefault();
            this.handleForgotPassword(event.target);
        };

        // Modal handlers
        window.showForgotPassword = () => {
            document.getElementById('forgotPasswordModal').style.display = 'flex';
        };

        window.closeForgotPassword = () => {
            document.getElementById('forgotPasswordModal').style.display = 'none';
        };

        window.showSignup = () => {
            this.showNotification('Sign up feature coming soon! Please use email login.');
        };

        window.togglePassword = () => {
            const passwordInput = document.getElementById('password');
            const toggleBtn = document.querySelector('.password-toggle');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        };
    }

    setupNavbarLogin() {
        // Create login button in navbar if it doesn't exist
        const navbar = document.querySelector('.navbar, .header, nav');
        if (navbar && !document.getElementById('navLoginBtn')) {
            const loginBtn = document.createElement('button');
            loginBtn.id = 'navLoginBtn';
            loginBtn.className = 'nav-login-btn';
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
            loginBtn.onclick = () => this.showLoginPage();
            
            navbar.appendChild(loginBtn);
        }

        // Update existing login buttons
        this.updateNavbarUI();
    }

    async processLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');

        // Show loading state
        const submitBtn = form.querySelector('.login-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        submitBtn.disabled = true;

        try {
            // Simulate login API call
            await this.simulateLoginAPI(email, password);
            
            // Create user object
            const user = {
                id: this.generateUserId(),
                email: email,
                name: email.split('@')[0],
                loginMethod: 'email',
                loginTime: new Date().toISOString(),
                avatar: this.generateAvatar(email)
            };

            // Save user data
            if (remember) {
                localStorage.setItem('saathiTVUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('saathiTVSession', JSON.stringify(user));
            }

            // Set current user
            this.currentUser = user;
            this.isLoggedIn = true;

            // Show success message
            this.showNotification('✅ Login successful! Welcome back, ' + user.name);

            // Redirect to video chat
            setTimeout(() => {
                this.redirectToVideoChat();
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            this.showError('❌ Login failed. Please check your credentials.');
        } finally {
            // Reset button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    async simulateLoginAPI(email, password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simple validation (in real app, this would be server-side)
        if (email && password.length >= 6) {
            return { success: true };
        } else {
            throw new Error('Invalid credentials');
        }
    }

    socialLogin(provider) {
        console.log(`🔐 Logging in with ${provider}...`);
        
        // Simulate social login
        const user = {
            id: this.generateUserId(),
            email: `user@${provider}.com`,
            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            loginMethod: provider,
            loginTime: new Date().toISOString(),
            avatar: this.generateAvatar(`user@${provider}.com`)
        };

        // Save user data
        sessionStorage.setItem('saathiTVSession', JSON.stringify(user));
        this.currentUser = user;
        this.isLoggedIn = true;

        this.showNotification(`✅ Logged in with ${provider}! Welcome, ${user.name}`);
        
        setTimeout(() => {
            this.redirectToVideoChat();
        }, 1500);
    }



    handleForgotPassword(form) {
        const formData = new FormData(form);
        const email = formData.get('resetEmail');
        
        // Simulate password reset
        this.showNotification('📧 Password reset link sent to ' + email);
        window.closeForgotPassword();
    }

    showLoginPage() {
        // Check if we're already on login page
        if (window.location.pathname.includes('login.html')) {
            return;
        }

        // Redirect to login page
        window.location.href = 'login.html';
    }

    redirectToVideoChat() {
        // Trigger login callbacks
        this.loginCallbacks.forEach(callback => {
            try {
                callback(this.currentUser);
            } catch (error) {
                console.error('Login callback error:', error);
            }
        });

        // Update UI
        this.updateUIForLoggedInUser();

        // Redirect based on current page
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html#videoChat';
        } else {
            // Start video chat directly
            if (window.webRTCFix) {
                window.webRTCFix.startChat();
            } else {
                // Show video chat section
                const videoSection = document.getElementById('videoChat');
                const heroSection = document.getElementById('hero');
                
                if (videoSection && heroSection) {
                    heroSection.style.display = 'none';
                    videoSection.style.display = 'flex';
                }
            }
        }
    }

    updateUIForLoggedInUser() {
        // Update navbar
        this.updateNavbarUI();
        
        // Update any user-specific elements
        const userElements = document.querySelectorAll('.user-name');
        userElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });

        // Update avatar elements
        const avatarElements = document.querySelectorAll('.user-avatar');
        avatarElements.forEach(el => {
            el.textContent = this.currentUser.avatar;
        });
    }

    updateNavbarUI() {
        const navLoginBtn = document.getElementById('navLoginBtn');
        if (navLoginBtn) {
            if (this.isLoggedIn) {
                navLoginBtn.innerHTML = `
                    <span class="user-avatar">${this.currentUser.avatar}</span>
                    <span class="user-name">${this.currentUser.name}</span>
                `;
                navLoginBtn.className = 'nav-user-btn';
            } else {
                navLoginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
                navLoginBtn.className = 'nav-login-btn';
            }
        }
    }

    logout() {
        // Clear stored data
        localStorage.removeItem('saathiTVUser');
        sessionStorage.removeItem('saathiTVSession');
        
        // Reset state
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Update UI
        this.updateNavbarUI();
        
        // Show notification
        this.showNotification('👋 Logged out successfully');
        
        // Redirect to home
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        
        console.log('👋 User logged out');
    }

    // Utility methods
    generateUserId() {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateAvatar(email) {
        const avatars = ['👤', '👨', '👩', '🧑', '👱', '👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🎓', '👩‍🎓'];
        const index = email ? email.charCodeAt(0) % avatars.length : 0;
        return avatars[index];
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'login-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'login-notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Public methods
    onLogin(callback) {
        this.loginCallbacks.push(callback);
    }

    requireLogin(callback) {
        if (this.isLoggedIn) {
            callback(this.currentUser);
        } else {
            this.showLoginPage();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }
}

// Enhanced styles for login system
const loginSystemStyles = document.createElement('style');
loginSystemStyles.textContent = `
    .nav-login-btn, .nav-user-btn {
        background: linear-gradient(45deg, #FF6B35, #F7931E);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
    }

    .nav-login-btn:hover, .nav-user-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    }

    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 10px;
        display: none;
        z-index: 1000;
    }

    .nav-user-btn:hover .user-dropdown {
        display: block;
    }

    .user-dropdown button {
        background: #f44336;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        width: 100%;
    }

    .login-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    }

    .login-notification.error {
        background: rgba(244, 67, 54, 0.9);
    }

    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }

    .notification-content button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        width: 90%;
        position: relative;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .modal-header h2 {
        margin: 0;
        color: #333;
    }

    .close {
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }

    .close:hover {
        color: #333;
    }

    .reset-btn {
        width: 100%;
        background: linear-gradient(45deg, #FF6B35, #F7931E);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 15px;
    }
`;

document.head.appendChild(loginSystemStyles);

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
    console.log('🔐 Login System loaded');
});

// Export for global use
window.LoginSystem = LoginSystem;
