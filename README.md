# THE CUT STUDIO

A complete luxury barbershop portfolio concept built with HTML, CSS, and vanilla JavaScript. **Fictional demonstration only — not a real business.** No frameworks, package installation, API keys, analytics, payment services, or booking backend.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open port 8000 in your development browser. All assets are local and all paths work under a GitHub Pages repository subdirectory.

## Booking demo

Choose a service, date within 90 days, and an available time. Mondays are closed; appointment durations must fit within sample opening hours. Required fields, email format, acknowledgement, and future availability are checked. The preview is rendered safely as text. No appointment is made, no emails are sent, and no information is transmitted or persisted in browser storage. Use fictional details. JavaScript is required for the preview; submission is disabled without it.

## Deploy on GitHub Pages

1. In GitHub repository **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. This requires repository administration access.
2. Push to `main`, or run **Actions → Deploy static site to GitHub Pages → Run workflow**.
3. The workflow packages only public site files and deploys them with GitHub's official Pages actions. Expected address: `https://qitaifeng5-lang.github.io/barbershop-demo/`.

The included `.nojekyll` avoids Jekyll processing. No build step or secrets are needed. The workflow does not itself enable Pages in repository settings. Update canonical and Open Graph URLs if moving to another repository or domain.

## Validation

`tests/smoke.py` uses Python Playwright and a local Chromium installation (test tooling only). With the local server running:

```sh
python3 tests/smoke.py
```

The checks cover 360, 390, 768, 1024, 1440, and 1920px layouts, overflow, mobile navigation, keyboard dismissal, booking validation, Monday closure, safe text rendering, no form POST, no browser storage, reset, image loading, internal links, and JavaScript errors. Chromium's path in the test can be adapted for another machine. Reduced motion, keyboard focus, native form controls, semantic landmarks, and a skip link are included.

## Images and customization

See `credits.html` for image provenance. Images are original AI-generated portfolio assets, not actual customer work. Local compressed assets and system fonts keep runtime dependencies and network requests minimal.

Edit content and sample CAD prices in `index.html`, design tokens in `styles.css`, and booking services/hours in `script.js`. Prices, durations, and opening hours must be kept consistent across both files. All business details use explicit fictional labels and the reserved `.example` email domain. There is no Formspree integration or any other form endpoint.
