/* =============================================
   WEDDING CARD — script.js
   Lotus & White Elegant Theme
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. STAGGERED REVEAL ON LOAD
  ───────────────────────────────────────── */
  const revealTargets = [
    '#cardHeader',
    '#namesSection',
    '#scriptLine',
    '#detailsSection',
    '#cardFooter',
  ];

  // Slight delay so font is loaded and transition is seen
  setTimeout(() => {
    revealTargets.forEach((selector, i) => {
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) el.classList.add('visible');
      }, i * 280);
    });
  }, 300);


  /* ─────────────────────────────────────────
     2. FLOATING LOTUS PETALS
  ───────────────────────────────────────── */
  const container = document.getElementById('petalsContainer');
  const PETAL_COUNT = 18;

  const petalColors = [
    'rgba(201,160,180,0.55)',
    'rgba(240,221,232,0.6)',
    'rgba(200,169,110,0.35)',
    'rgba(201,160,180,0.35)',
    'rgba(255,248,252,0.5)',
  ];

  function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('petal');

    const size   = 8 + Math.random() * 14;           // 8–22 px
    const left   = Math.random() * 100;               // % across
    const delay  = Math.random() * 18;                // s
    const dur    = 14 + Math.random() * 16;           // 14–30 s
    const color  = petalColors[Math.floor(Math.random() * petalColors.length)];
    const skewX  = -20 + Math.random() * 40;         // rotation variety

    petal.style.cssText = `
      width: ${size}px;
      height: ${size * 1.4}px;
      left: ${left}%;
      background: ${color};
      animation-duration: ${dur}s;
      animation-delay: -${delay}s;
      border-radius: ${40 + Math.random() * 40}% ${10 + Math.random() * 20}% ${40 + Math.random() * 40}% ${10 + Math.random() * 20}%;
      transform: rotate(${skewX}deg);
      filter: blur(${Math.random() < 0.3 ? 1 : 0}px);
    `;

    container.appendChild(petal);
  }

  for (let i = 0; i < PETAL_COUNT; i++) createPetal();

  // Occasionally add a fresh petal
  setInterval(() => {
    if (container.children.length < PETAL_COUNT + 6) createPetal();
  }, 3500);


  /* ─────────────────────────────────────────
     3. RIPPLE ON CLICK
  ───────────────────────────────────────── */
  const rippleOverlay = document.getElementById('rippleOverlay');

  document.addEventListener('click', (e) => {
    // Skip if clicking the RSVP button to allow navigation
    if (e.target.closest('.rsvp-btn')) return;

    const circle = document.createElement('div');
    circle.classList.add('ripple-circle');
    circle.style.left   = e.clientX + 'px';
    circle.style.top    = e.clientY + 'px';
    circle.style.width  = '80px';
    circle.style.height = '80px';

    rippleOverlay.appendChild(circle);
    setTimeout(() => circle.remove(), 1300);
  });


  /* ─────────────────────────────────────────
     4. PARALLAX CARD TILT ON MOUSE MOVE
  ───────────────────────────────────────── */
  const cardFrame = document.querySelector('.card-frame');

  document.addEventListener('mousemove', (e) => {
    const { innerWidth: W, innerHeight: H } = window;
    const x = (e.clientX / W - 0.5) * 2;  // -1 to 1
    const y = (e.clientY / H - 0.5) * 2;

    const rotX = -(y * 3).toFixed(2);  // max ±3deg
    const rotY =  (x * 4).toFixed(2);  // max ±4deg

    cardFrame.style.transform = `
      perspective(1200px)
      rotateX(${rotX}deg)
      rotateY(${rotY}deg)
      translateZ(0)
    `;
    cardFrame.style.transition = 'transform 0.1s linear';

    // Subtle shadow shift to reinforce depth
    const shadowX = (x * 12).toFixed(1);
    const shadowY = (y * 8).toFixed(1);
    cardFrame.style.boxShadow = `
      ${shadowX}px ${shadowY}px 60px rgba(58,46,53,0.18),
      0 10px 30px rgba(58,46,53,0.10),
      0 0 0 6px rgba(201,160,180,0.12),
      0 0 0 12px rgba(201,160,180,0.07)
    `;
  });

  // Reset on mouse leave
  document.addEventListener('mouseleave', () => {
    cardFrame.style.transform  = 'perspective(1200px) rotateX(0) rotateY(0)';
    cardFrame.style.transition = 'transform 0.6s ease, box-shadow 0.6s ease';
    cardFrame.style.boxShadow  = '';
  });


  /* ─────────────────────────────────────────
     5. NAMES SPARKLE ON HOVER
  ───────────────────────────────────────── */
  const names = document.querySelectorAll('.name');

  names.forEach((name) => {
    name.addEventListener('mouseenter', () => {
      spawnSparkles(name);
    });
  });

  function spawnSparkles(parent) {
    const count = 8;
    const rect  = parent.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 999;
        width: ${3 + Math.random() * 4}px;
        height: ${3 + Math.random() * 4}px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? '#c9a0b4' : '#c8a96e'};
        left: ${rect.left + Math.random() * rect.width}px;
        top: ${rect.top + Math.random() * rect.height}px;
        opacity: 1;
        transition: transform ${0.6 + Math.random() * 0.6}s ease, opacity ${0.6 + Math.random() * 0.4}s ease;
      `;
      document.body.appendChild(spark);

      requestAnimationFrame(() => {
        spark.style.transform = `translate(${-30 + Math.random() * 60}px, ${-40 - Math.random() * 40}px)`;
        spark.style.opacity   = '0';
      });

      setTimeout(() => spark.remove(), 1200);
    }
  }


  /* ─────────────────────────────────────────
     6. LOTUS ICON PULSE ON SCROLL / IDLE
  ───────────────────────────────────────── */
  const lotusIcon = document.querySelector('.lotus-icon');
  let lastScroll = window.scrollY;

  window.addEventListener('scroll', () => {
    const delta = Math.abs(window.scrollY - lastScroll);
    if (delta > 5) {
      lotusIcon.style.transform = 'scale(1.12) rotate(8deg)';
      lotusIcon.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        lotusIcon.style.transform = '';
        lotusIcon.style.transition = 'transform 0.5s ease';
      }, 500);
    }
    lastScroll = window.scrollY;
  });


  /* ─────────────────────────────────────────
     7. AMBIENT BACKGROUND PULSE (subtle)
  ───────────────────────────────────────── */
  let hueShift = 0;
  setInterval(() => {
    hueShift = (hueShift + 0.4) % 360;
    // Very subtle hue rotation on body gradient — imperceptible but alive
    document.body.style.filter = `hue-rotate(${Math.sin(hueShift * Math.PI / 180) * 4}deg)`;
  }, 80);

});
