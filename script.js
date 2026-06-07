document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for the card fade-in effect
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const card = document.querySelector('.card');
    if (card) {
        observer.observe(card);
    }
});
