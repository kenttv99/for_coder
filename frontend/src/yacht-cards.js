'use strict';

// Hover-swipe image frames for yacht cards
// - Supports per-card galleries via data attributes:
//   * `data-gallery-prefix="val"` will load frames by prefix (val1.jpg, val-1.png, etc.)
//   * `data-gallery-list='["/path/img1.jpg","/path/img2.jpg"]'` to provide an explicit list
// - The loader tries patterns like val1.jpg, val-1.jpg, val1.png, val-1.png until it stops finding frames
// - Falls back to default /src path if images aren't found relative to the card image

const MAX_FRAMES = 12;
const MISS_LIMIT = 3;
const TRY_TIMEOUT = 1200; // ms per image attempt
const AUTOPLAY_INTERVAL = 1200; // ms between automatic frame changes
const AUTOPLAY_RESUME_DELAY = 1500; // ms to resume autoplay after user interaction

function tryLoadImage(url, timeout = TRY_TIMEOUT) {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const onLoad = () => { if (settled) return; settled = true; resolve({ ok: true, url }); };
    const onError = () => { if (settled) return; settled = true; resolve({ ok: false }); };
    const timer = setTimeout(() => { onError(); }, timeout);

    img.onload = () => { clearTimeout(timer); onLoad(); };
    img.onerror = () => { clearTimeout(timer); onError(); };
    img.src = url;
  });
}

async function loadSequence(prefix, baseDir = null) {
  console.debug('[yacht-cards] loadSequence prefix=', prefix, 'baseDir=', baseDir);
  const frames = [];
  let missCount = 0;

  for (let i = 1; i <= MAX_FRAMES && missCount < MISS_LIMIT; i++) {
    const candidates = baseDir ? [
      `${baseDir}/cards/${prefix}${i}.jpg`,
      `${baseDir}/cards/${prefix}-${i}.jpg`,
      `${baseDir}/cards/${prefix}_${i}.jpg`,
      `${baseDir}/cards/${prefix}${i}.png`,
      `${baseDir}/cards/${prefix}-${i}.png`,
      `${baseDir}/cards/${prefix}_${i}.png`
    ] : [
      `/src/assets/images/cards/${prefix}${i}.jpg`,
      `/src/assets/images/cards/${prefix}-${i}.jpg`,
      `/src/assets/images/cards/${prefix}_${i}.jpg`,
      `/src/assets/images/cards/${prefix}${i}.png`,
      `/src/assets/images/cards/${prefix}-${i}.png`,
      `/src/assets/images/cards/${prefix}_${i}.png`
    ];

    let found = false;
    for (const c of candidates) {
      console.debug('[yacht-cards] trying', c);
      // eslint-disable-next-line no-await-in-loop
      const res = await tryLoadImage(c);
      if (res.ok) { frames.push(res.url); found = true; console.debug('[yacht-cards] loaded', res.url); break; }
      else { console.debug('[yacht-cards] failed', c); }
    }

    if (!found) missCount++; else missCount = 0;
  }

  console.debug('[yacht-cards] loadSequence result', frames.length, frames);
  return frames;
}

async function preloadGalleryForCard(card) {
  const titleEl = card.querySelector('.yacht-title');
  const img = card.querySelector('.yacht-image');
  if (!img || !titleEl) return null;

  const title = titleEl.textContent?.trim() || '';
  
  // Определяем источник галереи
  const explicitListRaw = card.dataset.galleryList || card.querySelector('.yacht-image-wrapper')?.dataset.galleryList;
  let explicitList = null;
  if (explicitListRaw) {
    try {
      explicitList = JSON.parse(explicitListRaw);
      if (!Array.isArray(explicitList)) explicitList = null;
    } catch (e) {
      explicitList = null;
    }
  }
  const prefix = card.dataset.galleryPrefix || card.querySelector('.yacht-image-wrapper')?.dataset.galleryPrefix || null;
  if (!explicitList && !prefix) return null;

  // Получаем baseDir из оригинального изображения
  const original = img.dataset.originalSrc || img.src || '';
  let baseDir = null;
  try {
    if (original && original.includes('/')) {
      const parts = original.split('/');
      parts.pop();
      baseDir = parts.join('/');
    }
  } catch (e) { baseDir = null; }

  let frames = null;
  if (explicitList && explicitList.length) {
    frames = explicitList.slice();
  } else if (prefix) {
    frames = await loadSequence(prefix, baseDir);
    if (!frames.length && baseDir) {
      frames = await loadSequence(prefix, null);
    }
  }

  return frames;
}

