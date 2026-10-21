# Technology stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Markup | Semantic HTML5, fifteen entrypoints | Direct navigation and simple local hosting |
| Styling | Plain CSS, custom properties, Grid/Flexbox, media queries | Shared visual tokens and responsive layouts |
| Behavior | Vanilla JavaScript native modules | No framework or shipped dependency |
| Persistence | localStorage, sessionStorage | Browser-local educational workflows |
| Credential demonstration | Web Crypto PBKDF2 / SHA-256 | Salted password digests, not plaintext |
| Images | Eighteen optimized WebP assets | Original generated scenery with dimensions and lazy loading |
| Fonts | Local DM Serif Display, Manrope | Consistent typography without third-party runtime requests |
| Preview | Small Node HTTP server | No bundler or build step |
| Unit tests | Node built-in test runner | Pricing, filtering, escaping, redirect rules |
| Browser tests | Playwright, Chromium | Multi-page flows and responsive checks |
| Asset tooling | sharp | Development-only WebP optimization |
| Design | Editable Figma nodes and components | Design handoff and token/component reference |

Node 22+ is the project requirement; the verification environment used Node 26.10.0. Exact development dependency versions are pinned by `package-lock.json`.

The shipped site is the `dist` directory. Despite that name, it contains the authored source, not a framework build. `npm start` uses Node built-ins only. `npm ci` is needed for browser tests and asset tooling.

Local font source projects: [Google Fonts / DM Serif Display](https://github.com/google/fonts/tree/main/ofl/dmserifdisplay), [Google Fonts / Manrope](https://github.com/google/fonts/tree/main/ofl/manrope). License texts accompany each font in `dist/assets/fonts`.
