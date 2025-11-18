import React, { useState, useEffect } from 'react';
import { searchMovies } from '../../services/movieService';
import './Movies.css';

function MovieSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounce timer reference
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMovies([]);
      setError('');
      return;
    }

    const delay = setTimeout(() => {
      autoSearch();
    }, 400); // wait 400ms after typing

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const autoSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await searchMovies(searchTerm);
      setMovies(data.results);

      if (data.results.length === 0) {
        setError('No movies found. Try a different search.');
      }
    } catch (err) {
      setError('Failed to search movies. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Keep button search working if user presses enter
  const handleSearch = (e) => {
    e.preventDefault();
    autoSearch();
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
          <div key={movie.id} className="movie-card">
            <img
              src={movie.poster ? movie.poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={movie.title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h3 className="movie-title">{movie.title}</h3>
              <p className="movie-year">{movie.release_date?.slice(0, 4)}</p>
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

