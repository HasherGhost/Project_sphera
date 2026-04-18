/* ═══════════════════════════════════════════════════════
   Sphera Theme Manager
   ═══════════════════════════════════════════════════════ */

(function() {
    const STORAGE_KEY = 'S-theme';
    const THEME_TOGGLE_ID = 'themeToggle';
    
    // Apply theme on load
    function applyTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', preferredTheme);
    }

    // Toggle theme function
    window.toggleTheme = function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    };

    // Initialize listeners when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const toggleBtn = document.getElementById(THEME_TOGGLE_ID);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', window.toggleTheme);
        }
    });

    applyTheme();
})();
