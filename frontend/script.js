'use strict';

/* DEPRECATED: The application logic was migrated to `src/main.js` (ES module).
   The minimal inline script in `index.html` now sets `is-page-loading` during parsing.
   Keep this file for reference during migration, do not include it in HTML.
*/

/**
 * ==========================================
 * VIDEO OPTIMIZER COMPONENT
 * ==========================================
 */
class VideoOptimizer {
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
        };

        this.video.addEventListener('loadeddata', showVideo);
        this.video.addEventListener('playing', showVideo);
        
        setTimeout(() => {
            if (!this.video.error) showVideo();
        }, 3000);

        this.video.load();
        
        const playPromise = this.video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => showVideo());
        }
    }
}

/**
 * ==========================================
 * MAIN APPLICATION CONTROLLER
 * ==========================================
 */
const App = {
    config: {
        loaderId: 'page-loader',
        loaderHideClass: 'is-hiding',
        loadingStateClass: 'is-page-loading',
        videoPath: '/src/assets/videos/hero.mp4'
    },

    init() {
        this.safeRun(this.initMobileMenu, 'Mobile Menu');
        this.safeRun(this.initSmoothScroll, 'Smooth Scroll');
        this.safeRun(this.initHeaderScroll, 'Header Scroll');
        this.safeRun(this.initSlideshow, 'Slideshow');
        this.safeRun(() => this.initVideo(), 'Video');
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
        if (!header) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 50);
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

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
