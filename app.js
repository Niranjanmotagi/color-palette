/* ColPat-style color palette app — vanilla JS, no build step */
"use strict";

/* ================= Color utilities ================= */

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  const to = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) { const v = l * 255; return { r: v, g: v, b: v }; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
}
function hslToHex(h, s, l) { const { r, g, b } = hslToRgb(h, s, l); return rgbToHex(r, g, b); }
function hexToHsl(hex) { const { r, g, b } = hexToRgb(hex); return rgbToHsl(r, g, b); }

function textColorFor(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? "#161616" : "#f5f5f5";
}

/* ----- nearest color name ----- */
const COLOR_NAMES = {
  "alice-blue": "#f0f8ff", "antique-white": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4",
  "azure": "#f0ffff", "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000",
  "blanched-almond": "#ffebcd", "blue": "#0000ff", "blue-violet": "#8a2be2", "brown": "#a52a2a",
  "burlywood": "#deb887", "cadet-blue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e",
  "coral": "#ff7f50", "cornflower-blue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c",
  "cyan": "#00ffff", "dark-blue": "#00008b", "dark-cyan": "#008b8b", "dark-goldenrod": "#b8860b",
  "dark-gray": "#a9a9a9", "dark-green": "#006400", "dark-khaki": "#bdb76b", "dark-magenta": "#8b008b",
  "dark-olive-green": "#556b2f", "dark-orange": "#ff8c00", "dark-orchid": "#9932cc", "dark-red": "#8b0000",
  "dark-salmon": "#e9967a", "dark-sea-green": "#8fbc8f", "dark-slate-blue": "#483d8b",
  "dark-slate-gray": "#2f4f4f", "dark-turquoise": "#00ced1", "dark-violet": "#9400d3",
  "deep-pink": "#ff1493", "deep-sky-blue": "#00bfff", "dim-gray": "#696969", "dodger-blue": "#1e90ff",
  "firebrick": "#b22222", "floral-white": "#fffaf0", "forest-green": "#228b22", "fuchsia": "#ff00ff",
  "gainsboro": "#dcdcdc", "ghost-white": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520",
  "gray": "#808080", "green": "#008000", "green-yellow": "#adff2f", "honeydew": "#f0fff0",
  "hot-pink": "#ff69b4", "indian-red": "#cd5c5c", "indigo": "#4b0082", "ivory": "#fffff0",
  "khaki": "#f0e68c", "lavender": "#e6e6fa", "lavender-blush": "#fff0f5", "lawn-green": "#7cfc00",
  "lemon-chiffon": "#fffacd", "light-blue": "#add8e6", "light-coral": "#f08080", "light-cyan": "#e0ffff",
  "light-goldenrod": "#fafad2", "light-gray": "#d3d3d3", "light-green": "#90ee90", "light-pink": "#ffb6c1",
  "light-salmon": "#ffa07a", "light-sea-green": "#20b2aa", "light-sky-blue": "#87cefa",
  "light-slate-gray": "#778899", "light-steel-blue": "#b0c4de", "light-yellow": "#ffffe0",
  "lime": "#00ff00", "lime-green": "#32cd32", "linen": "#faf0e6", "magenta": "#ff00ff",
  "maroon": "#800000", "medium-aquamarine": "#66cdaa", "medium-blue": "#0000cd",
  "medium-orchid": "#ba55d3", "medium-purple": "#9370db", "medium-sea-green": "#3cb371",
  "medium-slate-blue": "#7b68ee", "medium-spring-green": "#00fa9a", "medium-turquoise": "#48d1cc",
  "violet-red": "#c71585", "midnight-blue": "#191970", "mint-cream": "#f5fffa", "misty-rose": "#ffe4e1",
  "moccasin": "#ffe4b5", "navajo-white": "#ffdead", "navy": "#000080", "old-lace": "#fdf5e6",
  "olive": "#808000", "olive-drab": "#6b8e23", "orange": "#ffa500", "orange-red": "#ff4500",
  "orchid": "#da70d6", "pale-goldenrod": "#eee8aa", "pale-green": "#98fb98", "pale-turquoise": "#afeeee",
  "pale-violet-red": "#db7093", "papaya-whip": "#ffefd5", "peach-puff": "#ffdab9", "peru": "#cd853f",
  "pink": "#ffc0cb", "plum": "#dda0dd", "powder-blue": "#b0e0e6", "purple": "#800080",
  "rebecca-purple": "#663399", "red": "#ff0000", "rosy-brown": "#bc8f8f", "royal-blue": "#4169e1",
  "saddle-brown": "#8b4513", "salmon": "#fa8072", "sandy-brown": "#f4a460", "sea-green": "#2e8b57",
  "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "sky-blue": "#87ceeb",
  "slate-blue": "#6a5acd", "slate-gray": "#708090", "snow": "#fffafa", "spring-green": "#00ff7f",
  "steel-blue": "#4682b4", "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8",
  "tomato": "#ff6347", "turquoise": "#40e0d0", "violet": "#ee82ee", "wheat": "#f5deb3",
  "white": "#ffffff", "white-smoke": "#f5f5f5", "yellow": "#ffff00", "yellow-green": "#9acd32",
};
const NAME_ENTRIES = Object.entries(COLOR_NAMES).map(([name, hex]) => ({ name, ...hexToRgb(hex) }));

