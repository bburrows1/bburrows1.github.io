# Cloudflare Monorepo

This repository contains a static Cloudflare Pages site and a Worker-backed contact API:

- `pages/diggers4u`: frontend source (Vite + TypeScript + modular CSS)
- `workers/diggers4u-worker`: contact form Worker (`/api/contact`)

## Repository layout

```text
pages/
  diggers4u/
    wrangler.toml
    index.html
    _headers
    404.html
    error.html
    robots.txt
    sitemap.xml
    resources/
    src/
      main.ts
      contact-form.ts
      styles/
        main.css
        tokens.css
        base.css
        layout.css
        components.css
        contact.css
workers/
  diggers4u-worker/
    wrangler.toml
    src/index.ts
scripts/
  build-static.sh
  release.sh
Makefile
package.json
tsconfig.json
vite.config.ts
```

## Prerequisites

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

## Local development

Run the frontend locally with HMR:

```bash
npm run dev
```

- Dev server URL: `http://localhost:5173`
- Site source root: `pages/diggers4u`

## Build and preview

Build static output:

```bash
npm run build
```

This outputs to:

- `dist/diggers4u`

Preview built output locally:

```bash
npm run preview
```

## Script reference

- `npm run dev`: Vite development server
- `npm run build`: Vite production build + copy static files (`_headers`, `robots.txt`, `sitemap.xml`, `404.html`, `error.html`)
- `npm run preview`: local preview of built output
- `npm run typecheck`: TypeScript checks (no emit)
- `npm run deploy:pages`: deploy `dist/diggers4u` to Cloudflare Pages
- `npm run deploy:worker`: deploy contact Worker
- `npm run release`: build + deploy Pages + deploy Worker
- `npm run check:scripts`: shell syntax check for release/build scripts

## Pages deploy settings

If Cloudflare Pages is connected to this repository:

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist/diggers4u`
- Root directory: repository root

Or deploy manually:

```bash
npm run deploy:pages
```

## Worker deploy

Worker code and config:

- `workers/diggers4u-worker/src/index.ts`
- `workers/diggers4u-worker/wrangler.toml`

Deploy:

```bash
npm run deploy:worker
```

Set Worker environment variables (Dashboard or CLI):

- `CONTACT_FROM` (for example `no-reply@yourdomain.com`)
- `CONTACT_TO` (destination inbox)
- `CONTACT_SUCCESS_URL` (optional explicit redirect URL after successful submit)

`send_email` binding:

- Binding name: `CONTACT_EMAIL`
- Configured in `workers/diggers4u-worker/wrangler.toml`

## Routing

`pages/diggers4u/index.html` posts to `/api/contact`.

Configure your domain route so `yourdomain.com/api/contact` is handled by the Worker while Pages serves static content.

## One-command release

```bash
make release
```

This command:

- Builds the static site into `dist/diggers4u`
- Deploys Pages from `dist/diggers4u`
- Deploys Worker from `workers/diggers4u-worker`
- Uses `workers/diggers4u-worker/wrangler.local.toml` if present
