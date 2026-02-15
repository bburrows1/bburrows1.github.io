# Cloudflare Monorepo

This repository is structured as a Cloudflare monorepo with one Pages app and one Worker:

- `pages/diggers4u`: static Cloudflare Pages site
- `workers/diggers4u-contact`: contact form Worker (`/api/contact`)

## Repository layout

```text
pages/
  diggers4u/
    wrangler.toml
    index.html
    404.html
    _headers
    style.css
    robots.txt
    sitemap.xml
    resources/
workers/
  diggers4u-contact/
    wrangler.toml
    src/index.ts
```

## Pages deploy (`pages/diggers4u`)

Use these settings when creating the Pages project:

- Framework preset: `None`
- Build command: *(leave empty)*
- Build output directory: `.`
- Root directory: `pages/diggers4u`

Or deploy with Wrangler from the site folder:

```bash
npx wrangler pages deploy pages/diggers4u
```

Notes:

- `pages/diggers4u/wrangler.toml` is Pages-only (`pages_build_output_dir = "."`).
- `pages/diggers4u/_headers` adds security headers and cache rules for static assets.
- `pages/diggers4u/robots.txt` and `pages/diggers4u/sitemap.xml` are served from the site root.
- `pages/diggers4u/404.html` redirects unknown routes to `/`.

## Worker deploy (`workers/diggers4u-contact`)

Worker code is in `workers/diggers4u-contact/src/index.ts` with config in `workers/diggers4u-contact/wrangler.toml`.

Deploy:

```bash
npx wrangler deploy --cwd workers/diggers4u-contact
```

Set Worker environment variables (Dashboard or CLI):

- `CONTACT_FROM` (for example `no-reply@yourdomain.com`)
- `CONTACT_TO` (your destination inbox)
- `CONTACT_SUCCESS_URL` (optional explicit redirect URL after successful submit)

`send_email` binding:

- Binding name: `CONTACT_EMAIL`
- Configured in `workers/diggers4u-contact/wrangler.toml`

## Routing

`pages/diggers4u/index.html` posts to `/api/contact`.

Map `yourdomain.com/api/contact` to the contact Worker route so Pages serves static content and the Worker handles form submissions.