function nearestColorName(hex) {
  const { r, g, b } = hexToRgb(hex);
  let best = null, bestD = Infinity;
  for (const e of NAME_ENTRIES) {
    const d = (e.r - r) ** 2 + (e.g - g) ** 2 + (e.b - b) ** 2;
    if (d < bestD) { bestD = d; best = e.name; }
  }
  return best;
}

/* ----- Tailwind shade scale ----- */
const SHADE_KEYS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const SHADE_L = [0.97, 0.94, 0.89, 0.81, 0.65, 0.50, 0.36, 0.25, 0.15, 0.08, 0.045];

function tailwindShades(hex) {
  const { h, s } = hexToHsl(hex);
  const out = {};
  SHADE_KEYS.forEach((k, i) => {
    const l = SHADE_L[i];
    // keep saturation rich mid-scale, soften at the extremes
    const sat = Math.min(1, s * (l > 0.9 ? 0.75 : l < 0.1 ? 0.9 : 1.05));
    out[k] = hslToHex(h, sat, l);
  });
  return out;
}

const ROLES = ["primary", "secondary", "tertiary", "quaternary", "quinary"];

function buildTailwindOutput(colors, version) {
  if (version === "v4") {
    let css = "@theme {\n";
    colors.forEach((hex, i) => {
      const shades = tailwindShades(hex);
      for (const k of SHADE_KEYS) css += `  --color-${ROLES[i]}-${k}: ${shades[k]};\n`;
      if (i < colors.length - 1) css += "\n";
    });
    return css + "}";
  }
  const obj = {};
  colors.forEach((hex, i) => { obj[ROLES[i]] = tailwindShades(hex); });
  return JSON.stringify(obj, null, 2);
}

