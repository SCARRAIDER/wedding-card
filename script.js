document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.scroll-container');
    const heroContent = document.querySelector('.hero-content');
    const lotus = document.querySelector('.lotus-layer');
    const whiteFill = document.querySelector('.white-fill');
    const details = document.querySelector('.details-layer');

    window.addEventListener('scroll', () => {
        const rect = container.getBoundingClientRect();
        const totalHeight = container.offsetHeight;
        const viewportHeight = window.innerHeight;

        let progress = -rect.top / (totalHeight - viewportHeight);
        progress = Math.max(0, Math.min(1, progress));

        // Animation Phases:
        // 0% - 30%: Lotus fades in on top of hero text (Starts immediately)
        if (progress <= 0.3) {
            const p = progress / 0.3;
            lotus.style.opacity = p;
            lotus.style.transform = `scale(${0.5 + p * 0.5})`;
            
            heroContent.style.opacity = 1 - (p * 0.5); // Start fading text slightly as lotus appears
            whiteFill.style.opacity = 0;
            details.style.opacity = 0;
        }
        // 30% - 70%: Lotus zooms and covers text
        else if (progress <= 0.7) {
            const p = (progress - 0.3) / 0.4;
            lotus.style.opacity = 1;
            const scale = 1 + (p * 40);
            lotus.style.transform = `scale(${scale})`;
            
            // Fade out hero text as lotus gets big
            heroContent.style.opacity = 1 - (p * 2); 
            
            // Fill screen with white towards end of zoom
            if (p > 0.8) {
                whiteFill.style.opacity = (p - 0.8) * 5;
            } else {
                whiteFill.style.opacity = 0;
            }

            details.style.opacity = 0;
            details.classList.remove('active');
        }
        // 70% - 100%: Reveal Wedding Details
        else {
            const p = (progress - 0.7) / 0.3;
            lotus.style.opacity = 0;
            heroContent.style.opacity = 0;
            whiteFill.style.opacity = 1;
            
            details.style.opacity = p;
            details.style.transform = `translateY(${30 - p * 30}px)`;
            details.classList.add('active');
        }
    });
});
