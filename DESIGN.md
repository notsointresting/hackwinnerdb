# HackWinnerDB Design System & Reference Lock

This document locks the visual system, interaction tokens, and motion choreography for HackWinnerDB, derived from premier devtool and curated directory references (Linear, Raycast, Stripe, Vercel, Mobbin).

---

## 1. Reference Lock

- **Primary Direction:** Linear / Raycast dark editorial interface — deep obsidian/violet canvas, hairline luminous borders, high-contrast condensed typography, and glassy elevated surfaces.
- **Secondary Reference:** Vercel / Stripe modern developer directories — responsive interactive chips, clean data pills, micro-counters, infinite marquee tickers, and subtle gradient glows.
- **Preserve:**
  - Dark-only palette with deep obsidian ground (`#070210` / `#0f071d`)
  - Electric violet & magenta glow accents (`#b98bff`, `#7b3ff2`, `#d946ef`)
  - Heavy condensed display typography (`Archivo` with variable width axis)
  - Monospace accents for counts, years, and technologies (`JetBrains Mono`)
  - Verified source emerald badge (`#5ee9b5` / `rgba(94, 233, 181, 0.12)`)
- **Reject:**
  - Generic flat gray cards with no depth or glow
  - Oversaturated rainbow gradients with no role separation
  - Abrupt jumpy hover state transitions without easing curves
  - Cluttered multi-border containers

---

## 2. Token Commitments

| Role | Value / Variable | Purpose |
|------|------------------|---------|
| Canvas Background | `#070210` / `var(--bg)` | Deep cosmic black ground |
| Subtle Surface | `#0f071d` / `var(--bg-subtle)` | Base card & section surface with glass blur |
| Raised Glass Surface | `#170b2e` / `var(--bg-raised)` | Elevated modals & featured cards |
| Primary Text | `#f8f5ff` / `var(--fg)` | High-contrast crisp headlines & titles |
| Muted Text | `#a394c2` / `var(--fg-muted)` | Descriptions, metadata, secondary labels |
| Hairline Border | `rgba(255, 255, 255, 0.08)` / `#25173e` | Hairline card & container borders |
| Luminous Accent Line | `rgba(185, 139, 255, 0.28)` / `#4a2c7d` | Hover / active glow borders |
| Primary Accent | `#b98bff` / `var(--accent)` | Brand highlights, key links, active badges |
| Verified Mint | `#5ee9b5` / `var(--verified)` | Verified source stamp & live indicators |
| Glow Gradient A/B/C | `#7b3ff2`, `#2f7bff`, `#d946ef` | Radial mesh background & border aura |

---

## 3. Motion Lock

- **Motion Direction:** Modern spring-damped smoothness inspired by Linear & Raycast desktop-class web interactions.
- **Surface Tier:** Developer directory / Catalog -> **Continuity & Expressive Tier**.
- **Signature Move:**
  - **Dynamic Interactive Cursor Spotlight:** Real-time radial glow spotlight following cursor movement on winner cards and hero spotlight elements.
  - **Ambient Aurora Drift & Grid Mesh:** Ambient organic radial aura drift in the hero combined with dynamic border glow & smooth card lift on hover (`translateY(-4px)` with spring deceleration `cubic-bezier(0.16, 1, 0.3, 1)`).
  - **Infinite Tech & Event Marquee:** Smooth horizontal infinite ticker presenting trending winning technologies with live hover pause.
- **Easing Family:**
  - Primary Spring: `cubic-bezier(0.16, 1, 0.3, 1)` (duration: 300ms - 500ms)
  - Smooth Decay: `cubic-bezier(0.22, 1, 0.36, 1)` (duration: 600ms)
- **Choreography:**
  - **Entry:** Smooth staggered rise (`hw-rise`) with 30ms stagger steps for card grids and chips.
  - **Scroll Response:** CSS `view()`-based scroll reveal with opacity & subtle translate.
  - **Hover / Press:** Spring lift (`-translate-y-1.5`), border illumination, and radial spotlight glow.
  - **Exit / Modals:** Backdrop blur fade with scale `0.96 -> 1.0` pop.
- **Deliberately Still:**
  - Dense text descriptions, monospace tech names, and table data remain fixed without wobble to maximize legibility.
- **Reduced-Motion Plan:**
  - Replaces all transforms with instant opacity fades when `prefers-reduced-motion: reduce` is active.

---

## 4. Decision Ledger

1. **Full-Spectrum Page Elevation:** Modernized every page in the application (Landing, Categories, Category Details, Technologies, Tech Details, Hackathons, Hackathon Details, Yearly Archives, Project Details, Contribute, Dataset, and Methodology).
2. **Card Architecture:** Transformed static cards into elevated glass panels with translucent backgrounds (`bg-bg-subtle/70 backdrop-blur-md`), hairline borders (`border-line/70`), and interactive cursor spotlight glow.
3. **Hero Experience:** Enhanced search bar with luminous focus state, interactive live dot pills, variable width display typography, and an infinite technology marquee.
4. **Directory Polish:** Redesigned Categories, Technologies, and Hackathons directory views with frequency progress indicators, prize pool meters, and timeline grouping.
5. **Breadcrumbs & Navigation:** Transformed breadcrumbs into floating glass pills with chevrons and luminous active states.
