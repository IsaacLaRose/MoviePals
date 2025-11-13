import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TMDBKEY;
export async function searchMovie(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();

  return data.results.map(movie => ({
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date,
    overview: movie.overview,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null //Want to give image too
  }));
}