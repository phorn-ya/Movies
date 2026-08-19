# Reel House

A no-login movie discovery site built with React + Vite. It pulls movie
info from TMDB and shows where each title can be streamed, rented, or
bought (data sourced from JustWatch via TMDB's `/watch/providers`
endpoint). It doesn't host or stream any video itself — it links out
to legitimate providers.

## 1. Get a TMDB API key

1. Create a free account at https://www.themoviedb.org/signup
2. Go to Settings → API → request an API key (choose "Developer")
3. Copy your **API Key (v3 auth)**

## 2. Configure the project

```bash
cp .env.example .env
```

Open `.env` and paste your key:

```
VITE_TMDB_API_KEY=your_actual_key_here
```

## 3. Install and run

```bash
npm install
npm run dev
```

Visit the local URL Vite prints (usually http://localhost:5173).

## 4. Build for production

```bash
npm run build
npm run preview   # optional local check of the production build
```

The `dist/` folder is a static site — deploy it anywhere that serves
static files (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, etc.).

## Notes

- **No backend, no accounts.** All requests go straight from the browser
  to the TMDB API using your key. That means your key is visible in
  browser network requests — fine for TMDB's free tier and personal/
  small projects, but if you deploy this publicly at scale, consider
  adding a small serverless proxy (e.g. a Vercel/Netlify function) that
  holds the key server-side and adds caching.
- **Region matters.** Streaming availability differs by country. Use the
  region dropdown in the header — it's saved in the browser so it
  persists between visits.
- **Attribution.** Per TMDB's and JustWatch's terms, the footer credits
  TMDB and the "Where to Watch" panel credits JustWatch. Keep both if
  you deploy this.
- **This app links out, it doesn't stream.** Hosting copyrighted movies
  without a license is illegal; this project intentionally avoids that
  by only ever linking to legitimate providers.

## Project structure

```
src/
  api/tmdb.js              # all TMDB fetch calls
  context/RegionContext.jsx
  components/
    Header.jsx
    Footer.jsx
    MarqueeHero.jsx
    GenreFilter.jsx
    MovieGrid.jsx
    MovieCard.jsx
    WatchProviders.jsx
    SprocketDivider.jsx
  pages/
    Home.jsx
    SearchResults.jsx
    MovieDetail.jsx
  App.jsx
  main.jsx
  index.css
```
