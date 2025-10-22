// Security and Content Moderation System for Saathi TV

class SecurityManager {
    constructor() {
        this.isMonitoring = false;
        this.violationCount = 0;
        this.blockedUsers = new Set();
        this.contentAnalyzer = null;
        this.warningThreshold = 2;
        this.blockThreshold = 3;
        
        this.init();
    }

    init() {
        this.setupContentAnalyzer();
        this.setupVideoMonitoring();
        this.setupReportingSystem();
        console.log('🛡️ Security Manager initialized');
    }

    setupContentAnalyzer() {
        // Simulated AI content analysis (in real implementation, this would connect to AI service)
        this.contentAnalyzer = {
            analyzeFrame: (videoElement) => {
                return new Promise((resolve) => {
                    // Simulate AI analysis delay
                    setTimeout(() => {
                        // In real implementation, this would use actual AI/ML models
                        const analysis = {
                            inappropriate: Math.random() < 0.05, // 5% chance for demo
                            confidence: Math.random() * 100,
                            violations: []
                        };
                        resolve(analysis);
                    }, 100);
                });
            }
        };
    }

    setupVideoMonitoring() {
        // Monitor local video stream for inappropriate content
        setInterval(() => {
            if (this.isMonitoring) {
                this.analyzeCurrentFrame();
            }
        }, 2000); // Check every 2 seconds
    }

    async analyzeCurrentFrame() {
        const localVideo = document.getElementById('localVideo');
        if (!localVideo || !localVideo.srcObject) return;

        try {
            const analysis = await this.contentAnalyzer.analyzeFrame(localVideo);
            
            if (analysis.inappropriate && analysis.confidence > 70) {
                this.handleViolation('inappropriate_content', analysis);
            }
        } catch (error) {
            console.error('Content analysis error:', error);
        }
    }

    handleViolation(type, details = {}) {
        this.violationCount++;
        
        console.warn(`🚨 Security violation detected: ${type}`, details);
        
        if (this.violationCount >= this.blockThreshold) {
            this.blockUser('Multiple violations detected');
        } else if (this.violationCount >= this.warningThreshold) {
            this.showWarning('Inappropriate content detected. Please follow community guidelines.');
        }

        // Report to server
        this.reportViolation(type, details);
    }

    blockUser(reason) {
        console.log('🔒 Account blocking is currently disabled');
        console.log('⚠️ Would have blocked user for:', reason);
        
        // Show warning instead of blocking
        this.showWarning(`Warning: ${reason}. Please follow community guidelines.`);
        
        // Don't actually block - just log and warn
        return false;
    }

