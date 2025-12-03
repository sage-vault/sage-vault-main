// ============================================================================
// SAGE'S VAULT - ADVANCED PROXY SYSTEM
// Version: 2.0
// Description: Complete proxy management system with multiple services
// ============================================================================

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const PROXY_CONFIG = {
    services: {
        ultraviolet: {
            name: 'Ultraviolet',
            url: 'https://uv.holyubofficial.net/service/',
            encoding: 'base64',
            recommended: true,
            description: 'Fast and reliable proxy service'
        },
        womginx: {
            name: 'Womginx',
            url: 'https://www.womginx.com/main/',
            encoding: 'direct',
            recommended: false,
            description: 'Alternative proxy with good compatibility'
        },
        rammerhead: {
            name: 'Rammerhead',
            url: 'https://rammerhead.org/service/',
            encoding: 'hex',
            recommended: false,
            description: 'Advanced proxy with session support'
        },
        nebula: {
            name: 'Nebula',
            url: 'https://nebula.bio/service/',
            encoding: 'base64',
            recommended: false,
            description: 'Secure proxy with encryption'
        }
    },
    
    // Default settings
    defaults: {
        service: 'ultraviolet',
        aboutBlank: false,
        saveHistory: true,
        autoReload: false,
        blockAds: false
    },
    
    // Quick links configuration
    quickLinks: [
        { name: 'YouTube', url: 'https://youtube.com', icon: '📺', category: 'media' },
        { name: 'Discord', url: 'https://discord.com', icon: '💬', category: 'social' },
        { name: 'Reddit', url: 'https://reddit.com', icon: '🤖', category: 'social' },
        { name: 'Twitter', url: 'https://twitter.com', icon: '🐦', category: 'social' },
        { name: 'TikTok', url: 'https://tiktok.com', icon: '🎵', category: 'media' },
        { name: 'Instagram', url: 'https://instagram.com', icon: '📷', category: 'social' },
        { name: 'Netflix', url: 'https://netflix.com', icon: '🎬', category: 'streaming' },
        { name: 'Spotify', url: 'https://spotify.com', icon: '🎧', category: 'music' },
        { name: 'Twitch', url: 'https://twitch.tv', icon: '🎮', category: 'streaming' },
        { name: 'GitHub', url: 'https://github.com', icon: '💻', category: 'dev' },
        { name: 'Cool Math', url: 'https://coolmathgames.com', icon: '🎲', category: 'games' },
        { name: 'Now.gg', url: 'https://now.gg', icon: '🕹️', category: 'games' }
    ],
    
    // Storage keys
    storageKeys: {
        visitCount: 'proxy_visit_count',
        lastService: 'proxy_last_service',
        history: 'proxy_history',
        favorites: 'proxy_favorites',
        settings: 'proxy_settings'
    }
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

class ProxyState {
    constructor() {
        this.currentService = PROXY_CONFIG.defaults.service;
        this.currentUrl = '';
        this.isLoading = false;
        this.visitCount = 0;
        this.history = [];
        this.favorites = [];
        this.settings = { ...PROXY_CONFIG.defaults };
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        try {
            this.visitCount = parseInt(localStorage.getItem(PROXY_CONFIG.storageKeys.visitCount) || '0');
            this.currentService = localStorage.getItem(PROXY_CONFIG.storageKeys.lastService) || PROXY_CONFIG.defaults.service;
            
            const historyData = localStorage.getItem(PROXY_CONFIG.storageKeys.history);
            if (historyData) {
                this.history = JSON.parse(historyData);
            }
            
            const favoritesData = localStorage.getItem(PROXY_CONFIG.storageKeys.favorites);
            if (favoritesData) {
                this.favorites = JSON.parse(favoritesData);
            }
            
            const settingsData = localStorage.getItem(PROXY_CONFIG.storageKeys.settings);
            if (settingsData) {
                this.settings = { ...this.settings, ...JSON.parse(settingsData) };
            }
        } catch (error) {
            console.error('Error loading state from storage:', error);
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(PROXY_CONFIG.storageKeys.visitCount, this.visitCount.toString());
            localStorage.setItem(PROXY_CONFIG.storageKeys.lastService, this.currentService);
            localStorage.setItem(PROXY_CONFIG.storageKeys.history, JSON.stringify(this.history));
            localStorage.setItem(PROXY_CONFIG.storageKeys.favorites, JSON.stringify(this.favorites));
            localStorage.setItem(PROXY_CONFIG.storageKeys.settings, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving state to storage:', error);
        }
    }
    
    incrementVisitCount() {
        this.visitCount++;
        this.saveToStorage();
    }
    
    addToHistory(url) {
        if (!this.settings.saveHistory) return;
        
        const entry = {
            url: url,
            timestamp: Date.now(),
            service: this.currentService
        };
        
        this.history.unshift(entry);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveToStorage();
    }
    
    addToFavorites(url, title) {
        const favorite = {
            url: url,
            title: title || url,
            timestamp: Date.now()
        };
        
        // Check if already in favorites
        const exists = this.favorites.some(fav => fav.url === url);
        if (!exists) {
            this.favorites.push(favorite);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    removeFromFavorites(url) {
        this.favorites = this.favorites.filter(fav => fav.url !== url);
        this.saveToStorage();
    }
    
    clearHistory() {
        this.history = [];
        this.saveToStorage();
    }
}

// Initialize global state
const proxyState = new ProxyState();

// ============================================================================
// URL ENCODING & FORMATTING
// ============================================================================

class URLEncoder {
    static cleanUrl(url) {
        url = url.trim();
        
        // Remove leading/trailing whitespace
        url = url.replace(/^\s+|\s+$/g, '');
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        return url;
    }
    
    static encodeBase64(url) {
        try {
            return btoa(url);
        } catch (error) {
            console.error('Base64 encoding error:', error);
            return encodeURIComponent(url);
        }
    }
    
    static encodeHex(url) {
        try {
            const cleaned = url.replace(/https?:\/\//, '');
            return cleaned.split('').map(char => {
                return char.charCodeAt(0).toString(16).padStart(2, '0');
            }).join('');
        } catch (error) {
            console.error('Hex encoding error:', error);
            return encodeURIComponent(url);
        }
    }
    
    static encodeDirect(url) {
        return encodeURIComponent(url);
    }
    
    static formatForService(url, serviceName) {
        const service = PROXY_CONFIG.services[serviceName];
        if (!service) {
            console.error('Unknown service:', serviceName);
            return url;
        }
        
        const cleanedUrl = this.cleanUrl(url);
        const baseUrl = service.url;
        
        switch (service.encoding) {
            case 'base64':
                return baseUrl + this.encodeBase64(cleanedUrl);
            
            case 'hex':
                return baseUrl + 'hvtrs8%2F-' + this.encodeHex(cleanedUrl);
            
            case 'direct':
                return baseUrl + this.encodeDirect(cleanedUrl);
            
            default:
                return baseUrl + cleanedUrl;
        }
    }
}

// ============================================================================
// UI NOTIFICATION SYSTEM
// ============================================================================

class NotificationManager {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const colors = {
            success: '#fff',
            error: '#ff4444',
            warning: '#ffaa00',
            info: '#fff'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #0a0a0a;
            color: ${colors[type]};
            padding: 15px 25px;
            border: 2px solid ${colors[type]};
            border-radius: 10px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            z-index: 10002;
            box-shadow: 0 5px 20px rgba(255, 255, 255, 0.3);
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `<span style="margin-right: 10px;">${icons[type]}</span>${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    static success(message) {
        this.show(message, 'success');
    }
    
    static error(message) {
        this.show(message, 'error');
    }
    
    static warning(message) {
        this.show(message, 'warning');
    }
    
    static info(message) {
        this.show(message, 'info');
    }
}

// ============================================================================
// PROXY LOADER & MANAGER
// ============================================================================

class ProxyManager {
    constructor() {
        this.frame = null;
        this.container = null;
        this.loadingOverlay = null;
        this.initialized = false;
    }
    
    initialize() {
        this.frame = document.getElementById('proxyFrame');
        this.container = document.getElementById('proxyContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.initialized = true;
        console.log('ProxyManager initialized');
    }
    
    loadUrl(url, openInAboutBlank = false) {
        if (!this.initialized) {
            this.initialize();
        }
        
        if (!url || url.trim() === '') {
            NotificationManager.warning('Please enter a valid URL');
            return;
        }
        
        if (openInAboutBlank) {
            this.openInAboutBlank(url);
        } else {
            this.loadInFrame(url);
        }
    }
    
    loadInFrame(url) {
        try {
            // Show loading state
            this.showLoading();
            this.container.classList.add('active');
            
            // Format URL for current service
            const proxyUrl = URLEncoder.formatForService(url, proxyState.currentService);
            
            // Update state
            proxyState.currentUrl = url;
            proxyState.incrementVisitCount();
            proxyState.addToHistory(url);
            
            // Update UI
            this.updateUrlDisplay(url);
            this.updateStats();
            
            // Load URL
            this.frame.src = proxyUrl;
            
            console.log('Loading URL:', url);
            console.log('Proxy URL:', proxyUrl);
            console.log('Service:', proxyState.currentService);
            
            // Hide loading after delay
            setTimeout(() => {
                this.hideLoading();
            }, 2000);
            
            NotificationManager.success('Loading ' + url);
            
        } catch (error) {
            console.error('Error loading URL:', error);
            NotificationManager.error('Failed to load: ' + error.message);
            this.hideLoading();
        }
    }
    
    openInAboutBlank(url) {
        try {
            const win = window.open('about:blank', '_blank');
            
            if (!win) {
                NotificationManager.error('Popup blocked! Please allow popups');
                return;
            }
            
            const proxyUrl = URLEncoder.formatForService(url, proxyState.currentService);
            
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Google Classroom</title>
                    <link rel="icon" href="https://ssl.gstatic.com/classroom/ic_product_classroom_32.png">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body, html {
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
                            background: #000;
                        }
                        iframe {
                            width: 100%;
                            height: 100%;
                            border: none;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <iframe src="${proxyUrl}" allowfullscreen></iframe>
                </body>
                </html>
            `;
            
            win.document.write(htmlContent);
            win.document.close();
            
            // Update stats
            proxyState.incrementVisitCount();
            proxyState.addToHistory(url);
            this.updateStats();
            
            NotificationManager.success('Opened in About:Blank mode');
            
        } catch (error) {
            console.error('Error opening about:blank:', error);
            NotificationManager.error('Failed to open in About:Blank: ' + error.message);
        }
    }
    
    close() {
        if (this.frame) {
            this.frame.src = '';
        }
        if (this.container) {
            this.container.classList.remove('active');
        }
        proxyState.currentUrl = '';
        this.updateUrlDisplay('No site loaded');
        NotificationManager.info('Proxy closed');
    }
    
    reload() {
        if (!proxyState.currentUrl) {
            NotificationManager.warning('No page to reload');
            return;
        }
        
        this.showLoading();
        this.frame.src = this.frame.src;
        
        setTimeout(() => {
            this.hideLoading();
        }, 1500);
        
        NotificationManager.success('Page reloaded');
    }
    
    navigateBack() {
        try {
            if (this.frame && this.frame.contentWindow) {
                this.frame.contentWindow.history.back();
                NotificationManager.success('Navigated back');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            NotificationManager.warning('Cannot navigate back');
        }
    }
    
    navigateForward() {
        try {
            if (this.frame && this.frame.contentWindow) {
                this.frame.contentWindow.history.forward();
                NotificationManager.success('Navigated forward');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            NotificationManager.warning('Cannot navigate forward');
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.frame.requestFullscreen()
                .then(() => {
                    NotificationManager.success('Fullscreen activated');
                })
                .catch(err => {
                    NotificationManager.error('Fullscreen failed: ' + err.message);
                });
        } else {
            document.exitFullscreen();
            NotificationManager.info('Exited fullscreen');
        }
    }
    
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('active');
        }
        proxyState.isLoading = true;
    }
    
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('active');
        }
        proxyState.isLoading = false;
    }
    
    updateUrlDisplay(url) {
        const display = document.getElementById('currentUrl');
        if (display) {
            display.textContent = url;
        }
    }
    
    updateStats() {
        const visitElement = document.getElementById('sitesVisited');
        if (visitElement) {
            visitElement.textContent = proxyState.visitCount;
        }
    }
    
    changeService(serviceName) {
        if (!PROXY_CONFIG.services[serviceName]) {
            NotificationManager.error('Invalid proxy service');
            return;
        }
        
        proxyState.currentService = serviceName;
        proxyState.saveToStorage();
        
        const service = PROXY_CONFIG.services[serviceName];
        NotificationManager.success('Switched to ' + service.name);
        
        console.log('Proxy service changed to:', serviceName);
    }
}

// Initialize global proxy manager
const proxyManager = new ProxyManager();

// ============================================================================
// GLOBAL FUNCTIONS (Called from HTML)
// ============================================================================

function openProxy() {
    const input = document.getElementById('proxyUrl');
    if (!input) return;
    
    const url = input.value.trim();
    if (!url) {
        NotificationManager.warning('Please enter a URL');
        input.focus();
        return;
    }
    
    const aboutBlank = document.getElementById('aboutBlankToggle');
    const useAboutBlank = aboutBlank ? aboutBlank.checked : false;
    
    proxyManager.loadUrl(url, useAboutBlank);
}

function openProxyUrl(url) {
    const aboutBlank = document.getElementById('aboutBlankToggle');
    const useAboutBlank = aboutBlank ? aboutBlank.checked : false;
    
    proxyManager.loadUrl(url, useAboutBlank);
}

function closeProxy() {
    proxyManager.close();
}

function reloadProxy() {
    proxyManager.reload();
}

function proxyBack() {
    proxyManager.navigateBack();
}

function proxyForward() {
    proxyManager.navigateForward();
}

function proxyFullscreen() {
    proxyManager.toggleFullscreen();
}

function changeProxyService() {
    const select = document.getElementById('proxyService');
    if (select) {
        proxyManager.changeService(select.value);
    }
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

class KeyboardShortcuts {
    static initialize() {
        document.addEventListener('keydown', (e) => {
            // Enter key in input
            if (e.target.id === 'proxyUrl' && e.key === 'Enter') {
                openProxy();
            }
            
            // Check if proxy is open
            const container = document.getElementById('proxyContainer');
            const isProxyOpen = container && container.classList.contains('active');
            
            if (!isProxyOpen) return;
            
            // Escape to close
            if (e.key === 'Escape') {
                closeProxy();
            }
            
            // Ctrl/Cmd + R to reload
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                reloadProxy();
            }
            
            // Alt + Left Arrow to go back
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                proxyBack();
            }
            
            // Alt + Right Arrow to go forward
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                proxyForward();
            }
            
            // F11 for fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                proxyFullscreen();
            }
        });
        
        console.log('Keyboard shortcuts initialized');
    }
}

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

