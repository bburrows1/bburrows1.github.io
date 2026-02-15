# Cloudflare Deployment

This repository supports both:

- A static Cloudflare Pages site from the repository root.
- A separate Cloudflare Worker for contact form email in `workers/contact`.

## Pages deploy (static site)

Use these settings when creating the Pages project:

- Framework preset: `None`
- Build command: *(leave empty)*
- Build output directory: `.`
- Root directory: *(leave empty, so repository root is used)*

Notes:

- Root `wrangler.toml` is Pages-only (`pages_build_output_dir = "."`).
- `_headers` adds security headers and cache rules for static assets.
- `robots.txt` and `sitemap.xml` are served from the site root.
- `404.html` redirects unknown routes to `/`.

## Worker deploy (contact form API)

The Worker code is in `workers/contact/src/index.ts`, with config in `workers/contact/wrangler.toml`.

Deploy the Worker from that folder:

```bash
cd workers/contact
npx wrangler deploy
```

Set Worker environment variables (Dashboard or CLI):

- `CONTACT_FROM` (for example `no-reply@yourdomain.com`)
- `CONTACT_TO` (your destination inbox)
- `CONTACT_SUCCESS_URL` (optional explicit redirect URL after successful submit)

`send_email` binding:

- Binding name: `CONTACT_EMAIL`
- Configured in `workers/contact/wrangler.toml` (not in root Pages config)

## Routing

The form in `index.html` posts to `/api/contact`.
Map that path to the Worker with a Worker Route on your zone (for example `yourdomain.com/api/contact`).
This keeps the form action same-origin while static pages continue to be served by Pages.

## Local Worker dev

Create `workers/contact/.dev.vars` (ignored by git):

```env
CONTACT_FROM=no-reply@yourdomain.com
CONTACT_TO=you@yourdomain.com
CONTACT_SUCCESS_URL=https://yourdomain.com/?contact=sent
```

You can start from `workers/contact/.dev.vars.example`.

## Dev Container (No Local Node Install)

This repo includes a VS Code dev container with Node + Wrangler preinstalled in Docker:

- `.devcontainer/devcontainer.json`
- `.devcontainer/Dockerfile`

How to use:

1. Install Docker Desktop.
2. Install VS Code extension: `Dev Containers` (`ms-vscode-remote.remote-containers`).
3. Open this repo in VS Code.
4. Run `Dev Containers: Reopen in Container`.
5. Run Worker commands in the integrated terminal:
   - `npx wrangler deploy --cwd workers/contact`
   - `npx wrangler secret put CONTACT_TO --cwd workers/contact`
   - `npx wrangler tail diggers4u-worker --format pretty`
