# MegaBerry site

Static redesign of megaberry.com - Dark multi-page HTML, CSS and vanilla JS, no build step and no dependencies. It is a front-end demo for review: nothing uploads, generates or charges for real.

**`hello.html` is the up-to-date reference** for every page, feature and hidden control. Read it first; this README only covers how to run and edit the site.

## Run it locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Opening files straight from disk mostly works, but root-absolute links like `/studio` need a server.

## Deploy (Cloudflare Workers, assets only)

```bash
npx wrangler deploy
```

- `wrangler.jsonc` serves this folder as static assets with no Worker script. Unknown URLs return `404.html` with a 404 status.
- `.assetsignore` keeps the config, this README, `*.bak` and `.DS_Store` out of the deploy.
- Cloudflare serves `studio.html` as `/studio`. Check after the first deploy whether `/studio.html` redirects.
- The deploy is publicly readable. Pages carry `noindex`, but `robots.txt` allows crawling. Use Cloudflare Access if it should be private.

## Structure

```
├── *.html             41 pages (marketing, auth, studio, tools, settings, support, legal)
├── hello.html         Developer reference: all pages, features, hidden controls
├── page-template.html Blank starter with the shell wired up
├── 404.html           Not-found page (quick links)
├── robots.txt, sitemap.xml
├── wrangler.jsonc, .assetsignore
└── assets/
    ├── css/
    │   ├── main.css        Entry point; imports the rest in order
    │   ├── tokens.css      Colours, type, spacing, radii
    │   ├── base.css        Reset and element defaults
    │   ├── layout.css      Header, footer, sections, grids
    │   ├── components.css  Cards, plans, table, FAQ, forms, frames
    │   ├── pages.css       Page-specific styles
    │   └── docs.css        Docs layout (developers page)
    ├── js/
    │   ├── layout.js       Sidebar, nav, pins, account menu, dev toggle, theme, Cmd+K, footer
    │   ├── main.js         Settings, credits dialog, avatar and train dialogs, affiliate, feature requests, demo data
    │   ├── tools.js        Shared behaviour for pages with data-tool
    │   └── docs.js         Legal and docs pages
    ├── vendor/glass/       glass-lite.css (MIT glass kit, imported by main.css)
    ├── img/, video/, fonts/
```

A few pages (apex-image, outfit-generator, clear-meta, downloader, gif-maker, fanplace-likes) also have inline scripts.

## Editing conventions

- New styles are **appended to the end of `pages.css`** in labelled blocks. Later rules win over `components.css`.
- Colours, fonts and spacing live in `tokens.css`.
- Header, sidebar and footer are rendered by `layout.js`, so they match on every page. Edit links there.
- To add a page: copy `page-template.html`, set the title, description and `data-page`, add it to the nav or footer in `layout.js`, and add it to `sitemap.xml` and `hello.html`.
- Buttons use the `gk-btn` classes from `glass-lite.css`.

## Demo state

- Dev toggle (`localStorage.mb.devmode`): `linked` = Pro, 2,450 credits and a linked avatar; `none` = Free, 0 credits and no avatar.
- Other keys: `mb.theme` (`light` or absent), `mb.side` (`collapsed` or absent), `mb.nav.open`, `mb.pins`.
- Light and dark themes both exist.
- Default demo user is Stephen.

## Before launch

- Real media: every image and video slot is a `.frame` placeholder. Replace the placeholder with an `<img>` or `<video>` from `assets/img/` or `assets/video/`.
- Auth and payments: sign-in, create account, Google, Apple, checkout and the delete-account flow are front-end only. TODO comments mark where real calls go. The delete dialog asks for a 2FA code but does not check whether 2FA is enabled.
- Placeholder data: Avatar Settings variables, Apex Analyze video costs above Standard (only 3 is real), outfit catalogue articles.
- Contact form endpoint: `formEndpoint` in `layout.js`.
- Legal: paste the real Privacy and Terms text.
- Logo: `assets/img/logo-mark.png` is 64x64 and looks soft on large displays. Replace it with an SVG or a 256px+ PNG, or change `MARK` in `layout.js` and the favicon link.
- Fonts load from Google Fonts. To self-host, add the files to `assets/fonts/` and `@font-face` rules to `tokens.css`.
- Cleanup: `assets/js/layout.js.bak` and `megaberry-site.zip` can go.
