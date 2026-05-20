# Impeccable Audit — Healthy Rituals (healthyritualscoffee.com)

**Date:** 2026-05-03
**Scope:** index.html, product.html, about.html, contact.html, styles.css
**Register:** Brand (DTC marketing site, design IS the product)

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | No `:focus-visible` styles; gold-on-cream contrast fails AA |
| 2 | Performance | 4 | Compressed images, lazy loading, fetchpriority — well done |
| 3 | Responsive Design | 3 | Touch targets correct, mobile fixes shipped, minor breakpoints to refine |
| 4 | Theming | 4 | Clean CSS token system (`--green`, `--cream`, `--gold`); no hard-coded color leaks |
| 5 | Anti-Patterns | 3 | No gradient text, no side-stripe, no bouncy ease; some glassmorphism, em-dashes flagged but intentional |
| **Total** | | **16/20** | **Good — address weak dimensions** |

---

## Anti-Patterns Verdict

**Pass.** This does NOT look AI-generated.

Distinct identity. Quiet/considered palette. Editorial-italic typographic device (`<em>` inside large headings) is a real brand voice choice, not a stock SaaS reflex. No gradient text, no hero-metric template, no identical card grids dominating layout. No "AI training data" tells.

Minor watchouts:
- **Glassmorphism on nav + cart** (4 backdrop-filter uses). Purposeful on those surfaces; not decorative. Keep.
- **Em-dashes (31 across HTML)** violate the impeccable skill's literal copy law, but they read as intentional brand voice (the calm, considered MUD\WTR-adjacent register). **Treat as intentional, not a slop tell.** No action.

---

## Executive Summary

- **Score:** 16/20 (Good)
- **Issues:** 0 P0 · 3 P1 · 4 P2 · 3 P3
- **Top 3 critical issues:**
  1. **No focus-visible styles anywhere** — keyboard users cannot see what's focused. Hard a11y fail.
  2. **Gold (#c8b560) on cream (#f5f0e8) contrast = 1.81:1** — fails WCAG AA 4.5:1 by a wide margin. Used 28 times in styles.
  3. **Heading hierarchy skip on index.html** (h2 → h4 in ingredient section).

---

## Detailed Findings by Severity

### [P1] Missing focus indicators
- **Location:** `styles.css` — zero `:focus` or `:focus-visible` rules globally
- **Category:** Accessibility
- **Impact:** Keyboard-only users (and switch users, screen-reader users navigating with Tab) have no visual indication of which element is active. Total trap for non-mouse navigation.
- **WCAG:** 2.4.7 Focus Visible (Level AA)
- **Recommendation:** Add a global `:focus-visible` outline using `--green` at 2px offset on all interactive elements (`a, button, input, select, textarea, [tabindex]`). Keep `outline:none` only when paired with custom focus indicator.
- **Suggested command:** `impeccable harden`

### [P1] Gold-on-cream contrast fails WCAG AA
- **Location:** `styles.css:22` (--gold) used on cream backgrounds in 28+ places (tags, heading `em`, accent text)
- **Category:** Accessibility
- **Impact:** Computed contrast ratio 1.81:1 vs required 4.5:1 (or 3:1 for large text ≥18pt/24px). Heading `<em>` gold on cream is large enough to plausibly pass 3:1 in some cases but most uses still fail.
- **Computed ratio:** 1.81:1 (need 4.5:1)
- **WCAG:** 1.4.3 Contrast (Minimum) — Level AA
- **Recommendation:** Darken gold accent for use-on-cream contexts to ~`#8a7430` (ratio ~5.1:1). Keep current `--gold` for use on dark green hero overlays (where it passes easily). Introduce a second token: `--gold-text` for on-light surfaces.
- **Suggested command:** `impeccable colorize`

### [P1] Heading hierarchy skip on index.html
- **Location:** `index.html:243` (h2) immediately followed by `h4` at line 262 with no intervening h3
- **Category:** Accessibility
- **Impact:** Screen-reader rotor / outline navigation breaks. Users expect h2 → h3 → h4. Jumping levels is disorienting.
- **WCAG:** 1.3.1 Info and Relationships (Level A)
- **Recommendation:** Promote the in-card `<h4>` ingredient labels to `<h3>`, then the secondary `<h3>` blurbs below to `<h4>` (or paragraph if not a heading). Or restructure so ingredient cards live under their own h3.
- **Suggested command:** `impeccable harden`

### [P2] Loader image missing alt text
- **Location:** `*.html` — loader `<img src="Logo-SVG/...">` has `alt=""` (decorative). Verify this is intentional across all 4 pages.
- **Category:** Accessibility
- **Impact:** Decorative empty `alt=""` is fine for the loader (intentional). Footer logo `<img>` also uses `alt="Healthy Rituals"` already (correct). No fix needed — listed for confirmation.
- **Recommendation:** Confirm — no action.

### [P2] Serif and sans tokens point to same font
- **Location:** `styles.css:27-29` — `--serif`, `--sans`, `--brand` all = `'AlteHaas'`
- **Category:** Typography / Anti-Pattern (cognitive load)
- **Impact:** The `em` italic device in headings (e.g. "Find your <em>ritual</em>") is intended to be a serif-italic contrast against sans. With both fonts identical, the hierarchy collapses to italic-only. Loses the editorial feel the layout is reaching for.
- **Recommendation:** Either (a) load a real serif (Cormorant Garamond is already linked in `<head>` of all pages — but the `--serif` token doesn't reference it; it's only used inline in heading `em`s sometimes), or (b) commit fully to mono-font and lean harder on weight/scale contrast. Option (a) is the quick win — Cormorant is already in DOM.
- **Suggested command:** `impeccable typeset`

### [P2] Em-dashes in copy
- **Location:** 31 occurrences across HTML files
- **Category:** Anti-Pattern (skill law violation)
- **Impact:** **Likely intentional brand voice.** The Healthy Rituals copy register is calm/considered — em-dashes fit. Flagging because the impeccable skill bans them by default; you should consciously decide.
- **Recommendation:** **No action unless you want a different copy voice.** If keeping, document in PRODUCT.md so future audits don't re-flag.

### [P2] Cormorant Garamond preloaded but underused
- **Location:** All HTML `<head>` tags load Cormorant Garamond from Google Fonts, but `styles.css` `--serif` doesn't reference it
- **Category:** Performance / Theming consistency
- **Impact:** Loading ~50KB of font CSS that's largely unused. Either commit to using it (see P2 typography above) or remove the link tags.
- **Recommendation:** Decide alongside the typography token cleanup. If keeping the editorial-italic device, wire `--serif: 'Cormorant Garamond', serif;` and use it consistently.

### [P3] No `prefers-reduced-motion` media query
- **Location:** `styles.css` global — no reduced-motion override for GSAP scroll triggers, the hero video, or CSS transitions
- **Category:** Accessibility / Motion
- **Impact:** Users who set OS-level reduced-motion preference get the full animated experience. Triggers vestibular issues for some users.
- **WCAG:** 2.3.3 Animation from Interactions (Level AAA — but a P3-level expectation in modern design)
- **Recommendation:** Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }` near top of `styles.css`. Also pass the equivalent flag to GSAP.
- **Suggested command:** `impeccable animate`

### [P3] Cart drawer focus management
- **Location:** Cart drawer (`#cart` in all HTML files)
- **Category:** Accessibility
- **Impact:** When the drawer opens, focus does not move into it; when it closes, focus does not restore to the trigger. Keyboard users navigate away from their position in the page.
- **Recommendation:** In `script.js` / `shopify.js`, on cart open: store `document.activeElement`, move focus to the close button. On close: restore focus to the stored trigger.
- **Suggested command:** `impeccable harden`