export async function initYachtCardHover() {
  const cards = document.querySelectorAll('.yacht-card');
  console.debug('[yacht-cards] initYachtCardHover: found', cards.length, 'cards');
  if (!cards.length) return;

  // Фоновая предзагрузка галерей для всех карточек
  const preloadPromises = Array.from(cards).map(async (card, index) => {
    const frames = await preloadGalleryForCard(card);
    if (frames) {
      card.dataset.preloadedFrames = JSON.stringify(frames);
      console.debug('[yacht-cards] preloaded frames for card', index, frames.length);
    }
  });
  
  cards.forEach(card => {
    const titleEl = card.querySelector('.yacht-title');
    const wrapper = card.querySelector('.yacht-image-wrapper');
    const img = card.querySelector('.yacht-image');
    if (!wrapper || !img || !titleEl) return;

    // Friendly title string used for image alts and logging
    const title = titleEl.textContent?.trim() || '';

    // Save original src
    if (!img.dataset.originalSrc) img.dataset.originalSrc = img.src;

    // state - восстанавливаем из data-атрибутов если есть
    let frames = card.dataset.frames ? JSON.parse(card.dataset.frames) : null;
    let gallery = null;
    let galleryImgs = null;
    let lastX = null;
    let curr = card.dataset.curr ? parseInt(card.dataset.curr, 10) : 0;
    let moveRaf = null; // requestAnimationFrame id for movement handling
    let autoplayTimer = null;
    let resumeTimer = null;

    // Функция для сохранения состояния в data-атрибуты
    const saveState = () => {
      if (frames) {
        card.dataset.frames = JSON.stringify(frames);
      }
      card.dataset.curr = curr.toString();
    };

    const showFrame = (idx) => {
      if (!galleryImgs || !galleryImgs.length) { console.debug('[yacht-cards] showFrame: no galleryImgs'); return; }
      idx = Math.max(0, Math.min(galleryImgs.length - 1, Math.floor(idx)));
      if (curr === idx) return;
      console.debug('[yacht-cards] showFrame', { from: curr, to: idx, src: galleryImgs[idx] && galleryImgs[idx].src });

      // fade previous out, new in
      try { if (galleryImgs[curr]) galleryImgs[curr].style.opacity = '0'; } catch(e){}
      try { if (galleryImgs[idx]) galleryImgs[idx].style.opacity = '1'; } catch(e){}
      curr = idx; 
      saveState();

      // update indicators if present
      const dots = gallery && gallery.querySelectorAll('.yacht-gallery-dot');
      if (dots && dots.length) {
        dots.forEach((d, i) => d.classList.toggle('active', i === curr));
      }
    };

    const startAutoplay = () => {
      if (autoplayTimer) return;
      console.debug('[yacht-cards] startAutoplay');
      autoplayTimer = setInterval(() => { try { showFrame(curr + 1); } catch (e) { /* ignore */ } }, AUTOPLAY_INTERVAL);
    };

    const stopAutoplay = () => {
      console.debug('[yacht-cards] stopAutoplay');
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
      if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
    };

    const pauseAutoplay = () => {
      console.debug('[yacht-cards] pauseAutoplay');
      stopAutoplay();
      // resume after short inactivity
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { startAutoplay(); resumeTimer = null; }, AUTOPLAY_RESUME_DELAY);
    };

    const showSkeleton = () => {
      if (wrapper.querySelector('.yacht-gallery-skeleton')) return;
      const sk = document.createElement('div');
      sk.className = 'yacht-gallery-skeleton';
      // basic inline sizing; styles handled in CSS
      sk.style.position = 'absolute';
      sk.style.left = '0';
      sk.style.top = '0';
      sk.style.width = '100%';
      sk.style.height = '100%';
      sk.style.pointerEvents = 'none';
      wrapper.appendChild(sk);
    };

    const removeSkeleton = () => {
      const sk = wrapper.querySelector('.yacht-gallery-skeleton');
      if (sk) try { wrapper.removeChild(sk); } catch (e) {}
    };

    const createImageElement = (url, index) => new Promise((resolve) => {
      const gimg = document.createElement('img');
      gimg.className = 'yacht-gallery-img';
      gimg.dataset.index = index;
      gimg.src = url;
      gimg.style.position = 'absolute';
      gimg.style.left = '0';
      gimg.style.top = '0';
      gimg.style.width = '100%';
      gimg.style.height = '100%';
      gimg.style.objectFit = 'cover';
      gimg.style.opacity = '0';
      gimg.style.transition = 'opacity 220ms ease';
      gimg.alt = `${title} frame ${index + 1}`;
      const onLoad = () => { console.debug('[yacht-cards] gallery image loaded', { index, url, naturalWidth: gimg.naturalWidth }); resolve({ ok: true, img: gimg, index }); };
      const onError = () => { console.debug('[yacht-cards] gallery image error', { index, url }); resolve({ ok: false, index }); };
      gimg.onload = onLoad;
      gimg.onerror = onError;
    });

    const createGallery = async (frameUrls) => {
      if (gallery) return;
      if (!frameUrls || !frameUrls.length) { removeSkeleton(); return; }

      // Create local gallery element and attach early so we can stream images as they load
      const localGallery = document.createElement('div');
      localGallery.className = 'yacht-image-gallery';
      localGallery.style.pointerEvents = 'none';
      
      // Добавляем класс для изменения курсора
      wrapper.classList.add('yacht-gallery-active');

      // Prepare slots to keep order even when images load out-of-order
      const slots = new Array(frameUrls.length).fill(null);

      // Ensure wrapper positioning and attach localGallery immediately
      const computed = window.getComputedStyle(wrapper);
      if (computed.position === 'static' || !computed.position) wrapper.style.position = 'relative';
      wrapper.appendChild(localGallery);

      // Commit to state early so interactions are consistent
      gallery = localGallery;
      galleryImgs = [];

      // Indicators container (will be populated as images arrive)
      const indicators = document.createElement('div');
      indicators.className = 'yacht-gallery-indicators';
      localGallery.appendChild(indicators);

      let firstShown = false;

      const onFirstLoaded = () => {
        if (firstShown) return; firstShown = true;
        // Slightly dim but keep price visible
        const priceEl = wrapper.querySelector('.yacht-price');
        if (priceEl) { priceEl.style.transition = 'opacity 200ms ease'; priceEl.style.opacity = '0.18'; }
        // hide original image visually but keep it for accessibility
        img.style.visibility = 'hidden';
        removeSkeleton();
        startAutoplay();
      };

      // Start loading images in parallel and append them as they succeed
      const loadPromises = frameUrls.map((url, index) => createImageElement(url, index).then((res) => {
        if (!res.ok) return res;
        const gimg = res.img;

        // Insert image in DOM in the correct order (before indicators)
        const existingImgs = Array.from(localGallery.querySelectorAll('.yacht-gallery-img'));
        let inserted = false;
        for (const child of existingImgs) {
          const ci = parseInt(child.dataset.index, 10);
          if (ci > index) {
            localGallery.insertBefore(gimg, child);
            inserted = true;
            break;
          }
        }
        if (!inserted) localGallery.insertBefore(gimg, indicators);

        slots[index] = gimg;
        // refresh compact list of loaded images in order
        galleryImgs = slots.filter(Boolean);

        // If this is the first successfully loaded frame, reveal it immediately
        if (!firstShown) {
          gimg.style.opacity = '1';
          curr = 0;
          onFirstLoaded();
        }

        // Rebuild indicators to match currently available frames
        indicators.innerHTML = '';
        galleryImgs.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `yacht-gallery-dot${i===curr ? ' active' : ''}`;
          dot.ariaLabel = `Frame ${i+1}`;
          dot.dataset.index = i;
          dot.addEventListener('click', () => { showFrame(i); });
          indicators.appendChild(dot);
        });

        return res;
      }));

      // Wait for all attempts to finish; if none succeeded, cleanup
      const results = await Promise.all(loadPromises);
      const successCount = results.filter(r => r && r.ok).length;
      if (!successCount) {
        console.debug('[yacht-cards] createGallery: no images loaded, abort');
        removeGallery();
        removeSkeleton();
        return;
      }

      // Ensure galleryImgs reflects final set and reset current index
      galleryImgs = slots.filter(Boolean);
      curr = 0;
      saveState();

      // Update active dot
      const dots = gallery && gallery.querySelectorAll('.yacht-gallery-dot');
      if (dots && dots.length) dots.forEach((d, i) => d.classList.toggle('active', i === curr));
    }; // end createGallery

    const removeGallery = () => {
      // Always remove skeleton if present
      removeSkeleton();

      if (!gallery) return;
      stopAutoplay();
      if (moveRaf) { cancelAnimationFrame(moveRaf); moveRaf = null; }
      try { wrapper.removeChild(gallery); } catch (e) {}
      gallery = null;
      galleryImgs = null;
      curr = 0;
      // Удаляем класс для изменения курсора
      wrapper.classList.remove('yacht-gallery-active');
      // restore price opacity if we dimmed it
      const priceEl = wrapper.querySelector('.yacht-price');
      if (priceEl) { priceEl.style.opacity = ''; }
      img.style.visibility = '';
    };

    const onEnter = async () => {
      // If frames already loaded (from a previous hover or preloading), recreate the gallery immediately
      if (frames !== null && frames.length > 0) {
        if (!gallery) {
          console.debug('[yacht-cards] onEnter: frames cached, recreate gallery');
          await createGallery(frames);
          // Восстанавливаем текущий индекс кадра
          if (galleryImgs && galleryImgs.length) {
            showFrame(curr);
          }
        }
        return;
      }

      // Try to get preloaded frames first
      const preloadedFrames = card.dataset.preloadedFrames;
      if (preloadedFrames) {
        try {
          frames = JSON.parse(preloadedFrames);
          console.debug('[yacht-cards] onEnter: using preloaded frames', frames.length);
          if (frames.length > 0) {
            await createGallery(frames);
            // Восстанавливаем текущий индекс кадра
            if (galleryImgs && galleryImgs.length) {
              showFrame(curr);
            }
            return;
          }
        } catch (e) {
          console.debug('[yacht-cards] onEnter: failed to parse preloaded frames', e);
        }
      }

      // If no preloaded frames available, show skeleton and load on demand
      showSkeleton();

      // If we've already attempted loading frames and found none, skip further attempts
      if (frames !== null && frames.length === 0) { removeSkeleton(); return; }

      // Derive baseDir from current image src so loader works both in dev and production builds
      const original = img.dataset.originalSrc || img.src || '';
      let baseDir = null;
      try {
        if (original && original.includes('/')) {
          const parts = original.split('/');
          parts.pop(); // remove filename
          baseDir = parts.join('/');
        }
      } catch (e) { baseDir = null; }

      console.debug('[yacht-cards] onEnter derived baseDir=', baseDir, 'original=', original);

      // Determine gallery source: explicit list in data-gallery-list (JSON array) or prefix in data-gallery-prefix
      const explicitListRaw = card.dataset.galleryList || wrapper.dataset.galleryList;
      let explicitList = null;
      if (explicitListRaw) {
        try {
          explicitList = JSON.parse(explicitListRaw);
          if (!Array.isArray(explicitList)) explicitList = null;
        } catch (e) {
          explicitList = null;
        }
      }
      const prefix = card.dataset.galleryPrefix || wrapper.dataset.galleryPrefix || null;

      if (explicitList && explicitList.length) {
        frames = explicitList.slice();
        console.debug('[yacht-cards] onEnter using explicit list frames count=', frames.length, frames);
      } else if (prefix) {
        frames = await loadSequence(prefix, baseDir);
        console.debug('[yacht-cards] onEnter frames count=', frames.length, frames);

        // If nothing found with baseDir try fallback to default /src path
        if (!frames.length && baseDir) {
          console.debug('[yacht-cards] onEnter: fallback to default path');
          frames = await loadSequence(prefix, null);
          console.debug('[yacht-cards] onEnter fallback frames count=', frames.length, frames);
        }
      } else {
        frames = [];
      }

      if (!frames.length) {
        // no frames found; keep original image
        frames = [];
        removeSkeleton();
        return;
      }

      // build gallery and show first frame
      await createGallery(frames);
      // Восстанавливаем текущий индекс кадра
      if (galleryImgs && galleryImgs.length) {
        showFrame(curr);
      }
    };

    const onMove = (e) => {
      if (!galleryImgs || !galleryImgs.length) return;
      // pause autoplay while user is interacting
      pauseAutoplay();

      // Normalize clientX (support mouse and touch events)
      const clientX = (e && e.clientX != null) ? e.clientX : (e && e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      if (!clientX) return;

      if (moveRaf) return; // already scheduled
      moveRaf = requestAnimationFrame(() => {
        try {
          const rect = wrapper.getBoundingClientRect();
          const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
          const idx = Math.floor((x / rect.width) * galleryImgs.length);
          showFrame(idx);
        } finally { moveRaf = null; }
      });
    };

    const onLeave = () => {
      // restore original
      removeGallery();
      if (moveRaf) { cancelAnimationFrame(moveRaf); moveRaf = null; }
      lastX = null;
      // Не сбрасываем curr и frames - сохраняем состояние для следующего наведения
    };

    wrapper.addEventListener('mouseenter', onEnter);
    wrapper.addEventListener('mousemove', onMove);
    wrapper.addEventListener('mouseleave', onLeave);

    // Accessibility: also respond to touchmove
    wrapper.addEventListener('touchstart', onEnter, { passive: true });
    wrapper.addEventListener('touchmove', (e) => {
      if (!frames || !frames.length) return;
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      // emulate mouse movement
      onMove({ clientX: touch.clientX });
    }, { passive: true });
    wrapper.addEventListener('touchend', onLeave);
  });
}
