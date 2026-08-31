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
        maxScale: 8,
        heroFadeMultiplier: 2,  // hero text fades out twice as fast (gone by mid-phase)
        // The white fill — not the lotus — is what hides the hero photo, and it
        // completes early so a dropped lotus frame can never expose the photo.
        whiteFillStart: 0.1,
        whiteFillEnd: 0.45,
        lotusFadeStart: 0.35,   // fades out as the fill completes, so the pale
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

// Guest personalisation. The invite is shared as a per-guest link
// (?m=MR&f=First&l=Last), and those values fill the {{title}}/{{firstName}}/
// {{lastName}} placeholders in the markup. Runs at parse time — the script sits
// at the end of <body>, so the nodes exist and no placeholder is ever painted.
(() => {
    const params = new URLSearchParams(window.location.search);
    const clean = (value) => (value || '').replace(/\s+/g, ' ').trim();

    // Honorifics are a closed set: anything else in the link is ignored rather
    // than printed, so a stray ?m= value can never land on the invite.
    const TITLES = { MR: 'Mr.', MRS: 'Mrs.', MS: 'Ms.' };

    const values = {
        title: TITLES[clean(params.get('m')).toUpperCase()] || '',
        firstName: clean(params.get('f')),
        lastName: clean(params.get('l')),
    };

    // Walk text nodes and swap placeholders. Assigning to nodeValue keeps the
    // guest name as text, so a name in the URL can never inject markup.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.nodeValue.includes('{{')) continue;
        node.nodeValue = node.nodeValue.replace(
            /\{\{(\w+)\}\}/g,
            (match, key) => (key in values ? values[key] : match)
        );
    }

    // With no name in the link the greeting line would be an honorific or a
    // blank, so drop it entirely and let the invite stand on its own.
    const guestName = document.querySelector('.guest-name');
    if (!values.firstName && !values.lastName) {
        guestName?.remove();
    } else if (!values.title) {
        // Nothing filled the {{title}} slot; trim the space it left behind.
        guestName?.normalize();
        const first = guestName?.firstChild;
        if (first?.nodeType === Node.TEXT_NODE) first.nodeValue = first.nodeValue.trimStart();
    }
})();


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

    // Scroll geometry is cached and refreshed on resize. Reading it per frame
    // (via getBoundingClientRect) forces a synchronous layout on every scroll
    // event, which is a large part of the jank on mobile.
    let containerTop = 0;
    let scrollableHeight = 1;

    const measure = () => {
        containerTop = container.offsetTop;
        scrollableHeight = Math.max(1, container.offsetHeight - window.innerHeight);
    };

    const getScrollProgress = () =>
        clamp01((window.scrollY - containerTop) / scrollableHeight);

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

    // Coalesce scroll events into at most one render per animation frame.
    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            render();
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        measure();
        onScroll();
    });

    measure();
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
