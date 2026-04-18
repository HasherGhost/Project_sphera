document.addEventListener('DOMContentLoaded', () => {
    const postBtn = document.getElementById('postBtn');
    const composerInput = document.getElementById('composerInput');
    const postsContainer = document.getElementById('postsContainer');

    if (postBtn && composerInput && postsContainer) {
        postBtn.addEventListener('click', () => {
            const content = composerInput.value.trim();
            if (content === '') {
                alert('Please type something before posting.');
                return;
            }

            createNewPost(content);
            composerInput.value = ''; // Clear input
        });
    }

    function createNewPost(text) {
        const postElement = document.createElement('article');
        postElement.className = 'glass-card post';
        postElement.style.animation = 'fadeInPost 0.5s ease forwards';

        // Current user details (from sidebar)
        const userName = "Sarah Jenkins";
        const userAvatar = "public/avatars/ned-ramirez.png";
        const postTime = "Just now";

        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <img src="${userAvatar}" alt="${userName}"
                        class="rounded-full object-cover border border-slate-700 bg-slate-800"
                        style="width: 48px; height: 48px;">
                    <div class="author-info">
                        <h4>${userName}</h4>
                        <p>Managing Director @ Sphere Ventures • ${postTime}</p>
                    </div>
                </div>
                <button class="btn btn-ghost" style="padding: 4px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                </button>
            </div>
            <div class="post-content">
                ${text.replace(/\n/g, '<br>')}
            </div>
            <div class="post-actions">
                <div class="post-action">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    Trust (0)
                </div>
                <div class="post-action">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    Comment (0)
                </div>
                <div class="post-action">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Refer
                </div>
            </div>
        `;

        // Add to the TOP of the container (Prepending)
        postsContainer.insertBefore(postElement, postsContainer.firstChild);
    }
});

// CSS for the new post animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInPost {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
