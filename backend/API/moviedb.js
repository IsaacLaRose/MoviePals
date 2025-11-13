import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TMDBKEY;
export async function searchMovie(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results;
}