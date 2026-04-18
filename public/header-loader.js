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
                    <img src="avatars/aarav-mehta.png" alt="Profile" class="user-pill-img">
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
