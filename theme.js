const themeKey = 'su-theme';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(themeKey, theme); } catch (e) { }
    updateThemeUI(theme);
}

function updateThemeUI(theme) {
    const label = document.getElementById('themeLabel');
    if (label) {
        label.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }

    const icon = document.getElementById('theme-icon');
    if (icon) {
        if (theme === 'dark') {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        } else {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        }
    }
}

// This function is globally accessible for elements with onclick="toggleTheme()"
window.toggleTheme = function () {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
};

// Immediately apply theme to avoid Flash Of Unstyled Content (FOUC)
(function () {
    try {
        const savedTheme = localStorage.getItem(themeKey) || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) { }
})();

// Update UI icons when DOM loads and attach listeners
document.addEventListener('DOMContentLoaded', () => {
    let savedTheme = 'dark';
    try { savedTheme = localStorage.getItem(themeKey) || 'dark'; } catch (e) { }
    updateThemeUI(savedTheme);

    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', window.toggleTheme);
    }
});
