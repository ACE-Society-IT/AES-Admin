The updated design system strips out all old espresso, white, and slate-gray tokens from your previous specification and locks the entire application strictly to your **7 core hex colors**.

### 1. The 7-Color Classification & Semantic Map

| Category | Hex Code | RGB Value | Semantic Name | Strict Role in the Web App |
| --- | --- | --- | --- | --- |
| **Dark 1 (Darkest)** | `#5a0d1b` | `rgb(90, 13, 27)` | **Abyssal Oxblood** | Deepest background base, footers, dark-mode recessed areas, and **primary body/heading text on light backgrounds**. |
| **Dark 2 (Deep)** | `#650d1c` | `rgb(101, 13, 28)` | **Deep Wine** | Secondary dark section background, alternating dark rows, and **secondary text on light backgrounds**. |
| **Dark 3 (Core)** | `#701020` | `rgb(112, 16, 32)` | **Royal Crimson** | Primary brand dark surface, hero backgrounds, and **primary dark CTA button fill on light sections**. |
| **Dark 4 (Elevated)** | `#89192c` | `rgb(137, 25, 44)` | **Ruby Velvet** | Elevated card surfaces on dark backgrounds, dark-mode borders, radial glows, and hover states for dark elements. |
| **Light 1 (Lightest)** | `#f8eee1` | `rgb(248, 238, 225)` | **Alabaster Cream** | Primary light section background, and **primary heading/title text on dark backgrounds**. |
| **Light 2 (Warm Neutral)** | `#e8dcc6` | `rgb(232, 220, 198)` | **Warm Parchment** | Card surfaces & borders on light backgrounds, and **muted subtitle/body copy on dark backgrounds**. |
| **Accent (Highlight)** | `#f1ca7e` | `rgb(241, 202, 126)` | **Imperial Gold** | Primary CTA buttons on dark backgrounds, active nav indicators, badges, icons, and luxury highlight accents. |

---

### 2. Complete `DESIGN-RULES.md` File

Replace the contents of your `DESIGN-RULES.md` file with the markdown block below:

```markdown
# AI Agent Design & Frontend Architecture Rules (`DESIGN-RULES.md`)

> **CRITICAL DIRECTIVE FOR AI AGENTS:** 
> You MUST read and strictly follow every constraint in this document before creating, modifying, or styling any component. **NEVER hallucinate, invent, or substitute hex codes, default Tailwind colors, inline styles, or extra CSS files.**

---

## 1. Strict 7-Color Lockdown (Zero Extra Colors Policy)

The entire web application is strictly locked to **ONLY 7 HEX COLORS**. 
- You are **FORBIDDEN** from using pure white (`#FFFFFF` / `bg-white`), pure black (`#000000` / `bg-black`), or any default Tailwind palette colors (`gray-*`, `red-*`, `amber-*`, `slate-*`, `neutral-*`, etc.).
- Every background, card, border, shadow, icon, button, and text element MUST use one of the 7 hex codes below (Tailwind opacity modifiers on these 7 colors, such as `bg-[#89192c]/60` or `border-[#f1ca7e]/30`, are permitted for depth).

### A. The Dark Palette (4 Crimson / Burgundy Shades)
1. **`#5a0d1b` (Abyssal Oxblood — Darkest)**
   - **Dark Theme Usage:** Deepest page base (`bg-[#5a0d1b]`), navbar/footer backgrounds, and high-contrast text inside `#f1ca7e` gold buttons (`text-[#5a0d1b]`).
   - **Light Theme Usage:** Primary display headings (`h1`, `h2`) and high-contrast body text (`text-[#5a0d1b]`).
2. **`#650d1c` (Deep Wine — Deep Dark)**
   - **Dark Theme Usage:** Secondary dark section backgrounds (`bg-[#650d1c]`) and gradient mid-stops.
   - **Light Theme Usage:** Card subheadings (`h3`, `h4`) and secondary body copy (`text-[#650d1c]`).
3. **`#701020` (Royal Crimson — Core Brand Dark)**
   - **Dark Theme Usage:** Primary hero surface (`bg-[#701020]`) and standard dark containers.
   - **Light Theme Usage:** Primary dark CTA button background (`bg-[#701020] text-[#f8eee1]`), icons, and active borders.