### [P3] `<select>` styling could mark required state more obviously
- **Location:** `contact.html` — `Subject *` field
- **Category:** Form UX
- **Impact:** Asterisk is present and red, but the dropdown placeholder "Select a subject" doesn't visually distinguish from a chosen value until the user reads it.
- **Recommendation:** Style `:invalid` or `:placeholder-shown` state with a subtler text color so the placeholder reads as a prompt, not an entered value. Already partly handled via `disabled selected` option pattern.

---

## Patterns & Systemic Issues

1. **Color token system is excellent but missing accessibility-tier variants.** `--gold` is one color used in two contexts (on dark, on light) with very different contrast outcomes. Pattern: split into `--gold-bright` (current, for dark backgrounds) + `--gold-text` (darker, for cream backgrounds).
2. **Interactive states are visually under-defined.** No `:focus-visible`, no `:active`/`:hover` distinction on most buttons beyond brightness. Pattern affects every interactive surface — fix once at the token/utility layer.
3. **Motion is well-controlled where it exists** (no layout-animated properties, no bouncy easing) but `prefers-reduced-motion` is unhandled globally — single change, large impact.

---

## Positive Findings

- **Image performance is now excellent.** Lazy loading on thumbs/lifestyle band, `fetchpriority="high"` on the LCP product image, mozjpeg compression at q=92/2400px saved ~54MB. This is genuinely better than most production e-comm sites.
- **CSS token system is clean** — colors, eases, fonts all centralized. No hex sprinkled through component CSS.
- **Mobile work shipped well** — touch targets ≥44px on mobile (`.pdp__qty-btn`, `.nav__cart`, `.cart__qty button`), horizontal scroll fixed, grid track expansion fixed.
- **Easing curves are textbook** — `cubic-bezier(0.16, 1, 0.3, 1)` is ease-out-expo, the exact recommendation in the skill's motion law.
- **No AI-slop tells** — no gradient text, no hero-metric template, no side-stripe borders, no identical card grids. Distinct visual identity.
- **Semantic HTML mostly correct** — `<nav>`, `<header>`, `<section>`, `<footer>`, `<aside>` used appropriately. 26 ARIA attrs across pages.

---

## Recommended Actions (priority order)

1. **[P1] `impeccable harden`** — add `:focus-visible` styles + fix heading hierarchy on index.html + add cart drawer focus management. Single pass, high a11y impact.
2. **[P1] `impeccable colorize`** — introduce `--gold-text` token (~#8a7430) for on-cream usage; keep current `--gold` for on-dark contexts. Audit the 28 usages and reassign.
3. **[P2] `impeccable typeset`** — decide Cormorant Garamond in or out. If in, wire `--serif` and use the editorial-italic device consistently. If out, remove Google Fonts link.
4. **[P3] `impeccable animate`** — add `prefers-reduced-motion` global override and pass to GSAP ScrollTrigger.
5. **[Final] `impeccable polish`** — final pass after the above land.

---

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `impeccable audit` after fixes to see your score improve.
