# ColPat-style Color Palette Web App

A faithful recreation of the **ColPat** ("AI meets Color") color-tool website from the reference
screen recording — same dark contour-line theme, gold accents, pastel pill buttons, and the same
feature set. Pure HTML/CSS/JS, no build step, no API keys.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
npx http-server . -p 5180
# → http://localhost:5180
```

## Features (all client-side)

| Feature | Route | What it does |
| ------- | ----- | ------------ |
| Hero | `#/` | "AI MEETS COLOR" headline, animated color-mosaic grid, **Check Now!** scroll button |
| Trending Palettes 🔥 | `#/trending` | Curated palettes — click a swatch to copy the hex, hover for the color name, **Generate Shades for Tailwind** per palette |
| Awesome Gradients ✨ | `#/gradients` | Random gradient preview, **Generate New**, **Copy CSS** |
| TailwindCSS Palette Generator | `#/tpg` | 5 pickable colors (Primary→Quinary), **Check name**, **Generate** builds full 50–950 shade scales, auto-copies, **v3** (config JSON) / **v4** (`@theme` CSS) toggle |
| Palette from Image [AI] | `#/pfi` | Upload an image → dominant-color extraction (canvas quantization) + an AI-style harmonized suggestion, click to copy |
| Color Palette from Color [AI] | `#/palette-from-color` | Pick one color → harmony palette (analogous/complementary), click to copy, send to the Tailwind generator |
| What Color Says! | `#/color-says` | Color psychology cards — positives & negatives for 21 colors |

Plus: success/info toasts ("Code Copied!", "Color name is: …"), feature-card navigation grid,
and the animated COLPAT footer.

> The "[AI]" features are implemented with local heuristics (color quantization + hue/saturation
> harmonization) so the app works offline with no keys — same UX as the original.

Crafted with 🧡 by [Niranjan Motagi](https://github.com/niranjanmotagi) ·
[Instagram](https://instagram.com/niranjan_a_m) — design reference: [colpat.itsvg.in](https://colpat.itsvg.in).
