// State to track media selection
let currentMediaType = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const mediaBtn = document.getElementById('mediaBtn');
    const backdrop = document.getElementById('mediaModalBackdrop');
    
    if (mediaBtn) {
        mediaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openMediaModal();
        });
    }

    // Close modal on backdrop click
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeMediaModal();
            }
        });
    }
});

// Modal Logic
function openMediaModal() {
    const backdrop = document.getElementById('mediaModalBackdrop');
    backdrop.classList.add('show');
    resetMediaModal();
}

function closeMediaModal() {
    const backdrop = document.getElementById('mediaModalBackdrop');
    backdrop.classList.remove('show');
}

function resetMediaModal() {
    document.getElementById('typeSelection').style.display = 'block';
    document.getElementById('sourceSelection').style.display = 'none';
    currentMediaType = null;
}

// Global functions for HTML onclicks
window.selectMediaType = function(type) {
    currentMediaType = type;
    document.getElementById('typeSelection').style.display = 'none';
    document.getElementById('sourceSelection').style.display = 'block';
    
    // Update title for source selection
    const title = document.getElementById('sourceTitle');
    title.innerText = `Select Source for ${type === 'photos' ? 'Photos' : 'Videos'}`;
};

window.selectMediaSource = function(source) {
    if (source === 'google') {
        const url = currentMediaType === 'photos' 
            ? 'https://photos.google.com/' 
            : 'https://photos.google.com/search/_tra_'; // Direct to library or search for videos
        window.open(url, '_blank', 'noopener,noreferrer');
        closeMediaModal();
    } else {
        // Trigger hidden local input
        if (currentMediaType === 'photos') {
            document.getElementById('localPhotoInput').click();
        } else {
            document.getElementById('localVideoInput').click();
        }
        closeMediaModal();
    }
};

window.resetMediaModal = resetMediaModal;

// Handle file selection (optional: you can add logic here to preview the file)
document.getElementById('localPhotoInput')?.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        console.log('Selected Photo:', this.files[0].name);
        alert(`Photo selected: ${this.files[0].name}\n(In a real app, this would be uploaded or previewed)`);
    }
});

document.getElementById('localVideoInput')?.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        console.log('Selected Video:', this.files[0].name);
        alert(`Video selected: ${this.files[0].name}\n(In a real app, this would be uploaded or previewed)`);
    }
});
