# Khalid Abouelrous — portfolio draft

A minimal, monochrome portfolio with a sparse ASCII texture and pointer-driven ASCII sparkles.

## Local development

```sh
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open <http://127.0.0.1:5173>.

The site is intentionally dependency-free. There is no build step; `dist` is the site.

## Structure

```text
dist/
├── assets/          # shared CSS and JavaScript
├── index.html       # /
└── projects/
    └── index.html   # /projects/
```

Add future pages as `dist/<route>/index.html` and reuse the root-relative files in `dist/assets/`.

## Interaction

Click or tap anywhere on the canvas to create a fading ASCII sparkle. Multiple sparkles can overlap. Visitors who prefer reduced motion see the static pages without animation.
