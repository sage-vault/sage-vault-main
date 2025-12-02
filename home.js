// Update clock every second
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

// Get time-based greeting
function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
        return 'Good morning!';
    } else if (hour >= 12 && hour < 17) {
        return 'Good afternoon!';
    } else if (hour >= 17 && hour < 21) {
        return 'Good evening!';
    } else {
        return 'Good night!';
    }
}

// Get current date
function getCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}

// Update home time text
function updateHomeTime() {
    const greeting = getGreeting();
    const date = getCurrentDate();
    document.getElementById('homeTime').textContent = `${greeting} Today is ${date}`;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    updateClock();
    updateHomeTime();
    setInterval(updateClock, 1000);
});
