import React, { useState } from 'react';
import { searchMovies } from '../../services/movieService';
import './Movies.css';



function MovieSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const handleSearch = async (e) => {
    e.preventDefault();
  
    

    if (!searchTerm.trim()) {
      setError('Please enter a movie name');
      return;
    }



    setLoading(true);
    setError('');



    try {
      // This will call your backend API
      const results = await searchMovies(searchTerm);
      setMovies(results);
    
      

      if (results.length === 0) {
        setError('No movies found. Try a different search.');
      }
    } catch (err) {
      setError('Failed to search movies. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (

    <div className="movie-search-container">
      {/* Search Bar */}
      <div className="search-section">
        <h1>Search Movies</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Enter movie name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>



      {/* Movie Results */}
      <div className="movie-results">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie-card">
            <img 
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
              alt={movie.Title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h3 className="movie-title">{movie.Title}</h3>
              <p className="movie-year">{movie.Year}</p>
              <button className="rate-button">Rate This Movie</button>
            </div>
          </div>
        ))}
      </div>



      {movies.length === 0 && !loading && !error && (
        <div className="empty-state">
          <p>Search for a movie to get started!</p>
        </div>
      )}
    </div>
  );
}



export default MovieSearch;