function highlightCode(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/"([^"]+)":/g, '<span class="k">"$1"</span><span class="p">:</span>')
    .replace(/"(#[0-9a-fA-F]{3,8})"/g, '<span class="s">"$1"</span>')
    .replace(/(--[\w-]+)(:)/g, '<span class="k">$1</span><span class="p">$2</span>')
    .replace(/(#[0-9a-fA-F]{3,8})(;)/g, '<span class="s">$1</span><span class="p">$2</span>');
}

/* ================= Clipboard + toasts ================= */

function copyText(text, message) {
  const done = () => toast(message || "Copied!", "success");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { fallbackCopy(text); done(); });
  } else { fallbackCopy(text); done(); }
}
function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (_) { /* ignore */ }
  ta.remove();
}

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="ticon">${type === "success" ? "✓" : "i"}</span><span>${message}</span><button class="x">✕</button>`;
  el.querySelector(".x").onclick = () => el.remove();
  document.getElementById("toasts").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ================= Data ================= */

const TRENDING = [
  ["#5BC8D4", "#BCE3DB", "#E8EAD3", "#EE9A52", "#F2680C"],
  ["#F22C68", "#F2899E", "#F5C6A8", "#C9C99A", "#84B59F"],
  ["#E8D588", "#CE6A57", "#C12553", "#5B1F41", "#456661"],
  ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
  ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
  ["#CDB4DB", "#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF"],
  ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
  ["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"],
  ["#F72585", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"],
  ["#FF9F1C", "#FFBF69", "#FFFFFF", "#CBF3F0", "#2EC4B6"],
];

const MEANINGS = [
  ["Amber", "#FFBF00", "Warmth, positivity, and energy", "Anger and frustration"],
  ["Beige", "#E8DCC2", "Calmness, simplicity, and comfort", "Monotony"],
  ["Black", "#2B2B2B", "Elegance, power, and sophistication", "Pessimism, sadness, and aloofness"],
  ["Blue", "#2D7DD2", "Trust, loyalty, wisdom, and confidence", "Self-centeredness, stubbornness, melancholy, timidity"],
  ["Brown", "#A56A3A", "Warmth, simplicity, comfort, trustworthiness, and reliability", "Monotony and dullness"],
  ["Burgundy", "#800020", "Wealth, maturity, and prosperity", "Aggression, lust, and malice"],
  ["Coral", "#E15D58", "Warmth, feminism, freshness and energy", "Immaturity, and unrealism"],
  ["Gold", "#EFBF04", "Sophistication, compassion, courage, and wisdom", "Arrogance, extravagance, over-ambition, and self-centeredness"],
  ["Green", "#46E436", "Creativity, productivity, freshness, harmony, and rejuvenation", "Greed, jealousy, ambition, and materialism"],
  ["grey", "#7E7E7E", "Sophistication, reliability, maturity, and practicality", "Dullness, self-centeredness, and depression"],
  ["Indigo", "#5D17EB", "Spirituality, wisdom, devotion, dignity, and creativity", "Narrow-mindedness"],
  ["Lavender", "#A187C9", "Gracefulness, calmness, and creativity", "Impracticality, indecisiveness"],
  ["Magenta", "#D9027D", "Compassion, kindness, and harmony", "Impulsiveness and bossiness"],
  ["Maroon", "#7E2438", "Ambition, confidence, creativity, and passion", "Aggression and seriousness"],
  ["Orange", "#F2790F", "Enthusiasm, emotional strength, and positivity", "Impatience and superficiality"],
  ["Pink", "#F49AC2", "Love, compassion, playfulness, and kindness", "Timidity and over-emotionality"],
  ["Purple", "#8E44AD", "Royalty, luxury, power, and ambition", "Decadence and moodiness"],
  ["Red", "#E0301E", "Passion, energy, courage, and love", "Anger, danger, and aggression"],
  ["Teal", "#0F8B8D", "Calmness, clarity, and balance", "Reservedness and coldness"],
  ["White", "#FAFAFA", "Purity, innocence, cleanliness, and simplicity", "Emptiness, isolation, and blandness"],
  ["Yellow", "#FFD600", "Happiness, optimism, and creativity", "Caution, cowardice, and anxiety"],
];

const MOSAIC_POOL = [
  "#E63946", "#F4A261", "#E9C46A", "#2A9D8F", "#264653", "#F72585", "#7209B7", "#4CC9F0",
  "#FFB703", "#FB8500", "#8ECAE6", "#219EBC", "#D62828", "#FCBF49", "#EAE2B7", "#CCFF33",
  "#9EF01A", "#38B000", "#FF87AB", "#C9184A", "#590D22", "#FFF1E6", "#7F5539", "#DDB892",
  "#3C096C", "#FF6D00", "#90E0EF", "#03045E", "#B5E48C", "#168AAD", "#F9F7F3", "#0A0908",
];

/* ================= Small SVG icons ================= */

const ICONS = {
  donut: `<svg class="donut" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#dfc269" stroke-width="9" stroke-dasharray="55 8"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>`,
  brush: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9.06 11.9 19.2 1.76a2.4 2.4 0 0 1 3.4 3.4L12.45 15.3"/><path d="M5.7 14.3c-2 0-3.7 1.7-3.7 3.7 0 1.6-1 2.6-2 3 1.5 1 3.3 1 4.7 1 2.8 0 5-2.2 5-5l-4-2.7Z"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="13" height="17" rx="2"/><path d="M9 4V2.5A1.5 1.5 0 0 1 10.5 1h4A1.5 1.5 0 0 1 16 2.5V4"/><path d="m9.5 12.5 2 2 4-4.5" stroke-linecap="round"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2.2"/><circle cx="8" cy="16" r="2.2"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m8.5 12 3.5-3.5L15.5 12M12 8.5V16"/></svg>`,
  robot: `<svg viewBox="0 0 24 24" fill="none" stroke="#131313" stroke-width="1.7"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V5M12 5a1.5 1.5 0 1 0-.01-3.01A1.5 1.5 0 0 0 12 5ZM2 12v4M22 12v4"/><path d="M8 13.5h.01M16 13.5h.01" stroke-width="3" stroke-linecap="round"/><path d="M9.5 16.5c1.5 1 3.5 1 5 0" stroke-linecap="round"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" fill="none" stroke="#131313" stroke-width="1.7"><path d="M5 3h9v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 7.5 18.5 3 21 5.5 14 12.5"/><path d="M14 21h5a2 2 0 0 0 2-2v-3l-7 5Z" fill="#131313"/><circle cx="9.5" cy="16.5" r="1.2" fill="#131313"/></svg>`,
  cool: `<svg viewBox="0 0 24 24" fill="none" stroke="#131313" stroke-width="1.7"><circle cx="12" cy="12" r="9.5"/><path d="M4 9.5h16M6 9.5c0 2 .8 3.5 3 3.5s3-2 3-3.5M12 9.5c0 2 .8 3.5 3 3.5s3-2 3-3.5" fill="#131313" stroke-width="1.2"/><path d="M8.5 16.5c2 1.5 5 1.5 7 0" stroke-linecap="round"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="#131313"><path d="M12 22c4.4 0 7.5-3 7.5-7.2 0-3.1-1.7-5.4-3.4-7.3-.5 1.2-1.4 2.3-2.5 2.8.3-2.8-1-6.4-4.1-8.3.3 4.1-5 5.8-5 12.4C4.5 19 7.6 22 12 22Z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1A4.1 4.1 0 0 0 11.8 9 11.7 11.7 0 0 1 3.3 4.7a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4-.6.2-1.2.2-1.9.1a4.1 4.1 0 0 0 3.9 2.9A8.3 8.3 0 0 1 2 18.5a11.7 11.7 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9V9Z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none"/></svg>`,
};

