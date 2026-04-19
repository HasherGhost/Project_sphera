/* ═══════════════════════════════════════════════════════
   Sphera Global Search Manager
   Handles real-time database lookups across posts, people,
   events, and job opportunities with a premium UI overlay.
   ═══════════════════════════════════════════════════════ */

import { db } from './firebase.js';
import { 
    collection, 
    query, 
    getDocs, 
    limit, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

class GlobalSearch {
    constructor() {
        this.searchInputs = document.querySelectorAll('#feedSearch, #networkSearch, #globalSearchInput');
        this.resultsOverlay = null;
        this.debounceTimeout = null;
        this.isSearching = false;

        this.init();
    }

    init() {
        if (this.searchInputs.length === 0) return;

        // Create results container
        this.createOverlay();

        this.searchInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleInput(e));
            input.addEventListener('focus', () => this.showOverlay());
            // input.addEventListener('blur', () => setTimeout(() => this.hideOverlay(), 200));
        });

        // Close search on escape or click outside
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideOverlay();
        });

        document.addEventListener('click', (e) => {
            const isSearchArea = Array.from(this.searchInputs).some(input => input.contains(e.target)) || this.resultsOverlay.contains(e.target);
            if (!isSearchArea) this.hideOverlay();
        });
    }

    createOverlay() {
        this.resultsOverlay = document.createElement('div');
        this.resultsOverlay.className = 'search-results-overlay panel stack';
        this.resultsOverlay.innerHTML = `
            <div class="search-status">Type to search across Sphera...</div>
            <div class="search-sections"></div>
        `;
        document.body.appendChild(this.resultsOverlay);

        // Position helper: align with the active search bar
    }

    positionOverlay(activeInput) {
        const rect = activeInput.getBoundingClientRect();
        this.resultsOverlay.style.top = `${rect.bottom + 12}px`;
        this.resultsOverlay.style.left = `${rect.left}px`;
        this.resultsOverlay.style.width = `${Math.max(rect.width, 400)}px`;
    }

    showOverlay() {
        const activeInput = document.activeElement;
        if (activeInput && (activeInput.id === 'feedSearch' || activeInput.id === 'networkSearch')) {
            this.positionOverlay(activeInput);
            this.resultsOverlay.classList.add('show');
        }
    }

    hideOverlay() {
        this.resultsOverlay.classList.remove('show');
    }

    handleInput(e) {
        const query = e.target.value.trim().toLowerCase();
        this.showOverlay();

        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
        
        if (query.length < 2) {
            this.renderPlaceholder('Type at least 2 characters...');
            return;
        }

        this.renderPlaceholder('<span class="pulse"></span> Searching the database...');
        
        this.debounceTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 400);
    }

    async performSearch(term) {
        try {
            this.isSearching = true;

            // Real Firestore Queries (Parallel)
            const [postSnap, userSnap, eventSnap, jobSnap] = await Promise.all([
                getDocs(query(collection(db, 'posts'), limit(20))),
                getDocs(query(collection(db, 'users'), limit(20))),
                getDocs(query(collection(db, 'events'), limit(10))),
                getDocs(query(collection(db, 'jobs'), limit(10)))
            ]);

            const results = {
                posts: postSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.text?.toLowerCase().includes(term)),
                people: userSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.name?.toLowerCase().includes(term) || u.role?.toLowerCase().includes(term)),
                events: eventSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.title?.toLowerCase().includes(term)),
                jobs: jobSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(j => j.title?.toLowerCase().includes(term) || j.company?.toLowerCase().includes(term))
            };

            // Fallback for demo if database is sparsely populated
            if (Object.values(results).every(arr => arr.length === 0)) {
                this.performStaticSearch(term);
            } else {
                this.renderResults(results);
            }

        } catch (error) {
            console.error('Search failed:', error);
            this.renderPlaceholder('Search unavailable. Try again later.');
        } finally {
            this.isSearching = false;
        }
    }

    performStaticSearch(term) {
        // Simulated data for demo purposes when DB is empty
        const staticData = {
            people: [
                { name: 'Aarav Sharma', role: 'Full-stack Engineer', company: 'Sphera' },
                { name: 'Priya Nair', role: 'Product Designer', company: 'Identity Labs' },
                { name: 'Marcus Johnson', role: 'CTO', company: 'CloudScale AI' }
            ],
            posts: [
                { text: 'Looking for a verified co-founder for a new fintech project.', authorName: 'James Wilson' },
                { text: 'Just published our new trust protocol whitepaper.', authorName: 'Aarav Sharma' }
            ],
            events: [
                { title: 'Bengaluru Trust Summit 2026', location: 'Bengaluru, KA' },
                { title: 'Webinar: Scaling Verified Networks', location: 'Online' }
            ],
            jobs: [
                { title: 'Senior UX Designer', company: 'NovaPay' },
                { title: 'Backend Engineer (Go)', company: 'Nexus Labs' }
            ]
        };

        const filtered = {
            people: staticData.people.filter(p => p.name.toLowerCase().includes(term) || p.role.toLowerCase().includes(term)),
            posts: staticData.posts.filter(p => p.text.toLowerCase().includes(term)),
            events: staticData.events.filter(e => e.title.toLowerCase().includes(term)),
            jobs: staticData.jobs.filter(j => j.title.toLowerCase().includes(term) || j.company.toLowerCase().includes(term))
        };

        this.renderResults(filtered);
    }

    renderPlaceholder(html) {
        this.resultsOverlay.querySelector('.search-sections').innerHTML = '';
        this.resultsOverlay.querySelector('.search-status').innerHTML = html;
    }

    renderResults(results) {
        const container = this.resultsOverlay.querySelector('.search-sections');
        const status = this.resultsOverlay.querySelector('.search-status');
        container.innerHTML = '';

        const hasAny = Object.values(results).some(arr => arr.length > 0);

        if (!hasAny) {
            status.innerHTML = 'No results found in any category.';
            return;
        }

        status.innerHTML = 'Top Matches';

        // Render People
        if (results.people.length > 0) {
            this.renderSection(container, 'People', results.people.map(p => `
                <div class="result-item" onclick="window.location.href='network.html?search=${encodeURIComponent(p.name)}'">
                    <div class="result-icon">👤</div>
                    <div class="result-info">
                        <div class="result-title">${p.name}</div>
                        <div class="result-sub">${p.role} @ ${p.company || 'Professional'}</div>
                    </div>
                </div>
            `));
        }

        // Render Posts
        if (results.posts.length > 0) {
            this.renderSection(container, 'Insights & Posts', results.posts.map(p => `
                <div class="result-item" onclick="window.location.href='feed.html?search=${encodeURIComponent(p.text.slice(0, 20))}'">
                    <div class="result-icon">📄</div>
                    <div class="result-info">
                        <div class="result-title">${p.text.slice(0, 60)}...</div>
                        <div class="result-sub">by ${p.authorName || 'Member'}</div>
                    </div>
                </div>
            `));
        }

        // Render Opportunities
        if (results.jobs.length > 0) {
            this.renderSection(container, 'Job Opportunities', results.jobs.map(j => `
                <div class="result-item" onclick="window.location.href='job_opportunities.html?query=${encodeURIComponent(j.title)}'">
                    <div class="result-icon">💼</div>
                    <div class="result-info">
                        <div class="result-title">${j.title}</div>
                        <div class="result-sub">${j.company} &middot; Hiring Now</div>
                    </div>
                </div>
            `));
        }

        // Render Events
        if (results.events.length > 0) {
            this.renderSection(container, 'Upcoming Events', results.events.map(e => `
                <div class="result-item" onclick="window.location.href='event.html?search=${encodeURIComponent(e.title)}'">
                    <div class="result-icon">📅</div>
                    <div class="result-info">
                        <div class="result-title">${e.title}</div>
                        <div class="result-sub">${e.location}</div>
                    </div>
                </div>
            `));
        }
    }

    renderSection(container, title, items) {
        const section = document.createElement('div');
        section.className = 'search-section';
        section.innerHTML = `
            <div class="section-header">${title}</div>
            <div class="section-items">${items.join('')}</div>
        `;
        container.appendChild(section);
    }
}

// Inject Required Styles for the Overlay
const styles = `
.search-results-overlay {
    position: fixed;
    z-index: 9999;
    background: var(--surface);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    padding: 16px;
    max-height: 500px;
    overflow-y: auto;
    display: none;
    animation: searchReveal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-results-overlay.show {
    display: block;
}

@keyframes searchReveal {
    from { opacity: 0; transform: translateY(-10px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.search-status {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--muted);
    letter-spacing: 0.05em;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--line);
}

.search-section {
    margin-bottom: 16px;
}

.section-header {
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 8px;
}

.result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s;
}

.result-item:hover {
    background: var(--line);
}

.result-icon {
    font-size: 18px;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    background: var(--surface-f);
    border-radius: 8px;
}

.result-info {
    flex: 1;
}

.result-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
}

.result-sub {
    font-size: 12px;
    color: var(--muted);
}

.search-results-overlay::-webkit-scrollbar {
    width: 4px;
}
.search-results-overlay::-webkit-scrollbar-thumb {
    background: var(--line-s);
    border-radius: 99px;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Initialize
new GlobalSearch();
