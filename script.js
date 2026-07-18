// Animation configuration — all tunable values live here.
const CONFIG = {
    // Scroll progress boundaries for each animation phase (0 to 1).
    phases: {
        fadeInEnd: 0.3,   // 0% - 30%:  lotus fades in over hero text
        zoomEnd: 0.7,     // 30% - 70%: lotus zooms and covers the screen
        // 70% - 100%: wedding details are revealed
    },

    // Lotus fade-in phase.
    fadeIn: {
        minScale: 0.5,        // starting scale of the lotus
        scaleGrowth: 0.5,     // scale added across the phase (ends at minScale + this)
        heroFadeAmount: 0.5,  // how much the hero text dims during this phase
    },

    // Lotus zoom phase.
    zoom: {
        maxScale: 40,           // extra scale applied at the end of the zoom
        heroFadeMultiplier: 2,  // hero text fades out twice as fast (gone by mid-phase)
        whiteFillStart: 0.8,    // point in the phase where the white fill begins
        whiteFillSpeed: 5,      // how quickly the white fill ramps to full opacity
    },

    // Petal rotation, applied continuously from 0% up to `rotationEnd`.
    rotation: {
        rotationEnd: 0.7,  // scroll progress at which petals stop rotating
        outer: 90,         // final rotation of the outer petals (deg)
        mid: -120,         // final rotation of the middle petals (deg)
        inner: 180,        // final rotation of the inner petals (deg)
    },

    // Wedding details reveal phase.
    details: {
        slideDistance: 30,  // px the card slides up as it fades in
    },
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.scroll-container');
    const heroContent = document.querySelector('.hero-content');
    const lotus = document.querySelector('.lotus-layer');
    const lotusOuter = document.querySelector('.lotus-petals-outer');
    const lotusMid = document.querySelector('.lotus-petals-mid');
    const lotusInner = document.querySelector('.lotus-petals-inner');
    const whiteFill = document.querySelector('.white-fill');
    const details = document.querySelector('.details-layer');

    const applyPetalRotation = (progress) => {
        const rotProgress = clamp01(progress / CONFIG.rotation.rotationEnd);
        lotusOuter.style.transform = `rotate(${rotProgress * CONFIG.rotation.outer}deg)`;
        lotusMid.style.transform = `rotate(${rotProgress * CONFIG.rotation.mid}deg)`;
        lotusInner.style.transform = `rotate(${rotProgress * CONFIG.rotation.inner}deg)`;
    };

    const getScrollProgress = () => {
        const rect = container.getBoundingClientRect();
        const scrollableHeight = container.offsetHeight - window.innerHeight;
        return clamp01(-rect.top / scrollableHeight);
    };

    // 0% - 30%: Lotus fades in on top of hero text.
    const renderFadeIn = (progress) => {
        const p = progress / CONFIG.phases.fadeInEnd;

        lotus.style.opacity = p;
        lotus.style.transform = `scale(${CONFIG.fadeIn.minScale + p * CONFIG.fadeIn.scaleGrowth})`;
        applyPetalRotation(progress);

        heroContent.style.opacity = 1 - p * CONFIG.fadeIn.heroFadeAmount;
        whiteFill.style.opacity = 0;
        details.style.opacity = 0;
    };

    // 30% - 70%: Lotus zooms and covers the text, fading the screen to white.
    const renderZoom = (progress) => {
        const p = (progress - CONFIG.phases.fadeInEnd) /
            (CONFIG.phases.zoomEnd - CONFIG.phases.fadeInEnd);

        lotus.style.opacity = 1;
        lotus.style.transform = `scale(${1 + p * CONFIG.zoom.maxScale})`;
        applyPetalRotation(progress);

        heroContent.style.opacity = 1 - p * CONFIG.zoom.heroFadeMultiplier;

        whiteFill.style.opacity = p > CONFIG.zoom.whiteFillStart
            ? (p - CONFIG.zoom.whiteFillStart) * CONFIG.zoom.whiteFillSpeed
            : 0;

        details.style.opacity = 0;
        details.classList.remove('active');
    };

    // 70% - 100%: Reveal the wedding details.
    const renderDetails = (progress) => {
        const p = (progress - CONFIG.phases.zoomEnd) / (1 - CONFIG.phases.zoomEnd);

        lotus.style.opacity = 0;
        heroContent.style.opacity = 0;
        whiteFill.style.opacity = 1;

        details.style.opacity = p;
        details.style.transform = `translateY(${CONFIG.details.slideDistance * (1 - p)}px)`;
        details.classList.add('active');
    };

    const render = () => {
        const progress = getScrollProgress();

        if (progress <= CONFIG.phases.fadeInEnd) {
            renderFadeIn(progress);
        } else if (progress <= CONFIG.phases.zoomEnd) {
            renderZoom(progress);
        } else {
            renderDetails(progress);
        }
    };

    window.addEventListener('scroll', render);
    render();

    // Background music: browsers block unprompted audio, so retry on the
    // first user gesture if the initial autoplay attempt is rejected.
    const music = document.getElementById('bg-music');
    const gestures = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

    const startMusic = () => {
        music.play()
            .then(() => gestures.forEach(e => window.removeEventListener(e, startMusic)))
            .catch(() => {});
    };

    gestures.forEach(e => window.addEventListener(e, startMusic, { passive: true }));
    startMusic();
});
