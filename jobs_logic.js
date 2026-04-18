document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const searchInput = document.getElementById('jobSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const jobCards = document.querySelectorAll('.feat-card');
    const applyModal = document.getElementById('applyModal');
    const modalJobTitle = document.getElementById('modalJobTitle');
    const modalStep1 = document.getElementById('modalStep1');
    const modalStep2 = document.getElementById('modalStep2');
    const confirmApplyBtn = document.getElementById('confirmApply');

    // --- Filtering Logic ---
    function filterJobs() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter.toLowerCase();

        jobCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('.desc').textContent.toLowerCase();
            const categories = card.dataset.category.toLowerCase();
            
            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);

            if (matchesSearch && matchesFilter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    searchInput?.addEventListener('input', filterJobs);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterJobs();
        });
    });

    // --- Modal Logic ---
    window.openModal = function(jobTitle) {
        if (!applyModal) return;
        modalJobTitle.textContent = `Apply for ${jobTitle}`;
        modalStep1.classList.remove('hidden');
        modalStep2.classList.add('hidden');
        applyModal.classList.add('active');
    };

    window.closeModal = function() {
        applyModal.classList.remove('active');
    };

    confirmApplyBtn?.addEventListener('click', () => {
        modalStep1.classList.add('hidden');
        modalStep2.classList.remove('hidden');
        
        // Simulate background processing
        console.log('Sending application for:', modalJobTitle.textContent);
    });

    // Close modal on outside click
    applyModal?.addEventListener('click', (e) => {
        if (e.target === applyModal) closeModal();
    });

    // --- Attach Click Events to Apply Buttons ---
    document.querySelectorAll('.btn-apply').forEach(btn => {
        btn.addEventListener('click', () => {
            const jobName = btn.dataset.job;
            openModal(jobName);
        });
    });
});
