# Threelittlewonders 🌟

**Little lessons. Big wonders!** A child-friendly, mobile-ready learning website with foundation skills and sample starter lessons for Classes 1 through 10.

## What's included

- 55 short, grade-appropriate starter lessons across Maths, English, Science, EVS, Social Science, General Knowledge and Computer basics.
- A Foundation and Class 1 to Class 10 selector.
- Search and subject filters.
- Readable lesson cards with clear explanations, examples and mini-challenges.
- Two-question practice quizzes with retry feedback.
- Learning progress and stars stored locally in the browser.
- Responsive design and keyboard-accessible controls.
- No account, ads, analytics, server or external database needed for the prototype.

> **Scope:** These are curated introductory sample lessons. The project does not yet provide a complete board-aligned or NCERT textbook curriculum, lesson videos, accounts or multi-device progress sync.

## Run locally

Open `index.html` in a modern browser. Alternatively, serve this folder locally:

```bash
python3 -m http.server 8000
```

Visit http://localhost:8000.

## Publish on GitHub Pages

1. Use the existing repository `funnyspace/Threelittlewonders`.
2. Upload `index.html`, `styles.css`, `content.js`, `app.js`, `favicon.svg` and `README.md` to its root.
3. In the repository, go to **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Your GitHub Pages URL will normally be `https://funnyspace.github.io/Threelittlewonders/` once deployment completes.

You can also deploy this static site on Netlify, Cloudflare Pages or another static web host.

## Customize

- **Brand**: Edit the heading and footer in `index.html`, along with the palette in `styles.css`.
- **Curriculum**: Add or update lessons in `content.js` using the `add()` helper. All data is local and is not downloaded from a third-party service.
- **Progress**: Stored under the browser key `Threelittlewonders-progress-v1`. The former `threeelittlewonders-progress-v1` key is supported for migration. Clearing browser storage clears progress.

## Future production features

Board-aligned course mapping, comprehensive chapter explanations, richer question banks, teacher/parent dashboards, student authentication, age-appropriate content moderation, multilingual accessibility, and secure synced progress. If accounts for children are introduced, implement suitable child-privacy and parental consent requirements before collecting personal data.

Built with HTML, CSS and vanilla JavaScript; no package installation required.