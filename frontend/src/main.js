'use strict';

import { VideoOptimizer } from './video-optimizer.js';
import { initYachtCardHover } from './yacht-cards.js';

// Application controller (modular, easy to test and extend)
const App = {
  config: {
    loaderId: 'page-loader',
    loaderHideClass: 'is-hiding',
    loadingStateClass: 'is-page-loading',
    videoPath: '/src/assets/videos/hero.mp4'
  },

  init() {
    // Ensure we have the loading class (inline script should already set it).
    if (!document.documentElement.classList.contains(this.config.loadingStateClass)) {
      document.documentElement.classList.add(this.config.loadingStateClass);
    }

    this.safeRun(this.initMobileMenu, 'Mobile Menu');
    this.safeRun(this.initSmoothScroll, 'Smooth Scroll');
    this.safeRun(this.initHeaderScroll, 'Header Scroll');
    this.safeRun(this.initSlideshow, 'Slideshow');
    this.safeRun(() => this.initVideo(), 'Video');
    this.safeRun(initYachtCardHover, 'Yacht Card Hover');
    this.scheduleLoaderHide();
  },

  safeRun(fn, name) {
    try {
      fn.call(this);
    } catch (err) {
      console.warn(`[App] Failed to init ${name}:`, err);
    }
  },

  scheduleLoaderHide() {
    const hide = () => {
      const minVisible = 2000; // ms
      const now = Date.now();
      let elapsed = 0;

      if (window.__pageLoaderStart) {
        // `__pageLoaderStart` is set to epoch ms in index.html
        elapsed = now - window.__pageLoaderStart;
      } else if (performance && performance.timing && performance.timing.navigationStart) {
        elapsed = now - performance.timing.navigationStart;
      } else {
        elapsed = 0;
      }

      if (elapsed < minVisible) {
        if (this._loaderHideTimer) return; // already scheduled
        const remaining = Math.max(0, Math.ceil(minVisible - elapsed));
        this._loaderHideTimer = setTimeout(() => { this._loaderHideTimer = null; hide(); }, remaining);
        return;
      }

      const loader = document.getElementById(this.config.loaderId);
      if (!loader) {
        document.documentElement.classList.remove(this.config.loadingStateClass);
        return;
      }

      if (loader.classList.contains(this.config.loaderHideClass)) return;

      requestAnimationFrame(() => {
        loader.classList.add(this.config.loaderHideClass);
        loader.setAttribute('aria-hidden', 'true');

        const removeLoader = () => {
          loader.remove();
          document.documentElement.classList.remove(this.config.loadingStateClass);
        };

        loader.addEventListener('animationend', removeLoader, { once: true });
        setTimeout(removeLoader, 1000);
      });
    };

    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
      setTimeout(hide, 3000);
    }
  },

  initVideo() {
    const optimizer = new VideoOptimizer('.hero-video', this.config.videoPath);
    optimizer.init();
  },

  initMobileMenu() {
    const burger = document.querySelector('.burger');
    const header = document.querySelector('.header');
    const overlay = document.querySelector('.header-overlay');
    const dropdown = document.querySelector('.header-dropdown');

    if (!burger || !header) return;

    let closeTimerId = null;

    const clearCloseTimer = () => {
      if (closeTimerId) {
        clearTimeout(closeTimerId);
        closeTimerId = null;
      }
    };

    const close = () => {
      if (!header.classList.contains('menu-open') || header.classList.contains('menu-closing')) return;
      header.classList.add('menu-closing');
      clearCloseTimer();
      closeTimerId = setTimeout(() => {
        header.classList.remove('menu-open', 'menu-closing');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        clearCloseTimer();
      }, 900);
    };

    const toggle = () => {
      if (header.classList.contains('menu-open') && !header.classList.contains('menu-closing')) {
        close();
      } else {
        clearCloseTimer();
        header.classList.remove('menu-closing');
        header.classList.add('menu-open');
        burger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
      }
    };

    burger.addEventListener('click', toggle);
    overlay?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
    dropdown?.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  },

  initHeaderScroll() {
    const header = document.querySelector('.header');
    const logoImg = document.querySelector('.logo-img');
    if (!header || !logoImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 50;
          header.classList.toggle('scrolled', isScrolled);
          
          // Переключение логотипов
          if (isScrolled) {
            logoImg.src = '/src/assets/images/logo.svg';
          } else {
            logoImg.src = '/src/assets/images/logo2.svg';
          }
          
          ticking = false;
        });
        ticking = true;
      }
    });
  },

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const header = document.querySelector('.header');
          const headerOffset = header ? header.getBoundingClientRect().height : 0;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      });
    });
  },

  initSlideshow() {
    const slides = document.querySelectorAll('.hero-video, .hero-slide');
    if (slides.length <= 1) return;

    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }
};

// Auto-init pattern similar to previous behavior
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