class HistoryManager {
    static renderHistory() {
        const historyContainer = document.getElementById('historyContainer');
        if (!historyContainer) return;
        
        if (proxyState.history.length === 0) {
            historyContainer.innerHTML = '<p style="color: #666;">No history yet</p>';
            return;
        }
        
        const historyHTML = proxyState.history.slice(0, 10).map(entry => {
            const date = new Date(entry.timestamp).toLocaleString();
            return `
                <div class="history-item" onclick="openProxyUrl('${entry.url}')">
                    <div class="history-url">${entry.url}</div>
                    <div class="history-meta">${date} • ${entry.service}</div>
                </div>
            `;
        }).join('');
        
        historyContainer.innerHTML = historyHTML;
    }
    
    static clearHistory() {
        if (confirm('Clear all browsing history?')) {
            proxyState.clearHistory();
            this.renderHistory();
            NotificationManager.success('History cleared');
        }
    }
}

// ============================================================================
// FAVORITES MANAGEMENT
// ============================================================================

class FavoritesManager {
    static addCurrent() {
        if (!proxyState.currentUrl) {
            NotificationManager.warning('No active page to bookmark');
            return;
        }
        
        const added = proxyState.addToFavorites(proxyState.currentUrl);
        if (added) {
            NotificationManager.success('Added to favorites');
            this.renderFavorites();
        } else {
            NotificationManager.info('Already in favorites');
        }
    }
    
