// DOM Safety Fix - Prevents querySelector null errors
console.log('🔧 DOM Safety Fix loaded');

// Store original methods before overriding
const originalQuerySelector = Document.prototype.querySelector;
const originalQuerySelectorAll = Document.prototype.querySelectorAll;
const originalGetElementById = Document.prototype.getElementById;

// Safe DOM query functions with error handling
function safeQuerySelector(selector) {
    try {
        return originalQuerySelector.call(document, selector);
    } catch (error) {
        console.warn(`⚠️ querySelector error for selector: ${selector}`, error.message);
        return null;
    }
}

// Safe querySelectorAll wrapper
function safeQuerySelectorAll(selector, context = document) {
    try {
        if (!context || typeof originalQuerySelectorAll !== 'function') {
            console.warn('⚠️ Invalid context for querySelectorAll:', selector);
            return [];
        }
        return originalQuerySelectorAll.call(context, selector);
    } catch (error) {
        console.warn('⚠️ querySelectorAll error for selector:', selector, error);
        return [];
    }
}

// Safe getElementById wrapper
function safeGetElementById(id) {
    try {
        if (!document || typeof originalGetElementById !== 'function') {
            console.warn('⚠️ Document not ready for getElementById:', id);
            return null;
        }
        return originalGetElementById.call(document, id);
    } catch (error) {
        console.warn('⚠️ getElementById error for id:', id, error);
        return null;
    }
}

// Wait for DOM to be ready
function waitForDOM(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Wait for element to exist
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = safeQuerySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = safeQuerySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Safe event listener wrapper
function safeAddEventListener(element, event, handler) {
    if (!element || typeof element.addEventListener !== 'function') {
        console.warn('⚠️ Invalid element for addEventListener:', element);
        return false;
    }
    
    try {
        element.addEventListener(event, handler);
        return true;
    } catch (error) {
        console.warn('⚠️ addEventListener error:', error);
        return false;
    }
}

// Override global querySelector methods with safe versions
Document.prototype.querySelector = function(selector) {
    return safeQuerySelector(selector);
};

Document.prototype.querySelectorAll = function(selector) {
    return safeQuerySelectorAll(selector, this);
};

Document.prototype.getElementById = function(id) {
    return safeGetElementById(id);
};

// Also override for Element prototype
if (Element.prototype.querySelector) {
    const originalElementQuerySelector = Element.prototype.querySelector;
    Element.prototype.querySelector = function(selector) {
        try {
            // Skip invalid selectors
            if (!selector || selector === '#' || selector === '.' || selector.trim() === '') {
                return null;
            }
            return originalElementQuerySelector.call(this, selector);
        } catch (error) {
            // Only log if it's not a common invalid selector
            if (!selector.includes('#') || selector.length > 1) {
                console.warn(`⚠️ Element querySelector error: ${selector}`, error.message);
            }
            return null;
        }
    };
}

if (Element.prototype.querySelectorAll) {
    const originalElementQuerySelectorAll = Element.prototype.querySelectorAll;
    Element.prototype.querySelectorAll = function(selector) {
        try {
            // Skip invalid selectors
            if (!selector || selector === '#' || selector === '.' || selector.trim() === '') {
                return [];
            }
            return originalElementQuerySelectorAll.call(this, selector);
        } catch (error) {
            // Only log if it's not a common invalid selector or "Illegal invocation"
            if (!error.message.includes('Illegal invocation') && selector && selector.length > 1) {
                console.warn(`⚠️ Element querySelectorAll error: ${selector}`, error.message);
            }
            return [];
        }
    };
}

// Safe error message check
function safeErrorCheck(error, searchTerm) {
    if (!error) return false;
    
    try {
        const message = error.message || error.toString() || '';
        return typeof message === 'string' && message.includes(searchTerm);
    } catch (e) {
        return false;
    }
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    
    // Prevent the default behavior (console error)
    event.preventDefault();
    
    // Show user-friendly message for DOM-related errors
    if (safeErrorCheck(event.reason, 'querySelector')) {
        console.log('🔧 DOM query error handled gracefully');
    }
});

// Global error handler for regular errors
window.addEventListener('error', function(event) {
    console.error('🚨 Global Error:', event.error);
    
    // Handle querySelector errors specifically
    if (safeErrorCheck(event.error, 'querySelector')) {
        console.log('🔧 DOM query error handled gracefully');
        return true; // Prevent default error handling
    }
});

// Export utilities for global use
window.domSafety = {
    safeQuerySelector,
    safeQuerySelectorAll,
    safeGetElementById,
    waitForDOM,
    waitForElement,
    safeAddEventListener
};

// Initialize DOM safety when document is ready
waitForDOM(() => {
    console.log('✅ DOM Safety Fix initialized');
    
    // Check for common problematic elements and warn if missing
    const criticalElements = [
        '#videoChat',
        '.hero',
        '.navbar',
        '.video-controls'
    ];
    
    criticalElements.forEach(selector => {
        const element = safeQuerySelector(selector);
        if (!element) {
            console.warn(`⚠️ Critical element missing: ${selector}`);
        }
    });
});

console.log('🛡️ DOM Safety Fix ready');
