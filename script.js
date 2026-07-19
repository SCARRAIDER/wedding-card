// Animation configuration — all tunable values live here.
const CONFIG = {
    // Scroll progress boundaries for each animation phase (0 to 1).
    // The details are no longer a scroll phase — they live in their own
    // section below and reveal themselves as it scrolls into view.
    phases: {
        fadeInEnd: 0.4,   // 0% - 40%:   lotus fades in over hero text
        // 40% - 100%: lotus zooms, covering the screen in white
    },

    // Lotus fade-in phase.
    fadeIn: {
        minScale: 0.5,        // starting scale of the lotus
        scaleGrowth: 0.5,     // scale added across the phase (ends at minScale + this)
        heroFadeAmount: 0.5,  // how much the hero text dims during this phase
    },

    // Lotus zoom phase.
    zoom: {
        // Kept deliberately low: mobile GPUs stop painting layers past roughly
        // 4096px, and a lotus scaled beyond that vanishes mid-zoom, exposing
        // the hero photo. 11x of a 300px lotus stays well under the limit while
        // still covering the screen.
        maxScale: 10,
        heroFadeMultiplier: 2,  // hero text fades out twice as fast (gone by mid-phase)
        // The white fill — not the lotus — is what hides the hero photo.
        whiteFillStart: 0.3,
        whiteFillEnd: 0.65,
        lotusFadeStart: 0.6,    // fades out as the fill completes, so the pale
                                // SVG core is not left sitting on a white screen
    },

    // Petal rotation, applied continuously from 0% up to `rotationEnd`.
    rotation: {
        rotationEnd: 0.85,  // scroll progress at which petals stop rotating
        outer: 90,         // final rotation of the outer petals (deg)
        mid: -120,         // final rotation of the middle petals (deg)
        inner: 180,        // final rotation of the inner petals (deg)
    },

};

const clamp01 = (value) => Math.max(0, Math.min(1, value));

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.scroll-container');
    const heroContent = document.querySelector('.hero-content');
    const heroLayer = document.querySelector('.hero-layer');
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
        heroLayer.style.opacity = 1;
        whiteFill.style.opacity = 0;
    };

    // 40% - 100%: Lotus zooms and covers the text, fading the screen to white.
    const renderZoom = (progress) => {
        const p = (progress - CONFIG.phases.fadeInEnd) /
            (1 - CONFIG.phases.fadeInEnd);

        lotus.style.transform = `scale(${1 + p * CONFIG.zoom.maxScale})`;
        applyPetalRotation(progress);

        heroContent.style.opacity = 1 - p * CONFIG.zoom.heroFadeMultiplier;

        // How far the screen has turned white. The white fill covers the hero
        // photo on its own, so the reveal never depends on the lotus painting.
        const cover = clamp01(
            (p - CONFIG.zoom.whiteFillStart) /
            (CONFIG.zoom.whiteFillEnd - CONFIG.zoom.whiteFillStart)
        );

        whiteFill.style.opacity = cover;
        heroLayer.style.opacity = 1 - cover;

        // Fade the lotus out once it has served its purpose, rather than
        // leaving a huge static layer sitting on screen.
        lotus.style.opacity = 1 - clamp01(
            (p - CONFIG.zoom.lotusFadeStart) / (1 - CONFIG.zoom.lotusFadeStart)
        );
    };

    const render = () => {
        const progress = getScrollProgress();

        if (progress <= CONFIG.phases.fadeInEnd) {
            renderFadeIn(progress);
        } else {
            renderZoom(progress);
        }
    };

    window.addEventListener('scroll', render, { passive: true });
    window.addEventListener('resize', render);
    render();

    // Reveal the card once its section scrolls into view.
    new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                details.classList.add('visible');
                observer.disconnect();
            }
        });
    }, { threshold: 0.15 }).observe(details);

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