    stopAllStreams() {
        // Stop local video
        const localVideo = document.getElementById('localVideo');
        if (localVideo && localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
        }

        // Stop remote video
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo && remoteVideo.srcObject) {
            remoteVideo.srcObject = null;
        }
    }

    showWarning(message) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'security-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                    <h3>Content Warning</h3>
                    <p>${message}</p>
                    <p>Violation count: ${this.violationCount}/${this.blockThreshold}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="warning-close">×</button>
            </div>
        `;
        
        // Add warning styles
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #ff6b35, #f44336);
            color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(244, 67, 54, 0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideDown 0.5s ease-out;
        `;
        
        document.body.appendChild(warningDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(warningDiv)) {
                warningDiv.remove();
            }
        }, 10000);
    }

    showBlockingMessage(reason) {
        const blockingDiv = document.createElement('div');
        blockingDiv.className = 'blocking-message';
        blockingDiv.innerHTML = `
            <div class="blocking-content">
                <div class="blocking-icon">🚫</div>
                <h2>Account Blocked</h2>
                <p>Your access has been blocked due to: ${reason}</p>
                <p>If you believe this is an error, please contact support.</p>
                <div class="contact-info">
                    <p>📧 support@saathi-tv.com</p>
                    <p>📞 +1-800-SAATHI</p>
                </div>
            </div>
        `;
        
        blockingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
            text-align: center;
        `;
        
        document.body.appendChild(blockingDiv);
    }

    generateUserFingerprint() {
        // Generate a unique fingerprint for the user (simplified version)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Saathi TV Fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        return btoa(fingerprint).substring(0, 32);
    }

    reportViolation(type, details) {
        // Report violation to server
        if (window.saathiTV && window.saathiTV.socket) {
            window.saathiTV.socket.emit('security-violation', {
                type: type,
                details: details,
                timestamp: Date.now(),
                userFingerprint: this.generateUserFingerprint()
            });
        }
    }

    setupReportingSystem() {
        // Add report button to video chat interface
        const reportButton = document.createElement('button');
        reportButton.id = 'reportButton';
        reportButton.className = 'control-btn report-btn';
        reportButton.innerHTML = '🚨';
        reportButton.title = 'Report inappropriate behavior';
        reportButton.style.cssText = `
            background: #f44336;
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            display: none;
        `;
        
        reportButton.addEventListener('click', () => {
            this.showReportDialog();
        });
        
        document.body.appendChild(reportButton);
    }

    showReportDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'report-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Report Inappropriate Behavior</h3>
                <div class="report-options">
                    <label><input type="radio" name="report" value="nudity"> Nudity/Sexual content</label>
                    <label><input type="radio" name="report" value="harassment"> Harassment</label>
                    <label><input type="radio" name="report" value="hate"> Hate speech</label>
                    <label><input type="radio" name="report" value="spam"> Spam/Commercial</label>
                    <label><input type="radio" name="report" value="other"> Other</label>
                </div>
                <textarea placeholder="Additional details (optional)" id="reportDetails"></textarea>
                <div class="dialog-buttons">
                    <button onclick="securityManager.submitReport()" class="submit-btn">Submit Report</button>
                    <button onclick="this.closest('.report-dialog').remove()" class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 15000;
        `;
        
        document.body.appendChild(dialog);
    }

    submitReport() {
        const selectedReason = document.querySelector('input[name="report"]:checked');
        const details = document.getElementById('reportDetails').value;
        
        if (!selectedReason) {
            alert('Please select a reason for reporting');
            return;
        }
        
        // Submit report
        this.reportViolation('user_report', {
            reason: selectedReason.value,
            details: details,
            reportedAt: Date.now()
        });
        
        // Close dialog
        document.querySelector('.report-dialog').remove();
        
        // Show confirmation
        this.showNotification('Report submitted. Thank you for keeping Saathi TV safe.', 'success');
        
        // Disconnect from current user
        if (window.saathiTV) {
            window.saathiTV.nextUser();
        }
    }

    showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    startMonitoring() {
        this.isMonitoring = true;
        
        // Show report button when in video chat
        const reportBtn = document.getElementById('reportButton');
        if (reportBtn) {
            reportBtn.style.display = 'block';
        }
        
        console.log('🔍 Content monitoring started');
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        // Hide report button
        const reportBtn = document.getElementById('reportButton');
        if (reportBtn) {
            reportBtn.style.display = 'none';
        }
        
        console.log('⏹️ Content monitoring stopped');
    }

    checkIfBlocked() {
        // Account blocking is disabled
        console.log('🔒 Account blocking check disabled - allowing access');
        
        // Clear any existing blocked status
        localStorage.removeItem('blocked');
        
        return false;
    }
}

// Initialize security manager
const securityManager = new SecurityManager();

// Export for global use
window.securityManager = securityManager;

// Clear any existing blocked status on page load
document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('blocked');
    localStorage.removeItem('blockExpiration');
    console.log('🔓 Cleared any existing account blocks - blocking is disabled');
});

// Add CSS for security elements
const securityStyles = document.createElement('style');
securityStyles.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); }
        to { transform: translateX(-50%) translateY(0); }
    }
    
    .warning-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .warning-icon {
        font-size: 2rem;
    }
    
    .warning-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: auto;
    }
    
    .blocking-content {
        background: white;
        color: #333;
        padding: 40px;
        border-radius: 20px;
        max-width: 500px;
        margin: 20px;
    }
    
    .blocking-icon {
        font-size: 4rem;
        margin-bottom: 20px;
    }
    
    .dialog-content {
        background: white;
        color: #333;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        margin: 20px;
    }
    
    .report-options {
        margin: 20px 0;
    }
    
    .report-options label {
        display: block;
        margin: 10px 0;
        cursor: pointer;
    }
    
    .report-options input {
        margin-right: 10px;
    }
    
    #reportDetails {
        width: 100%;
        height: 80px;
        margin: 15px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        resize: vertical;
    }
    
    .dialog-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    
    .submit-btn, .cancel-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .submit-btn {
        background: #f44336;
        color: white;
    }
    
    .cancel-btn {
        background: #ddd;
        color: #333;
    }
    
    .report-btn {
        background: #f44336 !important;
    }
    
    .report-btn:hover {
        background: #d32f2f !important;
    }
`;

document.head.appendChild(securityStyles);