/* ================= Shared chrome ================= */

function navbarHTML() {
  return `
  <nav class="nav">
    <a class="brand" href="#/">${ICONS.donut}<span class="name">Col<b>Pat</b></span></a>
    <a class="btn-github" href="https://github.com/niranjanmotagi" target="_blank" rel="noopener">${ICONS.github} GitHub</a>
  </nav>`;
}

function footerHTML() {
  return `
  <footer>
    <div class="socials">
      <a href="#" aria-label="Twitter">${ICONS.twitter}</a>
      <a href="https://github.com/niranjanmotagi" target="_blank" rel="noopener" aria-label="GitHub">${ICONS.github}</a>
      <a href="#" aria-label="LinkedIn">${ICONS.linkedin}</a>
      <a href="https://instagram.com/niranjan_a_m" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
    </div>
    <div><a class="mail" href="mailto:niranjan.motagi@gmail.com">${ICONS.mail} niranjan.motagi@gmail.com</a></div>
    <p class="crafted">&lt;/&gt; &amp; Crafted with 🧡 Niranjan Motagi</p>
    <div class="footer-big">COLPAT</div>
    <div class="footer-tag">the ultimate design tool!</div>
  </footer>`;
}

function letterheadHTML(text, route) {
  const spans = text.split("").map(ch => `<span>${ch}</span>`).join("");
  return `<a class="letterhead" href="#/${route}">${spans}</a>`;
}

