// Load settings on page load
window.addEventListener('DOMContentLoaded', () => {
    const autoAboutBlank = localStorage.getItem('autoAboutBlank') === 'true';
    if (autoAboutBlank) {
        document.getElementById('autoAboutBlank').classList.add('active');
    }
});

// Toggle auto about:blank
function toggleAutoAboutBlank() {
    const toggle = document.getElementById('autoAboutBlank');
    toggle.classList.toggle('active');
    
    const isActive = toggle.classList.contains('active');
    localStorage.setItem('autoAboutBlank', isActive);
}

// Cloaking function
function cloakSite(name, url, iconUrl) {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = iconUrl;
    document.head.appendChild(link);
    
    document.title = name;
    
    alert('Site cloaked as: ' + name);
}
