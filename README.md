# Cloudflare Pages Deployment

This repository is ready to deploy as a static Cloudflare Pages site.

## Cloudflare Pages settings

Use these settings when creating the Pages project:

- Framework preset: `None`
- Build command: *(leave empty)*
- Build output directory: `.`
- Root directory: *(leave empty, so repository root is used)*

## Notes

- `wrangler.toml` sets `pages_build_output_dir = "."` so the root is treated as the publish directory.
- `_headers` adds basic security headers and cache rules for static assets.
- `robots.txt` and `sitemap.xml` are served from the site root for SEO.
- `404.html` redirects unknown routes to `/`.
