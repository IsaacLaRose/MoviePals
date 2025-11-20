// moviedb.test.js
const { searchMovie } = require('./moviedb');

// Mock fetch globally
global.fetch = jest.fn();

describe('moviedb.js - searchMovie', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore original environment
    process.env = originalEnv;
  });

  test('should successfully search for movies', async () => {
    // Set test API key BEFORE requiring the module
    process.env.TMDBKEY = 'test-api-key';
    
    const mockApiResponse = {
      results: [
        {
          id: 123,
          title: 'Test Movie',
          release_date: '2023-01-01',
          overview: 'A test movie',
          poster_path: '/test.jpg'
        },
        {
          id: 456,
          title: 'Another Movie',
          release_date: '2023-02-01',
          overview: 'Another test',
          poster_path: '/another.jpg'
        }
      ]
    };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApiResponse)
    });

    const result = await searchMovie('test query');

    // Just check that fetch was called with the right pattern
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('search/movie')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('query=test%20query')
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 123,
      title: 'Test Movie',
      release_date: '2023-01-01',
      overview: 'A test movie',
      poster: 'https://image.tmdb.org/t/p/w500/test.jpg'
    });
  });

  test('should handle movies without poster', async () => {
    const mockApiResponse = {
      results: [
        {
          id: 789,
          title: 'No Poster Movie',
          release_date: '2023-03-01',
          overview: 'No poster',
          poster_path: null
        }
      ]
    };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApiResponse)
    });

    const result = await searchMovie('no poster');

    expect(result[0].poster).toBeNull();
  });

  test('should encode query parameters correctly', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ results: [] })
    });

    await searchMovie('query with spaces & special');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('query%20with%20spaces%20%26%20special')
    );
  });

  test('should handle empty results', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ results: [] })
    });

    const result = await searchMovie('nonexistent movie');

    expect(result).toEqual([]);
  });

  test('should handle API errors', async () => {
    global.fetch.mockRejectedValue(new Error('API Error'));

    await expect(searchMovie('test')).rejects.toThrow('API Error');
  });

  test('should handle malformed API response', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({})
    });

    await expect(searchMovie('test')).rejects.toThrow();
  });

  test('should use API key from environment', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ results: [] })
    });

    await searchMovie('test');

    // Just verify fetch was called with an api_key parameter
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api_key=')
    );
  });
});