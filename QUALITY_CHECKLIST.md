# Staging Quality Checklist

Before promoting a restaurant website from **Ready for Polish** to the **Polished Showcase**, the reviewer must verify and check off the following items. These items map directly to fields in `restaurant.json` and must be fully verified.

---

## 1. Information Accuracy
- [ ] **Restaurant Name**: Spelling matches official legal/branding name.
- [ ] **Address**: Verified against Google Maps and official website.
- [ ] **Phone Number**: Correct format and dials the correct location.
- [ ] **Hours**: Match current operating hours (verified within 30 days).
- [ ] **Social Profiles**: Links to Facebook, Instagram, etc., are valid.
- [ ] **Menu Links**: Internal menu page displays the correct layout; any external PDF or online ordering links are working.
- [ ] **Current-site URL**: Set correctly in `restaurant.json`.

---

## 2. Technical Quality & Responsiveness
- [ ] **Desktop Layout**: Verified at `1440px` and `1920px` widths (no horizontal scrollbars, text overflows, or alignment issues).
- [ ] **Tablet Layout**: Verified at `768px` and `1024px` widths (navigation menu collapses correctly, columns stack nicely).
- [ ] **Mobile Layout**: Verified at `375px` and `414px` widths (touch target sizes are >= 44x44px, margins are safe, typography scales appropriately).
- [ ] **Navigation & CTAs**: Home, menu, about, experience, conversion, and visit pages are reachable. Action buttons link to active paths.
- [ ] **Contact Forms**: Verified that forms prevent default submissions or connect to working mocks without throwing errors.

---

## 3. Media & Performance
- [ ] **Image Optimization**: Images are compressed (e.g. WebP/AVIF format where possible) and scale correctly.
- [ ] **Alt Text**: All structural and informational images have descriptive `alt` tags.
- [ ] **Loading & Animations**: Animations are smooth. Page loading is fast and does not trigger visual layout shifts.
- [ ] **Reduced-motion**: Respects user media preferences if animations are heavy.

---

## 4. Current-Site Comparison
- [ ] **Floating Button**: Reusable `comparison-button.js` is included on all pages.
- [ ] **Correct Link**: The button opens the current website/online presence in a new tab with `target="_blank" rel="noopener noreferrer"`.
- [ ] **Overlay Check**: Floating button does not overlap critical nav or CTAs (e.g., bottom-right CTA).

---

## 5. Build & Compliance
- [ ] **Console Errors**: Zero console errors or warnings in the browser developer tools.
- [ ] **HTML/CSS Validation**: Clear semantic tags used, unique IDs, no broken files.
- [ ] **Metadata**: Correct SEO titles, meta descriptions, and open graph tags on all six pages.
- [ ] **Production Build**: Passes static analysis, code linting, or any local test suite.