    static renderFavorites() {
        const favoritesContainer = document.getElementById('favoritesContainer');
        if (!favoritesContainer) return;
        
        if (proxyState.favorites.length === 0) {
            favoritesContainer.innerHTML = '<p style="color: #666;">No favorites yet</p>';
            return;
        }
        
        const favoritesHTML = proxyState.favorites.map((fav, index) => {
            return `
                <div class="favorite-item">
                    <div class="favorite-info" onclick="openProxyUrl('${fav.url}')">
                        <div class="favorite-title">${fav.title}</div>
                        <div class="favorite-url">${fav.url}</div>
                    </div>
                    <button class="favorite-remove" onclick="FavoritesManager.remove(${index})">×</button>
                </div>
            `;
        }).join('');
        
        favoritesContainer.innerHTML = favoritesHTML;
    }
    
    static remove(index) {
        if (proxyState.favorites[index]) {
            proxyState.removeFromFavorites(proxyState.favorites[index].url);
            this.renderFavorites();
            NotificationManager.success('Removed from favorites');
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeProxy() {
    console.log('Initializing Sage\'s Vault Proxy System v2.0...');
    
    // Initialize managers
    proxyManager.initialize();
    KeyboardShortcuts.initialize();
    
    // Update UI with saved state
    proxyManager.updateStats();
    
    // Set saved service
    const serviceSelect = document.getElementById('proxyService');
    if (serviceSelect) {
        serviceSelect.value = proxyState.currentService;
    }
    
    // Focus input
    const input = document.getElementById('proxyUrl');
    if (input) {
        input.focus();
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Proxy system initialized successfully!');
    console.log('📊 Total visits:', proxyState.visitCount);
    console.log('🌐 Current service:', proxyState.currentService);
    console.log('📜 History entries:', proxyState.history.length);
    console.log('⭐ Favorites:', proxyState.favorites.length);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProxy);
} else {
    initializeProxy();
}

// ============================================================================
// EXPORT FOR DEBUGGING
// ============================================================================

window.ProxyDebug = {
    state: proxyState,
    manager: proxyManager,
    config: PROXY_CONFIG,
    clearAll: () => {
        localStorage.clear();
        NotificationManager.success('All data cleared');
        location.reload();
    }
};

console.log('🚀 Proxy.js loaded - 800+ lines of advanced proxy code ready!');
console.log('💡 Type ProxyDebug in console for debugging tools');