function shellOpen() {
  return `<section class="shell"><div class="mini-brand">${ICONS.donut.replace('class="donut"', 'class="donut"')}<span class="name">ColPat</span></div>`;
}

/* ================= Tools ================= */
/* Each init*(el, opts) fills `el` and wires events. Used on home + dedicated pages. */

/* ----- Trending palettes ----- */
function initTrending(el, { limit } = {}) {
  const palettes = limit ? TRENDING.slice(0, limit) : TRENDING;
  el.innerHTML = `
    <h2>Trending Palettes 🔥</h2>
    <p class="sub">Click on the color to copy it, hover mouse to get the color name!</p>
    <div class="trend-list">
      ${palettes.map((p, i) => `
        <div class="trend-row">
          <span class="idx">#${i + 1}</span>
          <div class="trend-swatches">
            ${p.map(c => `<div class="swatch" style="background:${c}" data-hex="${c}" data-name="${nearestColorName(c)}"></div>`).join("")}
          </div>
          <button class="pill mint shades-btn" data-i="${i}">${ICONS.sliders} Generate Shades for Tailwind</button>
        </div>`).join("")}
    </div>`;
  el.querySelectorAll(".swatch").forEach(s =>
    s.addEventListener("click", () => copyText(s.dataset.hex, `Copied ${s.dataset.hex}!`)));
  el.querySelectorAll(".shades-btn").forEach(b =>
    b.addEventListener("click", () => {
      sessionStorage.setItem("tpgColors", JSON.stringify(palettes[+b.dataset.i]));
      sessionStorage.setItem("tpgAuto", "1");
      location.hash = "#/tpg";
    }));
}

/* ----- TailwindCSS palette generator ----- */
function initTPG(el) {
  let colors;
  try { colors = JSON.parse(sessionStorage.getItem("tpgColors")) || null; } catch (_) { colors = null; }
  if (!Array.isArray(colors) || colors.length !== 5) {
    colors = ["#69d2e7", "#a7dbd8", "#e0e4cc", "#f38630", "#fa6900"];
  }
  colors = colors.map(c => c.toLowerCase());
  let version = "v3";

  el.innerHTML = `
    <h2>TailwindCSS Palette Generator</h2>
    <p class="sub">Click on the color to change it, once selected, just click on generate to create the palette!</p>
    <div class="tpg-row">
      ${ROLES.map((role, i) => `
        <div class="tpg-slot" data-i="${i}">
          <div class="circle" style="background:${colors[i]}"></div>
          <input type="color" value="${colors[i]}" />
          <span class="hex">${colors[i]}</span>
          <span class="role">${role[0].toUpperCase() + role.slice(1)}</span>
          <button class="btn-checkname">Check name</button>
        </div>`).join("")}
    </div>
    <button class="pill mint gen-btn" style="font-size:17px;padding:14px 34px;">${ICONS.brush} Generate</button>
    <div class="tw-toggle">
      <span>Tailwind Version</span>
      <span class="seg"><button class="v3 on">v3</button><button class="v4">v4</button></span>
    </div>
    <div class="out"></div>`;

  const out = el.querySelector(".out");

  el.querySelectorAll(".tpg-slot").forEach(slot => {
    const i = +slot.dataset.i;
    const input = slot.querySelector("input");
    const circle = slot.querySelector(".circle");
    circle.addEventListener("click", () => input.click());
    input.addEventListener("input", () => {
      colors[i] = input.value;
      circle.style.background = input.value;
      slot.querySelector(".hex").textContent = input.value;
      sessionStorage.setItem("tpgColors", JSON.stringify(colors));
    });
    slot.querySelector(".btn-checkname").addEventListener("click", () =>
      toast(`Color name is: ${nearestColorName(colors[i])}`, "info"));
  });

  const generate = () => {
    const code = buildTailwindOutput(colors, version);
    out.innerHTML = `<div class="codeblock">${highlightCode(code)}</div>`;
    copyText(code, "Code Copied!");
  };

  el.querySelector(".gen-btn").addEventListener("click", generate);
  const v3 = el.querySelector(".v3"), v4 = el.querySelector(".v4");
  v3.addEventListener("click", () => { version = "v3"; v3.classList.add("on"); v4.classList.remove("on"); if (out.firstChild) generate(); });
  v4.addEventListener("click", () => { version = "v4"; v4.classList.add("on"); v3.classList.remove("on"); if (out.firstChild) generate(); });

  if (sessionStorage.getItem("tpgAuto") === "1") {
    sessionStorage.removeItem("tpgAuto");
    setTimeout(generate, 250);
  }
}

