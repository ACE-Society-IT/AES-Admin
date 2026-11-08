# AES 2026 Master Admin Suite · Design System Specification
## Dual Executive Theme Architecture: "Espresso Umber" (Dark) & "Minimalist Warm Bone" (White)
### Main Theme: Warm Saddle Brown, Stark White, Deep Black & Stone Gray · Functional: Green, Red & Yellow

**Document Version:** 5.0  
**Scope:** Admin Portal Exclusively (`admin/src`) — Tournament Operations, Market Control, and Crisis Arbitration  
**Design Philosophy:** Dual Theme Minimalism · Grounded Executive Palette · High-Contrast Legibility · Zero AI Slop · Zero Emojis · 8px Rectangular Geometry  

---

## 1. System Vision & Architecture (Admin Only)

The **AES Master Admin Console** is a mission-critical operations cockpit built exclusively for tournament directors, lead arbitrators, and game masters overseeing Alpha Ace Olympiad 2026. 

### Why This Is Admin-Only
* **Zero Participant Bleed:** This portal contains no participant interfaces, consumer marketing fluff, or public play desks. It exposes raw controls: freezing markets, broadcasting geopolitical crises, auditing team balances, resetting rounds, and locking submission options.
* **Radical Cognitive Focus:** During live competitive rounds, administrators cannot be distracted by visual noise, glowing neon cyan/magenta gradients, or ambiguous emoji iconography.
* **Dual Theme Parity:** Both Dark Theme (for high-focus dim tournament control rooms) and White Theme (for bright arena auditoriums and daytime review) share the exact same executive hierarchy, contrast guarantees, and 8px rectangular geometry.

---

## 2. Color System & Design Tokens

### A. Dark Theme: "Espresso Umber"
For high-focus night shifts and dimly lit tournament master docks:

| Token | Hex Value | RGB / Alpha | Role & Application |
| :--- | :--- | :--- | :--- |
| `--admin-canvas` | `#0C0A09` | `rgb(12, 10, 9)` | Deep obsidian-espresso canvas background |
| `--admin-surface` | `#181513` | `rgb(24, 21, 19)` | Primary control card container surface |
| `--admin-surface-inset` | `#221D1A` | `rgb(34, 29, 26)` | Inset data wells, telemetry tracks, table headers |
| `--admin-surface-hover` | `#26201D` | `rgb(38, 32, 29)` | Hover state for interactive cards and rows |
| `--admin-border-subtle` | `#332A25` | `rgb(51, 42, 37)` | Clean hairline border between modules and sections |
| `--admin-border-focus` | `#8D5B3A` | `rgb(141, 91, 58)` | Focused input outline and active card selection |
| `--admin-brown-primary` | `#8D5B3A` | `rgb(141, 91, 58)` | Primary brand accent, insignia accents, key CTA framing |
| `--admin-brown-hover` | `#A56F48` | `rgb(165, 111, 72)` | Interactive hover state for brown CTAs |
| `--admin-ink-white` | `#FFFFFF` | `rgb(255, 255, 255)` | Primary headings, active values, AAA contrast (19.8:1) |
| `--admin-ink-bone` | `#F5EFEB` | `rgb(245, 239, 235)` | Secondary titles, table cells, high readability |
| `--admin-ink-gray` | `#A8A29E` | `rgb(168, 162, 158)` | Metadata descriptions, unit labels, inactive states |
| `--admin-ink-muted` | `#78716C` | `rgb(120, 113, 108)` | Timestamps, table column headers, helper notes |

---

### B. White Theme: "Minimalist Warm Bone"
For bright daytime environments, projection displays, and outdoor auditoriums:

| Token | Hex Value | RGB / Alpha | Role & Application |
| :--- | :--- | :--- | :--- |
| `--admin-canvas` | `#F9F8F6` | `rgb(249, 248, 246)` | Crisp, warm, non-glare minimalist white canvas |
| `--admin-surface` | `#FFFFFF` | `rgb(255, 255, 255)` | Pure stark white control card containers |
| `--admin-surface-inset` | `#F4EFEB` | `rgb(244, 239, 235)` | Warm bone inset trays, stat tiles, and table headers |
| `--admin-surface-hover` | `#F8F5F1` | `rgb(248, 245, 241)` | Hover highlight for interactive cards and list items |
| `--admin-border-subtle` | `#E5DFD7` | `rgb(229, 223, 215)` | Elegant warm stone hairline divider |
| `--admin-border-focus` | `#8D5B3A` | `rgb(141, 91, 58)` | Focused input outline and active card selection |
| `--admin-brown-primary` | `#8D5B3A` | `rgb(141, 91, 58)` | Grounded saddle brown primary action buttons & accents |
| `--admin-brown-hover` | `#73482C` | `rgb(115, 72, 44)` | Deepened brown hover state |
| `--admin-ink-white` | `#1C1917` | `rgb(28, 25, 23)` | Deep obsidian charcoal headings, AAA contrast (17.5:1) |
| `--admin-ink-bone` | `#44403C` | `rgb(68, 64, 60)` | Dark stone secondary titles and body text |
| `--admin-ink-gray` | `#78716C` | `rgb(120, 113, 108)` | Unit labels, metadata tags, and subtitles |
| `--admin-ink-muted` | `#A8A29E` | `rgb(168, 162, 158)` | Timestamps, table column headers, subtle indicators |

---

### C. Functional & Telemetry Tokens (Identical Semantic Logic)
Functional colors represent system reality with zero neon AI glow:

| Functional State | Hex Code (Dark) | Hex Code (White) | Soft Fill (12%) | Meaning in Admin Suite |
| :--- | :--- | :--- | :--- | :--- |
| **Operational Green** | `#16A34A` | `#15803D` | `rgba(22, 163, 74, 0.12)` | Live Socket Connected, Market Open, Cloud DB Synchronized, Option Unlocked |
| **Emergency Red** | `#DC2626` | `#B91C1C` | `rgba(220, 38, 38, 0.12)` | Emergency Stop, Option Locked, Disconnected Socket, Negative Delta, Destructive Reset |
| **Cautionary Yellow** | `#EAB308` | `#B45309` | `rgba(234, 179, 8, 0.12)` | Round Countdown Active, Pending Verification, Treasury Warning, Option Closing Soon |

---

## 3. Strict Typography & Geometric Rules

1. **Zero Emojis Everywhere:**
   - Any emoji (`🔥`, `🚀`, `⚠️`, `✅`, `❌`, `🔒`) is strictly forbidden.
   - Icons must use standard `lucide-react` SVGs with 1.5px/1.8px stroke width or semantic text labels.
2. **Rectangular Geometry (`rounded-lg` / 8px):**
   - Action buttons: `rounded-lg` (8px).
   - Input fields: `rounded-lg` (8px).
   - Filter pills & badges: `rounded-md` (6px) or `rounded-lg` (8px).
   - Card frames: `rounded-xl` (12px) to `rounded-2xl` (16px).
   - Circular "pill" buttons (`rounded-full`) are prohibited for admin operations to prevent toy-like aesthetics.
3. **Tabular Monospace Numerics:**
   - All timer readouts, portfolio balances, delta calculations, and percentage shifts use `font-mono tabular-nums` to guarantee steady screen rendering without layout jitter during live ticks.
4. **Theme Switcher Interface:**
   - Controlled via `Sun` (when dark) and `Moon` (when light) Lucide SVG icons in a rectangular `rounded-lg` secondary button.
   - Persisted across reloads in `localStorage.getItem('alphaace_admin_theme')`.
