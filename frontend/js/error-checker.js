// Comprehensive Error Checker and Fixer for Saathi TV

class ErrorChecker {
    constructor() {
        this.errors = [];
        this.fixes = [];
        this.isRunning = false;
        
        this.init();
    }

    init() {
        this.setupErrorHandling();
        this.startPeriodicCheck();
        this.checkOnLoad();
        console.log('🔍 Error Checker initialized');
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            this.logError('JavaScript Error', e.error || e.message, e.filename, e.lineno);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            this.logError('Unhandled Promise Rejection', e.reason);
        });

        // Store original console methods
        this.originalError = console.error;
        
        // Console error override
        console.error = (...args) => {
            this.logError('Console Error', args.join(' '));
            this.originalError.apply(console, args);
        };
    }

    checkOnLoad() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runFullCheck());
        } else {
            this.runFullCheck();
        }
    }

    startPeriodicCheck() {
        // Check every 30 seconds
        setInterval(() => {
            if (!this.isRunning) {
                this.runQuickCheck();
            }
        }, 30000);
    }

    async runFullCheck() {
        this.isRunning = true;
        console.log('🔍 Running full system check...');

        // Clear previous results
        this.errors = [];
        this.fixes = [];

        // Run all checks
        await this.checkDOMElements();
        await this.checkEventListeners();
        await this.checkNetworkConnections();
        await this.checkMediaDevices();
        await this.checkLocalStorage();
        await this.checkScriptLoading();
        await this.checkCSS();

        // Apply fixes
        await this.applyFixes();

        // Report results
        this.reportResults();
        
        this.isRunning = false;
    }

    async runQuickCheck() {
        // Quick check for common issues
        this.checkCriticalElements();
        this.checkActiveConnections();
    }

    async checkDOMElements() {
        const criticalElements = [
            'toggleAudio',
            'toggleVideo',
            'messageInput',
            'sendMessage',
            'countrySelect',
            'genderSelect',
            'localVideo',
            'remoteVideo'
        ];

        criticalElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                this.addError(`Missing critical element: ${id}`);
                this.addFix(() => this.createMissingElement(id));
            } else if (!this.isElementVisible(element) && this.shouldBeVisible(id)) {
                this.addError(`Element not visible: ${id}`);
                this.addFix(() => this.fixElementVisibility(id));
            }
        });
    }

    async checkEventListeners() {
        const buttonTests = [
            { id: 'toggleAudio', event: 'click' },
            { id: 'toggleVideo', event: 'click' },
            { id: 'sendMessage', event: 'click' }
        ];

        buttonTests.forEach(test => {
            const element = document.getElementById(test.id);
            if (element && !this.hasEventListener(element, test.event)) {
                this.addError(`Missing event listener: ${test.id} (${test.event})`);
                this.addFix(() => this.fixEventListener(test.id, test.event));
            }
        });
    }

    async checkNetworkConnections() {
        // Check if backend is accessible
        try {
            const response = await fetch('/api/health', { 
                method: 'GET',
                timeout: 5000 
            });
            if (!response.ok) {
                this.addError('Backend server not responding');
                this.addFix(() => this.showServerError());
            }
        } catch (error) {
            this.addError(`Network connection failed: ${error.message}`);
            this.addFix(() => this.showConnectionError());
        }

        // Check Socket.io connection
        if (window.saathiTV && window.saathiTV.socket) {
            if (!window.saathiTV.socket.connected) {
                this.addError('Socket.io not connected');
                this.addFix(() => this.fixSocketConnection());
            }
        }
    }

    async checkMediaDevices() {
        if (!navigator.mediaDevices) {
            this.addError('MediaDevices API not available');
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(device => device.kind === 'videoinput');
            const hasMicrophone = devices.some(device => device.kind === 'audioinput');

            if (!hasCamera) {
                this.addError('No camera detected');
                this.addFix(() => this.showCameraError());
            }

            if (!hasMicrophone) {
                this.addError('No microphone detected');
                this.addFix(() => this.showMicrophoneError());
            }
        } catch (error) {
            this.addError(`Media device check failed: ${error.message}`);
        }
    }

    async checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (error) {
            this.addError('LocalStorage not available');
            this.addFix(() => this.showStorageError());
        }
    }

    async checkScriptLoading() {
        const requiredScripts = [
            'chatSystemFix',
            'audioVideoControls',
            'realTimeManager',
            'enhancedInteractions',
            'securityManager'
        ];

        requiredScripts.forEach(script => {
            if (!window[script]) {
                this.addError(`Script not loaded: ${script}`);
                // Script reloading disabled - manual refresh required
            }
        });
    }

    async checkCSS() {
        // Check if critical CSS classes exist
        const criticalClasses = [
            'chat-section',
            'control-btn',
            'custom-select-container',
            'send-btn'
        ];

        criticalClasses.forEach(className => {
            const elements = document.getElementsByClassName(className);
            if (elements.length === 0) {
                this.addError(`CSS class not found or not applied: ${className}`);
            }
        });
    }

    checkCriticalElements() {
        const critical = ['toggleAudio', 'messageInput'];
        critical.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                this.createMissingElement(id);
            }
        });
    }

    checkActiveConnections() {
        if (window.saathiTV && window.saathiTV.socket && !window.saathiTV.socket.connected) {
            this.fixSocketConnection();
        }
    }

    // Fix methods
    createMissingElement(id) {
        console.log(`🔧 Creating missing element: ${id}`);
        
        const templates = {
            'toggleAudio': () => {
                const btn = document.createElement('button');
                btn.id = 'toggleAudio';
                btn.className = 'control-btn audio-btn active';
                btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2z"/></svg>';
                return btn;
            },
            'messageInput': () => {
                const input = document.createElement('input');
                input.id = 'messageInput';
                input.type = 'text';
                input.placeholder = 'Type a message...';
                input.maxLength = 200;
                return input;
            }
        };

        if (templates[id]) {
            const element = templates[id]();
            const container = this.findBestContainer(id);
            if (container) {
                container.appendChild(element);
                this.addFix(() => this.fixEventListener(id, 'click'));
            }
        }
    }

    fixElementVisibility(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        }
    }

    fixEventListener(id, event) {
        const element = document.getElementById(id);
        if (!element) return;

        const handlers = {
            'toggleAudio': () => {
                if (window.chatSystemFix) {
                    window.chatSystemFix.handleAudioToggle();
                }
            },
            'toggleVideo': () => {
                if (window.chatSystemFix) {
                    window.chatSystemFix.handleVideoToggle();
                }
            },
            'sendMessage': () => {
                if (window.chatSystemFix) {
                    window.chatSystemFix.sendMessage();
                }
            }
        };

        if (handlers[id]) {
            element.addEventListener(event, handlers[id]);
            console.log(`🔧 Fixed event listener: ${id} (${event})`);
        }
    }

    fixSocketConnection() {
        if (window.saathiTV && window.saathiTV.socket) {
            window.saathiTV.socket.connect();
        }
    }

    showServerError() {
        this.showError('Backend server is not running. Please start the server.', 'error');
    }

    showConnectionError() {
        this.showError('Network connection failed. Check your internet connection.', 'warning');
    }

    showCameraError() {
        this.showError('No camera detected. Video chat may not work properly.', 'warning');
    }

    showMicrophoneError() {
        this.showError('No microphone detected. Audio chat may not work properly.', 'warning');
    }

    showStorageError() {
        this.showError('Browser storage is disabled. Some features may not work.', 'warning');
    }

    // Utility methods
    addError(message) {
        this.errors.push({
            message,
            timestamp: Date.now()
        });
    }

    addFix(fixFunction) {
        this.fixes.push(fixFunction);
    }

    async applyFixes() {
        console.log(`🔧 Applying ${this.fixes.length} fixes...`);
        
        for (const fix of this.fixes) {
            try {
                await fix();
            } catch (error) {
                console.error('Fix failed:', error);
            }
        }
    }

    reportResults() {
        if (this.errors.length === 0) {
            console.log('✅ No errors found - system is healthy!');
            return;
        }

        console.log(`⚠️ Found ${this.errors.length} issues:`);
        this.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.message}`);
        });

        console.log(`🔧 Applied ${this.fixes.length} fixes`);

        // Show user notification if there are critical errors
        const criticalErrors = this.errors.filter(error => {
            const message = error.message || error.toString() || '';
            return typeof message === 'string' && (
                message.includes('Missing critical element') ||
                message.includes('Backend server not responding')
            );
        });

        if (criticalErrors.length > 0) {
            this.showError(`Found ${criticalErrors.length} critical issues. Check console for details.`, 'error');
        }
    }

    logError(type, message, filename = '', lineno = '') {
        const error = {
            type,
            message,
            filename,
            lineno,
            timestamp: Date.now()
        };
        
        // Use original console.error to avoid infinite loop
        if (this.originalError) {
            this.originalError(`[${type}] ${message}`, filename ? `at ${filename}:${lineno}` : '');
        }
        this.errors.push(error);
    }

    showError(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }

    shouldBeVisible(id) {
        const alwaysVisible = ['countrySelect', 'genderSelect'];
        return alwaysVisible.includes(id);
    }

    hasEventListener(element, event) {
        // This is a simplified check - in reality, we can't easily detect all event listeners
        return element[`on${event}`] !== null || 
               element.getAttribute(`on${event}`) !== null;
    }

    findBestContainer(elementId) {
        const containers = {
            'toggleAudio': '.video-controls',
            'messageInput': '.message-input-container'
        };

        const containerSelector = containers[elementId];
        return containerSelector ? document.querySelector(containerSelector) : document.body;
    }

    // Script reloading functionality removed to prevent unwanted reloads

    // Public methods
    runManualCheck() {
        this.runFullCheck();
    }

    getErrorReport() {
        return {
            errors: this.errors,
            totalErrors: this.errors.length,
            lastCheck: Date.now()
        };
    }
}

// Initialize error checker
document.addEventListener('DOMContentLoaded', () => {
    window.errorChecker = new ErrorChecker();
});

// Export for global use
window.ErrorChecker = ErrorChecker;
