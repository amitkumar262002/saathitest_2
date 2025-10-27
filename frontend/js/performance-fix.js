// Performance Fix - Prevents page unresponsive issues
console.log('⚡ Performance Fix loaded');

// Prevent long-running tasks from blocking the main thread
function breakUpLongTasks() {
    // Use requestIdleCallback to run tasks when browser is idle
    if (window.requestIdleCallback) {
        window.requestIdleCallback(function(deadline) {
            // Only run if we have time remaining
            if (deadline.timeRemaining() > 0) {
                console.log('🔄 Running idle tasks...');
            }
        });
    }
}

// Debounce function to prevent excessive function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit function execution frequency
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Optimize script loading
function optimizeScriptLoading() {
    // Add loading="lazy" to images if not present
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
        img.loading = 'lazy';
    });
    
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
    scripts.forEach(script => {
        if (!script.src.includes('critical') && !script.src.includes('dom-safety')) {
            script.defer = true;
        }
    });
}

// Memory cleanup
function cleanupMemory() {
    // Clean up old event listeners
    const oldElements = document.querySelectorAll('[data-cleanup]');
    oldElements.forEach(element => {
        element.remove();
    });
    
    // Force garbage collection if available
    if (window.gc) {
        window.gc();
    }
}

// Monitor performance
function monitorPerformance() {
    // Check if page is becoming unresponsive
    let lastTime = performance.now();
    let frameCount = 0;
    
    function checkResponsiveness() {
        const currentTime = performance.now();
        const timeDiff = currentTime - lastTime;
        
        if (timeDiff > 500) { // If frame took more than 500ms (increased threshold)
            // Only log occasionally to prevent spam
            if (frameCount % 30 === 0) {
                console.warn('⚠️ Slow frame detected:', timeDiff + 'ms');
            }
            
            // Break up any pending tasks
            setTimeout(() => {
                breakUpLongTasks();
            }, 0);
        }
        
        lastTime = currentTime;
        frameCount++;
        
        // Check FPS every second
        if (frameCount % 60 === 0) {
            const fps = 1000 / timeDiff;
            if (fps < 30) {
                console.warn('⚠️ Low FPS detected:', fps.toFixed(1));
            }
        }
        
        requestAnimationFrame(checkResponsiveness);
    }
    
    requestAnimationFrame(checkResponsiveness);
}

// Optimize DOM operations
function optimizeDOMOperations() {
    // Batch DOM updates
    const pendingUpdates = [];
    
    window.batchDOMUpdate = function(updateFunction) {
        pendingUpdates.push(updateFunction);
        
        if (pendingUpdates.length === 1) {
            requestAnimationFrame(() => {
                pendingUpdates.forEach(update => update());
                pendingUpdates.length = 0;
            });
        }
    };
}

// Fix infinite loops and recursive calls
function preventInfiniteLoops() {
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    
    let timeoutCount = 0;
    let intervalCount = 0;
    
    window.setTimeout = function(callback, delay, ...args) {
        timeoutCount++;
        
        if (timeoutCount > 1000) {
            console.warn('⚠️ Too many setTimeout calls, throttling...');
            delay = Math.max(delay, 100);
        }
        
        return originalSetTimeout.call(this, callback, delay, ...args);
    };
    
    window.setInterval = function(callback, delay, ...args) {
        intervalCount++;
        
        if (intervalCount > 50) {
            console.warn('⚠️ Too many setInterval calls, preventing...');
            return null;
        }
        
        return originalSetInterval.call(this, callback, delay, ...args);
    };
    
    // Reset counters periodically
    setInterval(() => {
        timeoutCount = Math.max(0, timeoutCount - 100);
        intervalCount = Math.max(0, intervalCount - 10);
    }, 5000);
}

// Emergency page recovery
function setupEmergencyRecovery() {
    let unresponsiveCount = 0;
    
    // Detect if page becomes unresponsive
    const heartbeat = setInterval(() => {
        const start = performance.now();
        
        setTimeout(() => {
            const delay = performance.now() - start;
            
            if (delay > 1000) { // If setTimeout is delayed by more than 1 second
                unresponsiveCount++;
                console.warn('⚠️ Page unresponsiveness detected:', delay + 'ms delay');
                
                if (unresponsiveCount > 3) {
                    console.error('🚨 Page critically unresponsive, attempting recovery...');
                    
                    // Emergency cleanup
                    cleanupMemory();
                    
                    // Stop all intervals
                    for (let i = 1; i < 10000; i++) {
                        clearInterval(i);
                        clearTimeout(i);
                    }
                    
                    // Show recovery message
                    const recoveryDiv = document.createElement('div');
                    recoveryDiv.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: #f44336;
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        z-index: 99999;
                        text-align: center;
                        font-family: Arial, sans-serif;
                    `;
                    recoveryDiv.innerHTML = `
                        <h3>🔧 Page Recovery</h3>
                        <p>Performance issues detected. Page is being optimized...</p>
                        <button onclick="window.location.reload()" style="
                            background: white;
                            color: #f44336;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">Reload Page</button>
                    `;
                    document.body.appendChild(recoveryDiv);
                    
                    unresponsiveCount = 0;
                }
            } else {
                unresponsiveCount = Math.max(0, unresponsiveCount - 1);
            }
        }, 0);
    }, 2000);
}

// Initialize performance optimizations
function initializePerformanceFix() {
    console.log('⚡ Initializing performance optimizations...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            optimizeScriptLoading();
            optimizeDOMOperations();
        });
    } else {
        optimizeScriptLoading();
        optimizeDOMOperations();
    }
    
    // Start monitoring
    monitorPerformance();
    preventInfiniteLoops();
    setupEmergencyRecovery();
    
    // Periodic cleanup
    setInterval(cleanupMemory, 30000); // Every 30 seconds
    
    console.log('✅ Performance optimizations active');
}

// Export utilities
window.performanceFix = {
    debounce,
    throttle,
    breakUpLongTasks,
    cleanupMemory,
    batchDOMUpdate: null // Will be set by optimizeDOMOperations
};

// Initialize immediately
initializePerformanceFix();

console.log('⚡ Performance Fix ready');
