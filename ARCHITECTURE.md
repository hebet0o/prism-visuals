# Prism Visuals — Architecture Reference

> Personal photography portfolio for **Prism Visuals** (Budapest, Hungary).
> Built with React + Vite + TailwindCSS, backed by PocketBase.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Directory Structure](#directory-structure)
3. [Routing](#routing)
4. [Component Architecture](#component-architecture)
5. [Styling System](#styling-system)
6. [Internationalisation (i18n)](#internationalisation-i18n)
7. [Data Layer — PocketBase](#data-layer--pocketbase)
8. [Image / Asset Strategy](#image--asset-strategy)
9. [Hero Slider — Animation System](#hero-slider--animation-system)
10. [Authentication](#authentication)
11. [Build & Deploy](#build--deploy)
12. [Environment Variables](#environment-variables)
13. [AI Development Notes](#ai-development-notes)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI framework | React | 18.x |
| Bundler | Vite | 6.x |
| Styling | TailwindCSS v3 | 3.4.x |
| Routing | React Router v7 | 7.x |
| i18n | i18next + react-i18next | 24.x / 15.x |
| Backend / DB | PocketBase | 0.26.x |
| Photo carousel | Swiper | 11.x (installed, partially used) |
| Zip export | JSZip | 3.x |
| Deployment | Vercel | — |

---

## Directory Structure

```
prism-visuals/
├── public/
│   ├── favicon.png
│   ├── logosvg.svg
│   └── statikus-kepek/          ← all static photography assets
│       ├── main-page/           ← hero slider images
│       ├── featured/            ← homepage featured grid
│       ├── wedding/
│       │   ├── Andor-Barbi/
│       │   └── Heni-Krisztián/
│       ├── portrait/
│       └── events/
│
├── src/
│   ├── main.jsx                 ← React entry point (BrowserRouter + StrictMode)
│   ├── App.jsx                  ← Route definitions
│   ├── index.css                ← Global styles, Tailwind layers, keyframes
│   │
│   ├── pages/                   ← Route-level page components
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── WeddingGalleriesPage.jsx
│   │   ├── PortfolioPage.jsx
│   │   ├── PricingPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── GalleryPage.jsx      ← Protected guest gallery (no layout wrapper)
│   │   ├── LoginPage.jsx        ← Admin login (no layout wrapper)
│   │   ├── AdminDashboard.jsx   ← Admin panel (behind ProtectedRoute)
│   │   └── MaintenancePage.jsx  ← Commented out in App.jsx
│   │
│   ├── components/
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx   ← Admin auth guard
│   │   ├── layout/
│   │   │   └── Layout.jsx       ← Header + main + Footer shell
│   │   ├── presentational/      ← Stateless / display components
│   │   │   ├── Hero.jsx         ← Homepage hero slider (see animation docs)
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   ├── GalleryGrid.jsx
│   │   │   ├── ImageCarousel.jsx
│   │   │   ├── ReviewCarousel.jsx
│   │   │   ├── ReviewForm.jsx
│   │   │   ├── PricingCard.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   └── LanguageSwitch.jsx
│   │   └── containers/          ← Stateful wrappers that fetch data
│   │       ├── GalleryContainer.jsx
│   │       ├── PortfolioContainer.jsx
│   │       ├── ContactContainer.jsx
│   │       └── PricingContainer.jsx
│   │
│   ├── hooks/
│   │   └── useReviews.js        ← Fetches/posts reviews via PocketBase
│   │
│   ├── utils/
│   │   ├── constants.js         ← PLACEHOLDER_IMAGES, CATEGORIES, SOCIAL_LINKS
│   │   ├── pocketbase.js        ← PocketBase client singleton
│   │   ├── guestAuth.js         ← Guest token + localStorage helpers
│   │   └── helpers.js           ← Misc utility functions
│   │
│   └── i18n/
│       ├── config.js            ← i18next init (EN default, HU alternate)
│       └── locales/
│           ├── en.json
│           └── hu.json
│
├── index.html                   ← Vite entry HTML
├── vite.config.js               ← Vite config (port 3000, auto-open)
├── tailwind.config.js           ← Design tokens (colors, fonts, spacing)
├── postcss.config.js
├── vercel.json                  ← SPA rewrites for client-side routing
├── .env                         ← VITE_POCKETBASE_URL (gitignored)
└── package.json
```

---

## Routing

Defined in `src/App.jsx`. All public routes are wrapped in `<Layout>` (Header + Footer).
Two routes intentionally bypass Layout for full-screen experiences:

| Path | Component | Layout? | Notes |
|---|---|---|---|
| `/` | `HomePage` | Yes | Hero slider, featured grid, reviews, services |
| `/about` | `AboutPage` | Yes | |
| `/wedding-galleries` | `WeddingGalleriesPage` | Yes | Gallery index |
| `/portfolio` | `PortfolioPage` | Yes | |
| `/pricing` | `PricingPage` | Yes | |
| `/contact` | `ContactPage` | Yes | |
| `/gallery/:name` | `GalleryPage` | **No** | Full-screen guest gallery |
| `/login` | `LoginPage` | **No** | Admin login |
| `/admin` | `AdminDashboard` | **No** | Behind `<ProtectedRoute>` |

`vercel.json` rewrites all unmatched requests to `/index.html` for client-side routing to work on Vercel.

---

## Component Architecture

The project follows a **containers / presentational** split:

- **Presentational** (`src/components/presentational/`) — pure rendering, props-in/JSX-out, no direct API calls.
- **Containers** (`src/components/containers/`) — own local state, call PocketBase, pass data down.
- **Pages** (`src/pages/`) — assemble containers + presentational components; handle route-level concerns.

```
Page
 └── Container   (data fetching, local state)
      └── Presentational   (rendering only)
```

### Key Components

#### `Hero.jsx`
Full-screen image slider with Ken Burns zoom and crossfade transitions.
See [Hero Slider — Animation System](#hero-slider--animation-system) for full details.

#### `Header.jsx`
Sticky navigation with language switch and links. Uses `useTranslation`.

#### `GalleryPage.jsx`
Password-protected guest gallery. Guests enter a PIN, receive an access token stored in `localStorage`, and can view/like/download photos. Uses `guestAuth.js` + PocketBase.

#### `AdminDashboard.jsx`
Full admin panel: manage weddings, upload photos, manage guest access, review moderation.

---

## Styling System

All styles flow through **TailwindCSS v3** with a custom design system defined in `tailwind.config.js`.

### Design Tokens

```js
// tailwind.config.js
colors: {
  brand: {
    black:          '#100f0f',   // page background
    dark:           '#1a1917',   // section alternates
    charcoal:       '#2a2826',   // cards, borders
    bronze:         '#9f8b6b',   // primary accent (bronze)
    'bronze-light': '#c4aa85',
    'bronze-dark':  '#7a6a50',
    warm:           '#f7f8f7',   // primary text
    offwhite:       '#ede9e3',   // secondary text
    muted:          '#9a9690',   // tertiary text
  }
}

fontFamily: {
  display: ['Playfair Display', 'Georgia', 'serif'],   // headings, taglines
  heading: ['Montserrat', 'sans-serif'],               // labels, buttons
  body:    ['Montserrat', 'sans-serif'],               // body text
}
```

### Component Classes (in `index.css`)

| Class | Purpose |
|---|---|
| `.btn-primary` | Bronze-bordered button |
| `.btn-ghost` | Warm-white-bordered button |
| `.section-label` | Uppercase bronze tracking label |
| `.section-title` | Large display heading |
| `.divider-line` | 12px bronze horizontal rule |
| `.text-balance` | `text-wrap: balance` |
| `.tracking-display` | `letter-spacing: 0.25em` |

### Global Keyframes

```css
/* Two identically-behaving keyframes with different names.
   Hero.jsx alternates between them so the browser restarts
   the keyframe on new images without needing DOM remounting. */
@keyframes slow-zoom-0 { from: scale(1.05) -> to: scale(1.12) }
@keyframes slow-zoom-1 { /* identical */ }
```

---

## Internationalisation (i18n)

- **Default language**: English (`en`)
- **Alternate**: Hungarian (`hu`)
- Configured in `src/i18n/config.js` via `i18next`
- Translations live in `src/i18n/locales/{en,hu}.json`
- Used via `const { t } = useTranslation()` throughout components
- Language toggle: `LanguageSwitch.jsx` in the Header

---

## Data Layer — PocketBase

**PocketBase** is a self-hosted open-source backend (SQLite + REST + realtime subscriptions).

- **Host**: `https://api.prismvisuals.hu`
- **Admin UI**: `https://api.prismvisuals.hu/_/`
- **Client**: singleton exported from `src/utils/pocketbase.js`
- Auto-cancellation disabled (`pb.autoCancellation(false)`) to prevent realtime subscription teardown issues

### Known Collections

| Collection | Used for |
|---|---|
| `reviews` | Customer review submissions (fetched by `useReviews.js`) |
| `guest_users` | Guest PIN access records for protected galleries |

### `useReviews` hook
`src/hooks/useReviews.js` — fetches approved reviews on mount, exposes `addReview(data)` for form submission.

---

## Image / Asset Strategy

All photography images are **static files** served from `/public/statikus-kepek/`.
Image paths are defined in `src/utils/constants.js` under `PLACEHOLDER_IMAGES`.

> **"statikus-kepek"** means "static images" in Hungarian.

### Hero Images
```js
// src/utils/constants.js
PLACEHOLDER_IMAGES.hero = [
  '/statikus-kepek/main-page/heni-krisz.jpg',
  '/statikus-kepek/main-page/IMG_0798.jpg',
  '/statikus-kepek/main-page/IMG_1636.jpg',
  '/statikus-kepek/main-page/IMG_2178.jpg',
]
```

To add a new hero image: drop the JPEG into `public/statikus-kepek/main-page/` and append the path to the `hero` array in `constants.js`.

---

## Hero Slider — Animation System

### The Original Bug

The original `Hero.jsx` conditionally rendered the next image (`nextImage && <img />`), causing three compounding issues:

**1. DOM remount flash (main cause)**
Each transition, React mounted a brand-new `<img>` element for the incoming image.
The CSS class `animate-slow-zoom` (`animation: slow-zoom 8s forwards`) would restart from `scale(1.05)` on the freshly-mounted element, but the browser painted one unconstrained frame before the animation engine kicked in — producing a visible flash/pop.

**2. Opacity cleanup race condition**
After the 800ms fade, a 50ms cleanup timeout removed the `nextImage` element from the DOM.
In some paint cycles, the element was removed before the transition actually finished rendering at the browser level, causing an abrupt cut on the second and every subsequent transition.

**3. React StrictMode double-fire**
`React.StrictMode` double-invokes effects in development. The cascade of 5 `useEffect` hooks (each depending on the previous state) would fire twice, creating interval timing drift and amplifying the flash.

### The Fix — Two-Slot Pattern

`Hero.jsx` now uses a **persistent two-slot DOM pattern**:

```
Slot A [img]   opacity-100  (visible, Ken Burns zooming)
Slot B [img]   opacity-0    (hidden, holds next image while preloading)
```

Both `<img>` elements are **always in the DOM**. We alternate which slot is active.

**Transition sequence per slide change:**
1. Timer fires → compute `nextIdx = (current + 1) % images.length`
2. Preload: `new Image(); img.src = nextSrc; img.onload = doSwap`
3. `doSwap()`: write new `src` + bump `zoomKey` on the **inactive** slot
4. Double `requestAnimationFrame` → browser paints the new src (still at `opacity-0`)
5. Flip `activeSlot` → CSS `transition-opacity duration-[800ms]` crossfade begins
6. `setTimeout(800ms + 50ms)` releases `transitioningRef` lock for the next cycle

**The `zoomKey` trick:**
CSS only restarts a keyframe animation when `animation-name` changes.
Since slots are permanent DOM nodes, we cannot rely on mount/unmount.
`zoomKey % 2` toggles between `slow-zoom-0` and `slow-zoom-1` — two identically-behaving keyframes with different names.
The browser detects a name change → restarts the animation from `scale(1.05)` on the incoming slot only.

**Key constants in `Hero.jsx`:**
```js
const TRANSITION_DURATION = 800   // ms – keep in sync with CSS transition-duration
const SLIDE_INTERVAL      = 6000  // ms – net display time per slide
```

**Key implementation notes:**
- All mutable slider state (`currentIdx`, `activeSlot`, `transitioning`) is stored in **refs** to avoid stale closure issues inside the `setInterval` callback.
- Only rendering-relevant state (`activeSlot`, `slots`) goes through `useState`.
- Preload ref (`preloadRef`) is cancelled on effect cleanup to prevent stale `onload` callbacks.

---

## Authentication

### Admin Auth
- PocketBase native email/password auth at `/login`
- `ProtectedRoute.jsx` checks `pb.authStore.isValid`
- Redirects to `/login` if unauthenticated

### Guest Auth
- Token-based, persisted in `localStorage`
- `guestAuth.js` provides:
  - `loginGuest(galleryId, name, pin)` — match against `guest_users` collection
  - `registerGuest(galleryId, name, pin, token)` — create guest record
  - `loadGuestUserByToken(token)` — restore session from stored token
  - `updateGuestUserLikes(guestId, likedPhotoIds)` — sync liked photos
- Liked photos stored as JSON array in the guest's PocketBase record

---

## Build & Deploy

```bash
# Development (http://localhost:3000, auto-opens browser)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

**Deployment**: Vercel (connected via git).
`vercel.json` rewrites all unmatched routes to `/index.html` for SPA client-side routing.

---

## Environment Variables

Create `.env` in project root (already gitignored via `.gitignore`):

```env
VITE_POCKETBASE_URL=https://api.prismvisuals.hu
```

All Vite env vars must be prefixed with `VITE_` to be accessible in the browser bundle.
Accessed in code via `import.meta.env.VITE_POCKETBASE_URL`.

---

## AI Development Notes

Tips and gotchas specifically useful for AI-assisted development.

### Styling Rules
- **Always use `brand-*` color tokens**, never raw hex or default Tailwind colors.
- Use `font-display` (Playfair Display) for headings/taglines.
- Use `font-heading` / `font-body` (Montserrat) for labels, buttons, body text.
- Standard section structure: `section-label` → `divider-line` → body text.
- Do NOT use TailwindCSS v4 syntax — the project is on **Tailwind v3**.

### State Management
- No global state manager (no Redux, no Zustand). State is local or lifted to the nearest common parent.
- PocketBase subscriptions use `pb.autoCancellation(false)` (set in singleton).

### Image Slider / Carousel Rules
- Always preload the **next** image with `new Image()` before transitioning.
- **Never conditionally mount/unmount image elements** in animation-heavy components — use `opacity` and `z-index` instead.
- The **double-rAF pattern** (`requestAnimationFrame(() => requestAnimationFrame(...))`) is critical for ensuring the browser has painted before starting a CSS transition.
- To restart a CSS keyframe on a persistent DOM node, alternate the `animation-name` property between two identically-behaving keyframes.

### React StrictMode
The app runs in `React.StrictMode` in development, which double-invokes effects and renders.
Any timer/interval logic **must** use refs for mutable values (not state) to avoid double-fire bugs.
When debugging, test both dev and production builds — StrictMode behavior disappears in production.

### Hungarian Naming
You may encounter Hungarian words in the codebase:
- `statikus-kepek` = static images
- `kepek` = images
- `esküvő` / `eskuvo` = wedding

### Adding New Pages
1. Create `src/pages/NewPage.jsx`
2. Add `<Route>` in `App.jsx` (wrap in `<Layout>` for standard pages)
3. Add translation keys to both `src/i18n/locales/en.json` and `hu.json`
4. Add nav link to `Header.jsx` if publicly navigable

### Adding New Hero Images
1. Drop JPEG into `public/statikus-kepek/main-page/`
2. Append path to `PLACEHOLDER_IMAGES.hero` in `src/utils/constants.js`

### Adding a New Wedding Gallery
1. Create `public/statikus-kepek/wedding/CoupleName/`
2. Add entry to `PLACEHOLDER_IMAGES.wedding` array in `constants.js`
3. `WeddingGalleriesPage` and `GalleryPage` consume this array automatically

### Common Pitfalls
- `transition-opacity` in Tailwind sets only `transition-property: opacity`.
  The duration is separate. In Hero.jsx, the 800ms duration is enforced via a global override in `index.css` (`.transition-opacity { transition-duration: 800ms }`).
- The `swiper` package is installed but used selectively — some carousels are custom implementations.
- `GalleryPage` and `LoginPage` have **no** `<Layout>` wrapper by design — they are full-screen standalone experiences.
- The `MaintenancePage` exists but is commented out in `App.jsx` — uncomment and re-route `/` to activate site-wide maintenance mode.
