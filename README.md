# Cloudflare Monorepo

This repository contains:

- `pages/diggers4u`: existing static Cloudflare Pages site.
- `pages/luscombefarm`: new single-page Vite + Cloudflare Pages site.
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
    public/404.html
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

## Future worker routing for Luscombe Farm

The form in `pages/luscombefarm/index.html` posts to:

- `POST /api/contact`

Current form field names (worker contract):

- `Name`
- `Email`
- `Phone Number`
- `Subject`
- `Comment`
- `Company` (honeypot)

For production routing, map `<your-domain>/api/contact` to the existing Worker in `workers/diggers4u-worker`.
No worker code changes are included in the Luscombe Farm site scaffold.

## Existing diggers4u site

`pages/diggers4u` remains unchanged and deploys as a static Pages site.

## Make targets

- `make release`: runs the existing `scripts/release.sh` workflow.
- `make deploy-luscombefarm`: deploys the new Luscombe Farm Pages project.
