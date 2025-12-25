Migration notes - Yaht ProCat

Files moved:
- index.html (full site markup)
- style.css
- tawk.js, script.js
- api/ (request.js)
- components/GlobalLoader (loader.css)
- src/assets/ (images, icons, fonts, videos)
- src/main.js, src/video-optimizer.js

Next steps:
1. Run `npm install` in `frontend_new` and `npm run dev` to check the site locally.
2. Verify the loader, hero video, header menu and chat widget.
3. If everything is fine, confirm whether to delete the old `frontend/` folder (I can remove it).

Notes:
- I kept the site as a static HTML site under Vite to preserve SEO (meta tags & OG). For a long-term solution, consider moving to SSG (vite-plugin-ssr, Astro) for pre-rendered pages and an automated sitemap/robots generation.

If you'd like, I can now run `npm install` and start the dev server here—say "Yes, install" to proceed.