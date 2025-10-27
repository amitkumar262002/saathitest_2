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
        // Check Firebase auth first
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            const firebaseUser = window.firebaseAuth.currentUser;
            this.currentUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                loginMethod: 'firebase',
                avatar: this.generateAvatar(firebaseUser.email),
                loginTime: new Date().toISOString()
            };
            this.isLoggedIn = true;
            this.updateUIForLoggedInUser();
            console.log('👤 Firebase user logged in:', this.currentUser.name);
            return;
        }
        
        // Check localStorage/sessionStorage
        const savedUser = localStorage.getItem('saathi_current_user') || localStorage.getItem('saathiTVUser');
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
        } else {
            console.log('❌ No user logged in');
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
        // Find existing login button or create one
        let navLoginBtn = document.getElementById('navLoginBtn');
        
        if (!navLoginBtn) {
            // Create login button in navbar if it doesn't exist
            const navbar = document.querySelector('.navbar, .header, nav');
            if (navbar) {
                navLoginBtn = document.createElement('button');
                navLoginBtn.id = 'navLoginBtn';
                navLoginBtn.className = 'nav-login-btn';
                navLoginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
                navbar.appendChild(navLoginBtn);
            }
        }
        
        // Set up click handler
        if (navLoginBtn) {
            navLoginBtn.onclick = () => this.handleNavLoginClick();
        }

        // Update existing login buttons
        this.updateNavbarUI();
    }
    
    handleNavLoginClick() {
        if (this.isLoggedIn) {
            // Show user menu or logout
            this.showUserMenu();
        } else {
            // Show login modal or redirect to login
            this.showLoginModal();
        }
    }
    
    showLoginModal() {
        // Create and show login modal
        if (!document.getElementById('loginModal')) {
            this.createLoginModal();
        }
        
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Login to Saathi TV</h2>
                    <span class="close" onclick="document.getElementById('loginModal').style.display='none'">&times;</span>
                </div>
                <form id="loginForm" onsubmit="window.loginSystem.handleModalLogin(event)">
                    <div class="form-group">
                        <label for="modalEmail">Email:</label>
                        <input type="email" id="modalEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="modalPassword">Password:</label>
                        <div class="password-input-container">
                            <input type="password" id="modalPassword" name="password" required>
                            <button type="button" class="password-toggle" onclick="window.loginSystem.toggleModalPassword()">👁️</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="remember"> Remember me
                        </label>
                    </div>
                    <button type="submit" class="login-btn">
                        <span class="btn-text">Login</span>
                        <span class="btn-loader" style="display: none;">⏳</span>
                    </button>
                </form>
                <div class="social-login">
                    <p>Or login with:</p>
                    <button type="button" class="social-btn google-btn" onclick="window.loginSystem.socialLogin('google')">
                        <i class="fab fa-google"></i> Google
                    </button>
                    <button type="button" class="social-btn facebook-btn" onclick="window.loginSystem.socialLogin('facebook')">
                        <i class="fab fa-facebook"></i> Facebook
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    handleModalLogin(event) {
        event.preventDefault();
        this.processLogin(event.target);
    }
    
    toggleModalPassword() {
        const passwordInput = document.getElementById('modalPassword');
        const toggleBtn = document.querySelector('#loginModal .password-toggle');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }
    
    showUserMenu() {
        // Create user dropdown menu
        const existingMenu = document.getElementById('userDropdown');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const dropdown = document.createElement('div');
        dropdown.id = 'userDropdown';
        dropdown.className = 'user-dropdown-menu';
        dropdown.innerHTML = `
            <div class="user-info">
                <span class="user-avatar">${this.currentUser.avatar}</span>
                <span class="user-name">${this.currentUser.name}</span>
            </div>
            <button onclick="window.loginSystem.logout()" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
        
        const navBtn = document.getElementById('navLoginBtn');
        if (navBtn) {
            navBtn.parentElement.appendChild(dropdown);
            
            // Position dropdown
            dropdown.style.position = 'absolute';
            dropdown.style.top = '100%';
            dropdown.style.right = '0';
            dropdown.style.zIndex = '1000';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                if (dropdown.parentElement) {
                    dropdown.remove();
                }
            }, 3000);
        }
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

    async socialLogin(provider) {
        console.log(`🔐 Logging in with ${provider}...`);
        
        try {
            let result;
            
            if (window.firebaseAuthManager) {
                // Use Firebase for real authentication
                if (provider === 'google') {
                    result = await window.firebaseAuthManager.signInWithGoogle();
                } else {
                    // For other providers, simulate for now
                    result = { success: true, user: null };
                }
            }
            
            if (result && result.success && result.user) {
                // Firebase login successful
                this.currentUser = {
                    id: result.user.uid,
                    email: result.user.email,
                    name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
                    loginMethod: provider,
                    loginTime: new Date().toISOString(),
                    avatar: this.generateAvatar(result.user.email)
                };
                
                this.isLoggedIn = true;
                this.showNotification(`✅ Logged in with ${provider}! Welcome, ${this.currentUser.name}`);
            } else {
                // Fallback to simulation
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
            }
            
            setTimeout(() => {
                this.redirectToVideoChat();
            }, 1500);
            
        } catch (error) {
            console.error(`${provider} login error:`, error);
            this.showError(`❌ ${provider} login failed. Please try again.`);
        }
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
        // Close login modal if open
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
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

        // Handle port redirection
        const currentPort = window.location.port;
        const targetPort = '3001'; // Our main server port
        
        if (currentPort === '3000' && targetPort === '3001') {
            // Redirect to correct port
            const newUrl = window.location.href.replace(':3000', ':3001');
            window.location.href = newUrl;
            return;
        }

        // Redirect based on current page
        if (window.location.pathname.includes('login.html')) {
            // Check return URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const returnUrl = urlParams.get('return');
            
            if (returnUrl) {
                // Decode and redirect to return URL, but ensure correct port
                const decodedUrl = decodeURIComponent(returnUrl);
                const correctedUrl = decodedUrl.replace(':3000', ':3001');
                window.location.href = correctedUrl;
            } else {
                window.location.href = 'index.html#videoChat';
            }
        } else {
            // Start video chat directly
            if (window.unifiedWebRTC && typeof window.unifiedWebRTC.startVideoChat === 'function') {
                window.unifiedWebRTC.startVideoChat();
            } else if (typeof handleStartWebChat === 'function') {
                handleStartWebChat();
            } else if (window.webRTCFix) {
                window.webRTCFix.startChat();
            } else {
                // Show video chat section
                const videoSection = document.getElementById('videoChat');
                const heroSection = document.querySelector('#home, .hero');
                
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

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #333;
        font-weight: 500;
    }

    .form-group input[type="email"],
    .form-group input[type="password"] {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.3s ease;
    }

    .form-group input[type="email"]:focus,
    .form-group input[type="password"]:focus {
        outline: none;
        border-color: #FF6B35;
    }

    .password-input-container {
        position: relative;
    }

    .password-toggle {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
    }

    .social-login {
        margin-top: 20px;
        text-align: center;
    }

    .social-login p {
        margin-bottom: 15px;
        color: #666;
    }

    .social-btn {
        width: 100%;
        padding: 12px;
        margin-bottom: 10px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.3s ease;
    }

    .google-btn {
        background: #db4437;
        color: white;
    }

    .google-btn:hover {
        background: #c23321;
    }

    .facebook-btn {
        background: #3b5998;
        color: white;
    }

    .facebook-btn:hover {
        background: #2d4373;
    }

    .user-dropdown-menu {
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 15px;
        min-width: 200px;
        border: 1px solid #eee;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .user-avatar {
        font-size: 20px;
    }

    .user-name {
        font-weight: 600;
        color: #333;
    }

    .logout-btn {
        width: 100%;
        background: #f44336;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background 0.3s ease;
    }

    .logout-btn:hover {
        background: #d32f2f;
    }
`;

document.head.appendChild(loginSystemStyles);

// Global function to handle video chat start
window.handleStartWebChat = function() {
    console.log('🎥 Starting video chat...');
    
    // Check if user is logged in
    if (window.loginSystem && !window.loginSystem.isUserLoggedIn()) {
        console.log('🔐 User not logged in, showing login modal');
        window.loginSystem.showLoginModal();
        return;
    }
    
    // Show video chat section
    const videoSection = document.getElementById('videoChat');
    const heroSection = document.querySelector('#home, .hero');
    
    if (videoSection && heroSection) {
        heroSection.style.display = 'none';
        videoSection.style.display = 'flex';
        
        // Initialize video chat if needed
        if (window.webRTCFix && window.webRTCFix.startChat) {
            window.webRTCFix.startChat();
        }
        
        console.log('🎥 Video chat section shown');
    } else {
        console.error('❌ Video chat elements not found');
    }
};

// Global function for secure login redirect
window.redirectToSecureLogin = function() {
    if (window.loginSystem) {
        window.loginSystem.showLoginModal();
    } else {
        console.error('❌ Login system not initialized');
    }
};

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
    console.log('🔐 Login System loaded');
});

// Export for global use
window.LoginSystem = LoginSystem;
