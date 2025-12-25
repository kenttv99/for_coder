'use strict';

// VideoOptimizer: small, focused class to handle progressive video loading
export class VideoOptimizer {
  constructor(videoSelector, sourceUrl) {
    this.video = document.querySelector(videoSelector);
    this.sourceUrl = sourceUrl;
    this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  }

  init() {
    if (!this.video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (this.connection) {
      if (this.connection.saveData) return;
      if (['slow-2g', '2g'].includes(this.connection.effectiveType)) return;
    }

    this.loadVideo();
  }

  loadVideo() {
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.loop = true;
    this.video.autoplay = true;

    this.video.setAttribute('muted', '');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('loop', '');

    this.video.src = this.sourceUrl;

    const showVideo = () => {
      if (!this.video.classList.contains('loaded')) {
        this.video.classList.add('loaded');
      }

      // Hide the skeleton placeholder (fade out and remove after transition)
      const skeleton = document.getElementById('hero-skeleton') || document.querySelector('.hero-skeleton');
      if (skeleton && !skeleton.classList.contains('hidden')) {
        skeleton.classList.add('hidden');
        skeleton.addEventListener('transitionend', () => {
          try { skeleton.remove(); } catch (e) { /* ignore */ }
        }, { once: true });
      }
    };

    this.video.addEventListener('loadeddata', showVideo);
    this.video.addEventListener('playing', showVideo);

    setTimeout(() => {
      if (!this.video.error) showVideo();
    }, 3000);

    this.video.load();

    try {
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => showVideo());
      }
    } catch (err) {
      // Play might throw synchronously in some environments
      showVideo();
    }
  }
}