4. **`#89192c` (Ruby Velvet — Elevated Dark & Interactive)**
   - **Dark Theme Usage:** Elevated card surfaces (`bg-[#89192c]`), glassmorphic badges (`bg-[#89192c]/50`), dark-mode borders (`border-[#89192c]`), and radial background spotlights.
   - **Light Theme Usage:** Hover state for dark buttons (`hover:bg-[#89192c]`), subtle muted labels (`text-[#89192c]`), and interactive focus rings.

### B. The Light & Accent Palette (3 Cream, Sand & Gold Shades)
5. **`#f8eee1` (Alabaster Cream — Lightest)**
   - **Light Theme Usage:** Primary light section background (`bg-[#f8eee1]`) and elevated card interiors resting on `#e8dcc6`.
   - **Dark Theme Usage:** Primary headings (`h1`, `h2`), navigation links, and high-contrast text (`text-[#f8eee1]`).
6. **`#e8dcc6` (Warm Parchment — Secondary Light / Muted Neutral)**
   - **Light Theme Usage:** Secondary light section background, card backgrounds on top of `#f8eee1` (`bg-[#e8dcc6]`), and subtle card borders/dividers (`border-[#e8dcc6]`).
   - **Dark Theme Usage:** Muted subtitles, paragraph descriptions, and secondary labels (`text-[#e8dcc6]`).
7. **`#f1ca7e` (Imperial Gold — Primary Brand Accent)**
   - **Dark Theme Usage:** Primary CTA button fill (`bg-[#f1ca7e] text-[#5a0d1b]`), brand monograms/logos, active states, key icons (`text-[#f1ca7e]`), and glowing accent borders (`border-[#f1ca7e]`).
   - **Light Theme Usage:** Highlight badges (`bg-[#f1ca7e] text-[#5a0d1b]`), active tabs, icon container accents, and decorative underlines.

---

## 2. Surface & Text Pairing Matrix

Never pair dark text on a dark surface or light text on a light surface. Follow this exact pairing matrix:

### Dark Sections (Hero, Feature Showcases, Footer)
- **Main Section Background:** `bg-[#5a0d1b]` or `bg-[#650d1c]` or `bg-[#701020]`
- **Hero Radial Glow:** `bg-[radial-gradient(circle_at_center,#89192c_0%,#701020_45%,#5a0d1b_100%)]`
- **Elevated Card / Badge Surface:** `bg-[#701020]` or `bg-[#89192c]/60 backdrop-blur-md`
- **Card Border:** `border border-[#89192c]` (Idle) -> `hover:border-[#f1ca7e]/60` (Hover)
- **Primary Heading Text:** `text-[#f8eee1]`
- **Body / Subtitle Text:** `text-[#e8dcc6]`
- **Highlight / Eyebrow Text:** `text-[#f1ca7e]`
- **Primary CTA Button:** `bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] font-semibold rounded-full transition-all duration-300`
- **Secondary CTA Button:** `bg-[#89192c]/40 text-[#f8eee1] border border-[#f1ca7e]/40 hover:bg-[#89192c] rounded-full transition-all duration-300`

### Light Sections (Content Grids, Vision, Details)
- **Main Section Background:** `bg-[#f8eee1]` (or `bg-[#e8dcc6]` for alternating contrast sections)
- **Card Surface:** `bg-[#e8dcc6]/60` (when on `#f8eee1`) or `bg-[#f8eee1]` (when on `#e8dcc6`)
- **Card Border:** `border border-[#e8dcc6]` or `border-[#89192c]/15`
- **Icon Box Surface:** `bg-[#701020] text-[#f1ca7e]` or `bg-[#f1ca7e] text-[#5a0d1b]`
- **Primary Heading Text:** `text-[#5a0d1b]`
- **Subheading Text:** `text-[#701020]`
- **Body Copy Text:** `text-[#650d1c]` (or `text-[#5a0d1b]/80`)
- **Primary CTA Button (Light Mode):** `bg-[#701020] text-[#f8eee1] hover:bg-[#5a0d1b] border border-[#f1ca7e]/30 rounded-full transition-all duration-300`

