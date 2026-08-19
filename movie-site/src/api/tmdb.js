const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/'

async function tmdbFetch(path, params = {}) {
  if (!API_KEY) {
    throw new Error(
      'Missing TMDB API key. Copy .env.example to .env and add VITE_TMDB_API_KEY.'
    )
  }
  const url = new URL(BASE_URL + path)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status})`)
  }
  return res.json()
}

// size: 'w200' | 'w342' | 'w500' | 'w780' | 'original' etc.
export function getImageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE}${size}${path}` : null
}

export const getTrending = () => tmdbFetch('/trending/movie/week')

export const getPopular = (page = 1) => tmdbFetch('/movie/popular', { page })

export const getTopRated = (page = 1) => tmdbFetch('/movie/top_rated', { page })

export const getNowPlaying = (page = 1) => tmdbFetch('/movie/now_playing', { page })

export const getGenres = () => tmdbFetch('/genre/movie/list')

export const discoverMovies = ({ genreId, page = 1, sortBy = 'popularity.desc' } = {}) =>
  tmdbFetch('/discover/movie', { with_genres: genreId, page, sort_by: sortBy })

export const searchMovies = (query, page = 1) =>
  query ? tmdbFetch('/search/movie', { query, page }) : Promise.resolve({ results: [], total_pages: 0 })

export const getMovieDetails = (id) => tmdbFetch(`/movie/${id}`)

export const getWatchProviders = (id) => tmdbFetch(`/movie/${id}/watch/providers`)

// Fetch videos (trailers, teasers, clips) for a movie
export const getMovieVideos = (id) => tmdbFetch(`/movie/${id}/videos`)

// Find the best trailer/teaser YouTube key from a videos response
export function findTrailerKey(videosData) {
  if (!videosData?.results?.length) return null

  const results = videosData.results

  // Prefer official trailers, then any trailers, then teasers
  const officialTrailer = results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
  )
  if (officialTrailer) return officialTrailer.key

  const trailer = results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  )
  if (trailer) return trailer.key

  const teaser = results.find(
    (v) => v.site === 'YouTube' && v.type === 'Teaser'
  )
  if (teaser) return teaser.key

  // Fall back to any YouTube video
  const anyYouTube = results.find((v) => v.site === 'YouTube')
  return anyYouTube?.key ?? null
}
