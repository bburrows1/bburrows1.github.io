# Cloudflare Monorepo

This repository contains:

- `pages/diggers4u`: static Cloudflare Pages site for DIGGERS4U.
- `pages/luscombefarm`: single-page Vite + Cloudflare Pages site for Luscombe Farm Storage.
- `workers/diggers4u-worker`: existing Worker used for enquiry email handling.

## Repository layout

```text
pages/
  diggers4u/
  luscombefarm/
    package.json
    vite.config.js
    wrangler.toml
    index.html
    public/_headers
    public/404.html
    public/robots.txt
    public/sitemap.xml
    src/
      main.js
      styles.css
workers/
  diggers4u-worker/
    wrangler.toml
    src/index.ts
scripts/
  release.sh
Makefile
```

## Luscombe Farm local development (`pages/luscombefarm`)

```bash
cd pages/luscombefarm
npm install
npm run dev
```

Additional scripts:

- `npm run build`: builds to `dist/`
- `npm run preview`: previews the production build locally
- `npm run deploy`: deploys `dist/` to Cloudflare Pages project `luscombefarm`
- `npm run format`: formats HTML/CSS/JS/JSON files
- `npm run format:check`: verifies formatting

## Luscombe Farm Cloudflare Pages settings

Use these settings when creating the Pages project:

- Root directory: `pages/luscombefarm`
- Build command: `npm run build`
- Build output directory: `dist`

Canonical production URL: `https://www.luscombefarm.co.uk/`

Luscombe SEO files:

- `public/robots.txt`
- `public/sitemap.xml`
- `public/_headers` (includes `X-Robots-Tag: noindex, nofollow` for `luscombefarm.pages.dev`)

## Worker routing note for Luscombe Farm

The existing `workers/diggers4u-worker` can still be mapped to `/api/contact` in future if a Luscombe contact form is added.

## Existing diggers4u site

`pages/diggers4u` deploys as a static Pages site.

Canonical production URL: `https://www.diggers4u.co.uk/`

## Make targets

- `make release`: runs the existing `scripts/release.sh` workflow.
- `make deploy-luscombefarm`: deploys the new Luscombe Farm Pages project.
