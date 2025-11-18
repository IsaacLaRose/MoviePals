require('dotenv').config();
const { searchMovie } = require('./moviedb.js');

// Mock fetch globally
global.fetch = jest.fn();

describe('searchMovie', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should search for movies and return formatted results', async () => {
    // Mock TMDB API response
    const mockResponse = {
      results: [
        {
          id: 550,
          title: 'Fight Club',
          release_date: '1999-10-15',
          overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
          poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
        },
        {
          id: 551,
          title: 'Another Movie',
          release_date: '2000-01-01',
          overview: 'Another overview',
          poster_path: null
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    const results = await searchMovie('Fight Club');

    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/search/movie')
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('query=Fight%20Club')
    );

    // Verify results are formatted correctly
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      id: 550,
      title: 'Fight Club',
      release_date: '1999-10-15',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
      poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
    });

    // Verify null poster_path is handled
    expect(results[1].poster).toBeNull();
  });

  it('should handle empty search results', async () => {
    const mockResponse = {
      results: []
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    const results = await searchMovie('NonexistentMovie12345');

    expect(results).toHaveLength(0);
    expect(results).toEqual([]);
  });

  it('should properly encode special characters in query', async () => {
    const mockResponse = {
      results: []
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    await searchMovie('Star Wars: A New Hope');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('query=Star%20Wars%3A%20A%20New%20Hope')
    );
  });

  it('should handle API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(searchMovie('Test')).rejects.toThrow('Network error');
  });

  it('should include API key in request', async () => {
    const mockResponse = {
      results: []
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    await searchMovie('Test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`api_key=${process.env.TMDBKEY}`)
    );
  });

  it('should handle movies with missing fields', async () => {
    const mockResponse = {
      results: [
        {
          id: 123,
          title: 'Incomplete Movie',
          // missing release_date, overview, poster_path
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    const results = await searchMovie('Test');

    expect(results[0]).toEqual({
      id: 123,
      title: 'Incomplete Movie',
      release_date: undefined,
      overview: undefined,
      poster: null
    });
  });
});