/* ═══════════════════════════════════════════════════════
   Sphera Header Loader
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;
    
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    
    const isOpp = currentPage.includes('opportunity') || currentPage.includes('opportunities');
    
    headerPlaceholder.innerHTML = `
    <header class="hdr">
        <div class="wrap hdr-row">
            <a class="brand" href="index.html">
                <div class="brand-mark">S</div>
                <div class="brand-text"><strong>Sphera.</strong></div>
            </a>
            
            <nav class="hdr-nav">
                <a href="feed.html" class="${currentPage === 'feed.html' ? 'active' : ''}">Feed</a>
                <a href="network.html" class="${currentPage === 'network.html' ? 'active' : ''}">Network</a>
                <a href="opportunity.html" class="${isOpp ? 'active' : ''}">Opportunities</a>
                <a href="event.html" class="${currentPage === 'event.html' ? 'active' : ''}">Events</a>
                <a href="campaign.html" class="${currentPage === 'campaign.html' ? 'active' : ''}">Campaigns</a>
                <a href="reward.html" class="${currentPage === 'reward.html' ? 'active' : ''}">Rewards</a>
            </nav>

            <div class="hdr-acts">
                <button class="theme-tog" id="themeToggle" title="Toggle Mode">☼ / ☾</button>
                <a href="profile.html" class="user-pill ${currentPage === 'profile.html' ? 'active' : ''}">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239b90b0'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E" alt="Profile" class="user-pill-img" style="background: var(--surface-f); padding: 4px;">
                    <span class="user-pill-name">Aarav</span>
                </a>
            </div>
        </div>
    </header>
    `;
    
    // Re-initialize theme toggle listener
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (window.toggleTheme) {
                window.toggleTheme();
            } else {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('S-theme', newTheme);
            }
        });
    }
});
