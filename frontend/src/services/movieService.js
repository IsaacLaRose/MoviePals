import api from './api';



export const movieService = {
  // Search for movies
  searchMovies: async (searchTerm) => {
    const response = await api.get(`/api/movies/search?query=${searchTerm}`);
    return response.data;
  },



  // Get movie details
  getMovieDetails: async (movieId) => {
    const response = await api.get(`/api/movies/${movieId}`);
    return response.data;
  }
};



// Export individual functions for easier import
export const searchMovies = movieService.searchMovies;
export const getMovieDetails = movieService.getMovieDetails;