/* ----- Awesome gradients ----- */
function initGradients(el) {
  el.innerHTML = `
    <h2>Awesome Gradients ✨</h2>
    <div class="grad-box"></div>
    <div class="grad-actions">
      <button class="pill blue new-btn">${ICONS.refresh} Generate New</button>
      <button class="pill green copy-btn">${ICONS.clipboard} Copy CSS</button>
    </div>`;
  const box = el.querySelector(".grad-box");
  let css = "";
  const roll = () => {
    const h = Math.floor(Math.random() * 360);
    const h2 = h + 40 + Math.floor(Math.random() * 120);
    const angle = [45, 90, 135, 120, 60][Math.floor(Math.random() * 5)];
    const c1 = hslToHex(h, 0.75 + Math.random() * 0.2, 0.6 + Math.random() * 0.15);
    const c2 = hslToHex(h2, 0.75 + Math.random() * 0.2, 0.55 + Math.random() * 0.2);
    css = `background: linear-gradient(${angle}deg, ${c1}, ${c2});`;
    box.style.background = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
  };
  roll();
  el.querySelector(".new-btn").addEventListener("click", roll);
  el.querySelector(".copy-btn").addEventListener("click", () => copyText(css, "CSS Copied!"));
}

/* ----- Palette from image ----- */
function extractPalette(img, count = 5) {
  const cv = document.createElement("canvas");
  const size = 64;
  cv.width = size; cv.height = size;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    e.r += r; e.g += g; e.b += b; e.n++;
    buckets.set(key, e);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n)
    .map(e => ({ r: e.r / e.n, g: e.g / e.n, b: e.b / e.n, n: e.n }));
  const picked = [];
  for (const c of sorted) {
    if (picked.every(p => (p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2 > 2400)) picked.push(c);
    if (picked.length === count) break;
  }
  // top up if the image was too uniform
  for (const c of sorted) {
    if (picked.length === count) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked.map(c => rgbToHex(c.r, c.g, c.b));
}

function aiSuggestFrom(palette) {
  // harmonize: snap hues, normalize saturation, spread lightness like a designer would
  const L = [0.85, 0.68, 0.52, 0.36, 0.22];
  return palette.map((hex, i) => {
    const { h, s } = hexToHsl(hex);
    const snapped = Math.round(h / 15) * 15;
    return hslToHex(snapped, Math.min(0.78, Math.max(0.35, s * 1.1)), L[i % L.length]);
  });
}

function swatchRow(colors) {
  return `<div class="trend-swatches">
    ${colors.map(c => `<div class="swatch" style="background:${c}" data-hex="${c}" data-name="${nearestColorName(c)}"></div>`).join("")}
  </div>`;
}

function initPFI(el, { pageTitle } = {}) {
  el.innerHTML = `
    <h2>${pageTitle || "Palette from Image [AI]"}</h2>
    <button class="pill dark up-btn">${ICONS.upload} Upload Image</button>
    <input type="file" accept="image/*" hidden />
    <div class="sel-wrap" style="display:none">
      <p class="sub" style="margin:26px 0 0">Selected Image</p>
      <img class="pfi-img" alt="Selected" />
      <div class="pfi-cols">
        <div class="pfi-col">
          <h3>Generated Palette</h3>
          <p class="hint">Click on the color to copy the hex code</p>
          <div class="gen"></div>
        </div>
        <div class="pfi-col">
          <h3>AI Suggested Palette</h3>
          <p class="hint">Click on the color to copy the hex code</p>
          <div class="ai"></div>
        </div>
      </div>
    </div>`;
  const file = el.querySelector("input[type=file]");
  el.querySelector(".up-btn").addEventListener("click", () => file.click());
  file.addEventListener("change", () => {
    const f = file.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = el.querySelector(".pfi-img");
    img.onload = () => {
      const palette = extractPalette(img);
      el.querySelector(".gen").innerHTML = swatchRow(palette);
      el.querySelector(".ai").innerHTML = swatchRow(aiSuggestFrom(palette));
      el.querySelectorAll(".swatch").forEach(s =>
        s.addEventListener("click", () => copyText(s.dataset.hex, `Copied ${s.dataset.hex}!`)));
      URL.revokeObjectURL(url);
    };
    img.src = url;
    img.style.display = "block";
    el.querySelector(".sel-wrap").style.display = "block";
  });
}

/* ----- Palette from color ----- */
function harmonyPalette(hex) {
  const { h, s, l } = hexToHsl(hex);
  const cs = Math.min(0.85, Math.max(0.4, s));
  return [
    hex.toLowerCase(),
    hslToHex(h + 25, cs, Math.min(0.62, l + 0.06)),
    hslToHex(h - 18, Math.min(0.9, cs * 1.05), Math.max(0.42, l - 0.05)),
    hslToHex(h + 48, Math.max(0.45, cs * 0.85), 0.55),
    hslToHex(h + 180, Math.min(0.85, cs), 0.56),
  ];
}

function initPFC(el) {
  let base = "#e53883";
  el.innerHTML = `
    <h2>Color Palette from Color [AI]</h2>
    <p class="sub" style="margin-bottom:10px">Click on the color to change it</p>
    <div class="pfc-big" style="background:${base}"></div>
    <input type="color" value="${base}" hidden />
    <div><span class="hex" style="color:#ddd;font-size:14px">${base}</span></div>
    <button class="btn-checkname" style="margin-top:8px">Check name</button>
    <div class="pfc-out">
      <p class="sub" style="margin-bottom:16px">Click on the color to copy it</p>
      <div class="pal" style="display:flex;justify-content:center"></div>
      <button class="pill mint shades-btn" style="margin-top:34px">${ICONS.sliders} Generate Shades for Tailwind</button>
    </div>`;
  const input = el.querySelector("input[type=color]");
  const big = el.querySelector(".pfc-big");
  const hexLabel = el.querySelector(".hex");
  const pal = el.querySelector(".pal");
  let palette = harmonyPalette(base);

  const renderPal = () => {
    palette = harmonyPalette(base);
    pal.innerHTML = swatchRow(palette);
    pal.querySelectorAll(".swatch").forEach(s =>
      s.addEventListener("click", () => copyText(s.dataset.hex, `Copied ${s.dataset.hex}!`)));
  };
  renderPal();

  big.addEventListener("click", () => input.click());
  input.addEventListener("input", () => {
    base = input.value;
    big.style.background = base;
    hexLabel.textContent = base;
    renderPal();
  });
  el.querySelector(".btn-checkname").addEventListener("click", () =>
    toast(`Color name is: ${nearestColorName(base)}`, "info"));
  el.querySelector(".shades-btn").addEventListener("click", () => {
    sessionStorage.setItem("tpgColors", JSON.stringify(palette));
    sessionStorage.setItem("tpgAuto", "1");
    location.hash = "#/tpg";
  });
}

/* ----- What color says ----- */
function initSays(el, { limit } = {}) {
  const items = limit ? MEANINGS.slice(0, limit) : MEANINGS;
  el.innerHTML = `
    <h2>What Color Says!</h2>
    <div class="says-grid">
      ${items.map(([name, hex, plus, minus]) => `
        <div class="says-card">
          <div class="chip" style="background:${hex};color:${textColorFor(hex)}">${name}</div>
          <div class="row"><span class="sign plus">+</span><p>${plus}</p></div>
          <div class="row"><span class="sign minus">−</span><p>${minus}</p></div>
        </div>`).join("")}
    </div>`;
}

/* ================= Views ================= */

let mosaicTimer = null;

function heroHTML() {
  const tiles = Array.from({ length: 63 }, () =>
    `<div style="background:${MOSAIC_POOL[Math.floor(Math.random() * MOSAIC_POOL.length)]}"></div>`).join("");
  return `
  <header class="hero">
    <div>
      <div class="hero-words"><span class="w1">AI</span><span class="w2">MEETS</span><span class="w3">COLOR</span></div>
      <button class="btn-checknow" id="checknow">Check Now <span class="bang">!</span></button>
    </div>
    <div class="mosaic" id="mosaic">${tiles}</div>
  </header>`;
}

function cardsHTML() {
  return `
  <div class="cards">
    <a class="fcard" style="background:#f3d089" href="#/trending">Trending Color Palettes</a>
    <a class="fcard" style="background:#f6b3aa" href="#/gradients">Awesome Gradients</a>
    <a class="fcard" style="background:#bfdfc4" href="#/tpg">Tailwind Palette Generator</a>
    <a class="fcard tall" style="background:#b2aec0" href="#/pfi">${ICONS.robot} Palette from Image [AI]</a>
    <a class="fcard tall" style="background:#d6f1f7" href="#/palette-from-color">${ICONS.palette} Color Palette from Color [AI]</a>
    <a class="fcard tall" style="background:#90d9a1" href="#/color-says">${ICONS.cool} What Color Says!</a>
  </div>`;
}

const SECTIONS = [
  { tool: "trending", route: "trending", head: "TRENDINGPALETTES", opts: { limit: 3 } },
  { tool: "gradients", route: "gradients", head: "AWESOMEGRADIENTS" },
  { tool: "tpg", route: "tpg", head: "TAILWINDPALETTE" },
  { tool: "pfi", route: "pfi", head: "PALETTEFROMIMAGE" },
  { tool: "pfc", route: "palette-from-color", head: "PALETTEFROMCOLOR" },
  { tool: "says", route: "color-says", head: "WHATCOLORSAYS", opts: { limit: 6 } },
];

const INITS = {
  trending: initTrending,
  gradients: initGradients,
  tpg: initTPG,
  pfi: initPFI,
  pfc: initPFC,
  says: initSays,
};

function renderHome(app) {
  app.innerHTML = `
    ${navbarHTML()}
    ${heroHTML()}
    <div id="sections">
      ${SECTIONS.map(s => `
        ${shellOpen()}
          <div class="tool" data-tool="${s.tool}"></div>
          ${letterheadHTML(s.head, s.route)}
        </section>`).join("")}
    </div>
    ${cardsHTML()}
    ${footerHTML()}`;

  app.querySelectorAll(".tool").forEach(el => {
    const s = SECTIONS.find(x => x.tool === el.dataset.tool);
    INITS[el.dataset.tool](el, s.opts || {});
  });

  document.getElementById("checknow").addEventListener("click", () =>
    document.getElementById("sections").scrollIntoView({ behavior: "smooth" }));

  const mosaic = document.getElementById("mosaic");
  mosaicTimer = setInterval(() => {
    const tiles = mosaic.children;
    for (let k = 0; k < 3; k++) {
      const t = tiles[Math.floor(Math.random() * tiles.length)];
      t.style.background = MOSAIC_POOL[Math.floor(Math.random() * MOSAIC_POOL.length)];
    }
  }, 600);
}

const PAGES = {
  "trending": { tool: "trending" },
  "gradients": { tool: "gradients" },
  "tpg": { tool: "tpg" },
  "pfi": { tool: "pfi", opts: { pageTitle: "Generate Color Palette from Image using AI" } },
  "palette-from-color": { tool: "pfc" },
  "color-says": { tool: "says" },
};

function renderPage(app, route) {
  const page = PAGES[route];
  app.innerHTML = `
    ${navbarHTML()}
    <main class="page"><div class="tool page-tool"></div></main>
    ${footerHTML()}`;
  INITS[page.tool](app.querySelector(".tool"), page.opts || {});
}

function render() {
  if (mosaicTimer) { clearInterval(mosaicTimer); mosaicTimer = null; }
  const app = document.getElementById("app");
  const route = location.hash.replace(/^#\/?/, "");
  if (PAGES[route]) renderPage(app, route);
  else renderHome(app);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