---

## 3. Tailwind CSS & Zero Inline CSS Mandate

1. **Strictly Tailwind CSS Only:**
   - **100% of styling** (layout, flexbox/grid, spacing, typography, colors, borders, shadows, hover/focus states, responsiveness, and animations) MUST be written using Tailwind CSS utility classes directly in the JSX/TSX markup.
2. **Zero Inline CSS (`style={{...}}` is Banned):**
   - You are **STRICTLY FORBIDDEN** from writing inline `style={{ ... }}` attributes in JSX/HTML for colors, fonts, spacing, borders, or backgrounds.
   - Use Tailwind arbitrary values (e.g., `bg-[#701020]`, `text-[#f8eee1]`) or mapped theme tokens (e.g., `bg-crimson-core`, `text-cream-light`).
3. **Single Global CSS File Rule:**
   - Maintain **ONLY ONE** global stylesheet (`globals.css` or `index.css`).
   - Do **NOT** create component-level `.css`, `.scss`, or `.module.css` files.
   - Define your 7 color tokens in `tailwind.config.js` (or `@theme` in Tailwind v4) so the codebase stays clean:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        theme: {
          oxblood: '#5a0d1b',   // Dark 1 (Darkest)
          wine: '#650d1c',      // Dark 2 (Deep)
          crimson: '#701020',   // Dark 3 (Core Brand)
          ruby: '#89192c',      // Dark 4 (Elevated/Border)
          cream: '#f8eee1',     // Light 1 (Lightest Surface/Text)
          parchment: '#e8dcc6', // Light 2 (Secondary Surface/Muted Text)
          gold: '#f1ca7e',      // Accent (Primary Highlight/CTA)
        }
      }
    }
  }
}

```

---

## 4. Smooth Experience, Motion & UI Polish

Every view and interaction must feel fluid, cohesive, and intentional:

1. **Smooth Transitions Everywhere:**
* All interactive elements (buttons, cards, links, inputs, tabs) must include smooth Tailwind transitions: `transition-all duration-300 ease-out`.
* Global scrolling must use `scroll-smooth` on the root `<html>` element.


2. **Card & Button Hover Physics:**
* **Interactive Cards:** Apply subtle lift and border glow on hover: `hover:-translate-y-1 hover:border-[#f1ca7e]/60 hover:shadow-lg hover:shadow-[#5a0d1b]/20 transition-all duration-300`.
* **Buttons:** Apply micro-scale tactile feedback: `hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200`.


3. **Visual Hierarchy & Spacing:**
* Use generous section padding (`py-20 md:py-28 px-6 md:px-12`) and consistent container widths (`max-w-7xl mx-auto`).
* Separate stacked dark sections with subtle 1px borders (`border-b border-[#89192c]`) or smooth gradient transitions between `#5a0d1b`, `#650d1c`, and `#701020`.


4. **Performance Guardrails:**
* Animate only hardware-accelerated properties (`transform`, `opacity`, `colors`) and respect `motion-reduce:transition-none motion-reduce:hover:transform-none`.

## 5. Pre-Execution Checklist for the AI Agent

Before outputting any component code, verify:

* [ ] **Color Audit:** Are 100% of colors strictly from the 7 allowed hex codes (`#5a0d1b`, `#650d1c`, `#701020`, `#89192c`, `#f8eee1`, `#e8dcc6`, `#f1ca7e`)?
* [ ] **Zero Contraband Colors:** Did I eliminate all occurrences of `bg-white`, `text-black`, `text-gray-*`, `bg-neutral-*`, `#FFFFFF`, and `#000000`?
* [ ] **Zero Inline Styles:** Are there zero `style={{ ... }}` attributes in the JSX?
* [ ] **Contrast Check:** Are light texts (`#f8eee1`, `#e8dcc6`, `#f1ca7e`) used on dark crimson surfaces, and dark crimson texts (`#5a0d1b`, `#650d1c`, `#701020`) used on light cream/parchment surfaces?
* [ ] **Smooth Polish:** Do all buttons, links, and cards include smooth Tailwind hover and active transitions?
