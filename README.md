# Prism Visuals Budapest

Professional Photography & Videography Website

## Tech Stack

- **React 18** with JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Swiper.js** - Modern carousel/slider
- **react-i18next** - Internationalization (Hungarian/English)

## Architecture

This project follows the **Container/Presentation Pattern**:
- **Container Components** (`src/components/containers/`) - Handle state, logic, and data
- **Presentation Components** (`src/components/presentational/`) - Pure UI components
- **Pages** (`src/pages/`) - Top-level route components

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server will start at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── containers/       # Smart components with logic
│   ├── presentational/   # Dumb/pure UI components
│   └── layout/           # Layout wrapper components
├── pages/                # Route pages
├── i18n/                 # Internationalization config
│   └── locales/          # Translation files (hu.json, en.json)
├── assets/               # Static assets
├── utils/                # Utility functions and constants
├── App.jsx               # Main app component with routing
└── main.jsx              # Application entry point
```

## Features

- Responsive design (mobile, tablet, desktop)
- Hungarian/English language switching
- Image carousels with touch/swipe support
- Portfolio galleries with lightbox
- Contact form with validation
- Sticky navigation header
- SEO-friendly structure

## Pages

- **Home** (`/`) - Hero carousel, featured work, services overview
- **About** (`/about`) - About the photographers
- **Wedding Galleries** (`/wedding-galleries`) - Wedding portfolio
- **Portfolio** (`/portfolio`) - General photography work with filters
- **Pricing** (`/pricing`) - Service packages and pricing
- **Contact** (`/contact`) - Contact form and information

## Customization

### Fonts
The site uses:
- **Montserrat** (headings) - Bold, modern, geometric
- **Inter** (body text) - Clean, readable

### Colors
Defined in `tailwind.config.js`:
- `brand-primary`: #1a1a1a (dark)
- `brand-secondary`: #4a4a4a (medium gray)
- `brand-accent`: #f5f5f5 (light)

### Images
Currently using placeholder images from Unsplash. Replace URLs in `src/utils/constants.js` with actual images.

## Deployment

This project can be easily deployed to:
- **Vercel** - `vercel`
- **Netlify** - Drag & drop the `dist` folder after build
- **GitHub Pages** - Configure base path in `vite.config.js`

## License

© 2026 Prism Visuals Budapest. All rights reserved.