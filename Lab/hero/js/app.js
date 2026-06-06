'use strict';

(function () {
  const heroEl = document.getElementById('hero');
  const mosaicBand = document.getElementById('mosaicBand');

  if (!heroEl || !mosaicBand) {
    console.warn('Orpita: hero or mosaic elements not found.');
    return;
  }

  let engine = null;

  const createEngine = () => {
    engine = new ORPITA.MosaicEngine(mosaicBand, {
      gapPx: 3,
      mobileBreakpoint: 768,
      resizeDebounce: 250,
    });
  };

  const revealHero = () => {
    heroEl.classList.add('hero--loaded');
  };

  const animateInNextFrame = () => {
    requestAnimationFrame(() => requestAnimationFrame(revealHero));
  };

  const setupVisibilityPause = () => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        mosaicBand.style.animationPlayState = isVisible ? 'running' : 'paused';
      },
      { threshold: 0.1 }
    );

    observer.observe(heroEl);
  };

  const onOrientationChange = () => {
    setTimeout(() => {
      heroEl.classList.remove('hero--loaded');
      if (engine) engine.rebuild();
      requestAnimationFrame(() => requestAnimationFrame(revealHero));
    }, 200);
  };

  const init = () => {
    createEngine();
    animateInNextFrame();
    setupVisibilityPause();
    window.addEventListener('orientationchange', onOrientationChange);
  };

  window.ORPITA = window.ORPITA || {};
  window.ORPITA.destroyHero = () => {
    window.removeEventListener('orientationchange', onOrientationChange);
    if (engine) {
      engine.destroy();
      engine = null;
    }
    heroEl.classList.remove('hero--loaded');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();