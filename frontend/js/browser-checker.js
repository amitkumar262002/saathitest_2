// Comprehensive Web Browser Checker - Element & Console Inspector

class BrowserChecker {
    constructor() {
        this.browserInfo = {};
        this.elementData = [];
        this.consoleData = [];
        this.performanceData = {};
        this.isRunning = false;
        
        this.init();
    }

    init() {
        this.detectBrowser();
        this.setupConsoleCapture();
        this.startElementMonitoring();
        this.checkPerformance();
        this.sendInitialData();
        
        console.log('🔍 Browser Checker initialized');
        console.log('📊 Browser Info:', this.browserInfo);
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const vendor = navigator.vendor;

        // Browser detection
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';

        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browserName = 'Chrome';
            browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
            browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserName = 'Safari';
            browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Edg')) {
            browserName = 'Edge';
            browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
            browserName = 'Opera';
            browserVersion = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || 'Unknown';
        }

        // OS detection
        let osName = 'Unknown';
        if (platform.includes('Win')) osName = 'Windows';
        else if (platform.includes('Mac')) osName = 'macOS';
        else if (platform.includes('Linux')) osName = 'Linux';
        else if (userAgent.includes('Android')) osName = 'Android';
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) osName = 'iOS';

        this.browserInfo = {
            browser: browserName,
            version: browserVersion,
            os: osName,
            platform: platform,
            userAgent: userAgent,
            vendor: vendor,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        };
    }

    setupConsoleCapture() {
        // Capture console logs
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            this.captureConsole('log', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.captureConsole('error', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.captureConsole('warn', args);
            originalWarn.apply(console, args);
        };

        console.info = (...args) => {
            this.captureConsole('info', args);
            originalInfo.apply(console, args);
        };

        // Capture unhandled errors
        window.addEventListener('error', (e) => {
            this.captureConsole('error', [`Unhandled Error: ${e.message}`, `File: ${e.filename}:${e.lineno}:${e.colno}`]);
        });

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.captureConsole('error', [`Unhandled Promise Rejection: ${e.reason}`]);
        });
    }

    captureConsole(type, args) {
        const consoleEntry = {
            type: type,
            message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            timestamp: new Date().toISOString(),
            stack: new Error().stack
        };

        this.consoleData.push(consoleEntry);

        // Keep only last 100 console entries
        if (this.consoleData.length > 100) {
            this.consoleData = this.consoleData.slice(-100);
        }

        // Send to server if available
        this.sendConsoleData(consoleEntry);
    }

    startElementMonitoring() {
        // Monitor DOM changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.captureElement(node, 'added');
                        }
                    });
                    
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.captureElement(node, 'removed');
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true
        });

        // Initial element scan
        this.scanAllElements();
    }

    scanAllElements() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            this.captureElement(element, 'initial');
        });
    }

    captureElement(element, action = 'scanned') {
        try {
            const elementInfo = {
                action: action,
                tagName: element.tagName,
                id: element.id || null,
                className: element.className || null,
                attributes: this.getElementAttributes(element),
                position: this.getElementPosition(element),
                styles: this.getComputedStyles(element),
                content: this.getElementContent(element),
                parent: element.parentElement?.tagName || null,
                children: element.children.length,
                timestamp: new Date().toISOString()
            };

            this.elementData.push(elementInfo);

            // Keep only last 500 elements
            if (this.elementData.length > 500) {
                this.elementData = this.elementData.slice(-500);
            }

            // Send critical elements immediately
            if (this.isCriticalElement(element)) {
                this.sendElementData(elementInfo);
            }
        } catch (error) {
            console.warn('Error capturing element:', error);
        }
    }

    getElementAttributes(element) {
        const attributes = {};
        for (let attr of element.attributes) {
            attributes[attr.name] = attr.value;
        }
        return attributes;
    }

    getElementPosition(element) {
        try {
            const rect = element.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom
            };
        } catch (error) {
            return null;
        }
    }

    getComputedStyles(element) {
        try {
            const styles = window.getComputedStyle(element);
            return {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                position: styles.position,
                zIndex: styles.zIndex,
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                fontSize: styles.fontSize,
                fontFamily: styles.fontFamily
            };
        } catch (error) {
            return null;
        }
    }

    getElementContent(element) {
        try {
            return {
                textContent: element.textContent?.substring(0, 200) || null,
                innerHTML: element.innerHTML?.substring(0, 500) || null,
                value: element.value || null,
                src: element.src || null,
                href: element.href || null
            };
        } catch (error) {
            return null;
        }
    }

    isCriticalElement(element) {
        const criticalTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A', 'FORM'];
        const criticalIds = ['toggleAudio', 'toggleVideo', 'messageInput'];
        const criticalClasses = ['control-btn', 'send-btn', 'start-btn'];

        return criticalTags.includes(element.tagName) ||
               criticalIds.includes(element.id) ||
               criticalClasses.some(cls => element.classList?.contains(cls));
    }

    checkPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            this.performanceData = {
                navigation: {
                    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
                    loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
                    domInteractive: navigation?.domInteractive,
                    domComplete: navigation?.domComplete
                },
                paint: {
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
                },
                memory: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                } : null,
                timestamp: new Date().toISOString()
            };
        }
    }

    sendInitialData() {
        const initialData = {
            type: 'browser-check-init',
            browserInfo: this.browserInfo,
            performanceData: this.performanceData,
            elementCount: document.querySelectorAll('*').length,
            timestamp: new Date().toISOString()
        };

        this.sendToServer(initialData);
        this.sendToConsole('🚀 Browser Check Initialized', initialData);
    }

    sendElementData(elementInfo) {
        const data = {
            type: 'element-data',
            element: elementInfo,
            timestamp: new Date().toISOString()
        };

        this.sendToServer(data);
        this.sendToConsole('📋 Element Captured', elementInfo);
    }

    sendConsoleData(consoleEntry) {
        const data = {
            type: 'console-data',
            console: consoleEntry,
            timestamp: new Date().toISOString()
        };

        this.sendToServer(data);
    }

    sendToServer(data) {
        // Send to backend if available
        if (window.saathiTV && window.saathiTV.socket) {
            window.saathiTV.socket.emit('browser-check', data);
        }

        // Also try direct HTTP request
        fetch('/api/browser-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch(() => {
            // Silently fail if server not available
        });
    }

    sendToConsole(title, data) {
        console.group(`🔍 ${title}`);
        console.log('Data:', data);
        console.log('Timestamp:', new Date().toLocaleString());
        console.groupEnd();
    }

    // Public methods for manual checking
    checkElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            this.captureElement(element, 'manual-check');
            return this.elementData[this.elementData.length - 1];
        }
        return null;
    }

    getFullReport() {
        return {
            browserInfo: this.browserInfo,
            elementData: this.elementData,
            consoleData: this.consoleData,
            performanceData: this.performanceData,
            timestamp: new Date().toISOString()
        };
    }

    exportReport() {
        const report = this.getFullReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `browser-check-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📄 Browser check report exported');
    }

    // Real-time monitoring controls
    startRealTimeMonitoring() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.monitoringInterval = setInterval(() => {
            this.checkPerformance();
            this.sendPerformanceUpdate();
        }, 5000);
        
        console.log('▶️ Real-time monitoring started');
    }

    stopRealTimeMonitoring() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        console.log('⏹️ Real-time monitoring stopped');
    }

    sendPerformanceUpdate() {
        const data = {
            type: 'performance-update',
            performance: this.performanceData,
            elementCount: document.querySelectorAll('*').length,
            consoleCount: this.consoleData.length,
            timestamp: new Date().toISOString()
        };

        this.sendToServer(data);
    }
}

// Initialize browser checker
document.addEventListener('DOMContentLoaded', () => {
    window.browserChecker = new BrowserChecker();
    
    // Add global methods for easy access
    window.checkElement = (selector) => window.browserChecker.checkElement(selector);
    window.getBrowserReport = () => window.browserChecker.getFullReport();
    window.exportBrowserReport = () => window.browserChecker.exportReport();
    window.startMonitoring = () => window.browserChecker.startRealTimeMonitoring();
    window.stopMonitoring = () => window.browserChecker.stopRealTimeMonitoring();
});

// Export for use in other files
window.BrowserChecker = BrowserChecker;
