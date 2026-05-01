/* ============================================
   Notifications Module
   ============================================ */

class Notifications {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    /**
     * Show toast notification
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '•'}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
        `;

        this.container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    /**
     * Success notification
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    /**
     * Error notification
     */
    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    /**
     * Warning notification
     */
    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Info notification
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * Loading notification (doesn't auto-close)
     */
    loading(message) {
        return this.show(`⏳ ${message}`, 'info', 0);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Clear all toasts
     */
    clear() {
        this.container.innerHTML = '';
    }
}

// Export singleton instance
const notify = new Notifications();
