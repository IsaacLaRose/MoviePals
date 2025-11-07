(() => {
  const API_BASE = './api/';
  const API_KEY = "eed58c3d";

  // ===== DOM HELPERS =====
  const id = (x) => document.getElementById(x);
  const qs = (sel, scope = document) => scope.querySelector(sel);
  const setMsg = (el, msg, ok = false) => {
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('success', !!ok);
  };
  const val = (idStr) => id(idStr).value.trim();

  // ===== ELEMENTS =====
  const authView = id('authView');
  const appView = id('appView');

  const loginForm = id('loginForm');
  const registerForm = id('registerForm');
  const loginMsg = id('loginMessage');
  const registerMsg = id('registerMessage');
  const logoutBtn = id('logoutBtn');

  const showRegisterBtn = id('showRegister');
  const showLoginBtn = id('showLogin');
  const loginSection = id('loginSection');
  const registerSection = id('registerSection');

  const feedView = id('feedView');
  const moviePage = id('moviePage');
  const profileView = id('profileView');
  const movieFeed = id('movieFeed');
  const userMoviesGrid = id('userMoviesGrid');
  const usernameHeader = id('usernameHeader');

  const searchMovies = id('searchMovies');
  const backToFeed = id('backToFeed');
  const backToFeed2 = id('backToFeed2');
  const profileBtn = id('profileBtn');

  const moviePoster = id('moviePoster');
  const movieTitle = id('movieTitle');
  const movieDescription = id('movieDescription');
  const ratingStars = id('ratingStars');
  const ratingComment = id('ratingComment');
  const submitRating = id('submitRating');
  const allReviews = id('allReviews');
  const emptyFeed = id('emptyFeed');

  // ===== STATE =====
  let currentUser = null;
  let currentMovie = null;
  let userRatings = {}; // { stars, comment, title, poster }

  // ===== API HANDLER =====
  async function api(endpoint, payload) {
    const res = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    const data = await res.json().catch(() => ({ error: 'Invalid JSON' }));
    if (!res.ok || data.error) {
      throw new Error(data.error || 'HTTP ' + res.status);
    }
    return data;
  }

  // ===== AUTH =====
  async function handleLogin(e) {
    e.preventDefault();
    setMsg(loginMsg, '');
    const login = val('login_login');
    const password = val('login_password');
    if (!login || !password) return setMsg(loginMsg, 'Enter credentials');

    try {
      const data = await api('Login.php', { login, password });
      currentUser = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      persistUser();
      enterApp();
    } catch (err) {
      setMsg(loginMsg, err.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMsg(registerMsg, '');
    const firstName = val('reg_first');
    const lastName = val('reg_last');
    const login = val('reg_login');
    const password = val('reg_password');
    if (!firstName || !lastName || !login || !password)
      return setMsg(registerMsg, 'All fields required');

    try {
      const data = await api('Register.php', {
        firstName,
        lastName,
        login,
        password,
      });
      currentUser = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      persistUser();
      enterApp();
    } catch (err) {
      setMsg(registerMsg, err.message);
    }
  }

  function persistUser() {
    if (currentUser)
      localStorage.setItem('user', JSON.stringify(currentUser));
  }

  function restoreUser() {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.id) {
          currentUser = u;
          enterApp();
        }
      }
    } catch (e) {}
  }

  function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    showAuth('login');
    movieFeed.innerHTML = '';
    userMoviesGrid.innerHTML = '';
  }

  // ===== VIEW CONTROLS =====
  function hideAllViews() {
    authView.classList.add('hidden');
    appView.classList.add('hidden');
    feedView.classList.add('hidden');
    moviePage.classList.add('hidden');
    profileView.classList.add('hidden');
  }

  function showAuth(mode = 'login') {
    hideAllViews();
    authView.classList.remove('hidden');
    if (mode === 'register') {
      loginSection.classList.add('hidden');
      registerSection.classList.remove('hidden');
    } else {
      registerSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
    }
    setMsg(loginMsg, '');
    setMsg(registerMsg, '');
  }

  function enterApp() {
    hideAllViews();
    appView.classList.remove('hidden');
    feedView.classList.remove('hidden');
    usernameHeader.textContent = `${currentUser.firstName}'s Library`;
    loadDefaultMovies();
  }

  function showMovieDetails(movie) {
    hideAllViews();
    appView.classList.remove('hidden');
    moviePage.classList.remove('hidden');
    currentMovie = movie;
    moviePoster.src = movie.Poster !== "N/A" ? movie.Poster : "assets/placeholder.jpg";
    movieTitle.textContent = `${movie.Title} (${movie.Year})`;
    movieDescription.textContent = movie.Plot || "No description available.";
    renderStars();
    renderReviews(movie.imdbID);
  }

  function showProfile() {
    hideAllViews();
    appView.classList.remove('hidden');
    profileView.classList.remove('hidden');
    renderProfile();
  }

  function backToMainFeed() {
    hideAllViews();
    appView.classList.remove('hidden');
    feedView.classList.remove('hidden');
  }

  // ===== OMDb MOVIE SEARCH =====
  searchMovies.addEventListener("keyup", async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) return;

    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
      const data = await response.json();

      if (data.Response === "True") {
        emptyFeed.classList.add("hidden");
        movieFeed.innerHTML = data.Search.map(movie => `
          <div class="movie-card" data-id="${movie.imdbID}">
            <img src="${movie.Poster !== "N/A" ? movie.Poster : "assets/placeholder.jpg"}" alt="${movie.Title} poster" />
            <div class="info">
              <div class="title">${movie.Title} (${movie.Year})</div>
              <div class="user">Click to rate or view</div>
            </div>
          </div>
        `).join("");
      } else {
        movieFeed.innerHTML = "";
        emptyFeed.textContent = "No movies found.";
        emptyFeed.classList.remove("hidden");
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  });

  // ===== SHOW MOVIE DETAILS ON CLICK =====
  movieFeed.addEventListener("click", async (e) => {
    const card = e.target.closest(".movie-card");
    if (!card) return;

    const movieId = card.dataset.id;
    const res = await fetch(`https://www.omdbapi.com/?i=${movieId}&plot=full&apikey=${API_KEY}`);
    const movie = await res.json();
    showMovieDetails(movie);
  });

  // ===== RENDER STARS / REVIEWS =====
  function renderStars() {
    ratingStars.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.textContent = '★';
      star.dataset.value = i;
      if (userRatings[currentMovie.imdbID]?.stars >= i)
        star.classList.add('active');
      star.addEventListener('click', () => selectStars(i));
      ratingStars.appendChild(star);
    }
  }

  function selectStars(value) {
    if (!currentMovie) return;
    if (!userRatings[currentMovie.imdbID])
      userRatings[currentMovie.imdbID] = { stars: 0, comment: '' };
    userRatings[currentMovie.imdbID].stars = value;
    renderStars();
  }

  function renderReviews(movieId) {
    allReviews.innerHTML = '';
    const userReview = userRatings[movieId];
    if (userReview) {
      const div = document.createElement('div');
      div.className = 'review-card';
      div.innerHTML = `
        <strong>You:</strong> ${'★'.repeat(userReview.stars)}
        <p>${userReview.comment || '(No comment)'}</p>
      `;
      allReviews.appendChild(div);
    } else {
      allReviews.innerHTML = '<p>No reviews yet.</p>';
    }
  }

  function renderProfile() {
    userMoviesGrid.innerHTML = '';
    const entries = Object.entries(userRatings);
    if (!entries.length) {
      userMoviesGrid.innerHTML =
        '<p class="empty">You haven’t rated any movies yet.</p>';
      return;
    }
    entries.forEach(([movieId, data]) => {
      const div = document.createElement('div');
      div.className = 'profile-movie';
      div.innerHTML = `
        <img src="${data.poster}" alt="${data.title}">
        <div class="title">${data.title} (${data.stars}★)</div>
      `;
      div.addEventListener('click', async () => {
        const res = await fetch(`https://www.omdbapi.com/?i=${movieId}&plot=full&apikey=${API_KEY}`);
        const movie = await res.json();
        showMovieDetails(movie);
      });
      userMoviesGrid.appendChild(div);
    });
  }

  // ===== RATING SUBMIT =====
  submitRating.addEventListener('click', () => {
    const comment = ratingComment.value.trim();
    const stars = userRatings[currentMovie.imdbID]?.stars || 0;
    if (!stars) return alert('Please select a star rating.');
    userRatings[currentMovie.imdbID] = {
      stars,
      comment,
      title: currentMovie.Title,
      poster: currentMovie.Poster,
    };
    ratingComment.value = '';
    alert('Rating saved!');
    renderReviews(currentMovie.imdbID);
  });

  // ===== DEFAULT MOVIES ON LOAD =====
  async function loadDefaultMovies() {
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=avengers&apikey=${API_KEY}`);
      const data = await res.json();
      if (data.Response === "True") {
        movieFeed.innerHTML = data.Search.map(movie => `
          <div class="movie-card" data-id="${movie.imdbID}">
            <img src="${movie.Poster}" alt="${movie.Title} poster" />
            <div class="info">
              <div class="title">${movie.Title} (${movie.Year})</div>
            </div>
          </div>
        `).join("");
      }
    } catch (err) {
      console.error("Default movie load failed:", err);
    }
  }

  // ===== EVENTS =====
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  logoutBtn.addEventListener('click', logout);
  showRegisterBtn.addEventListener('click', () => showAuth('register'));
  showLoginBtn.addEventListener('click', () => showAuth('login'));
  profileBtn.addEventListener('click', showProfile);
  backToFeed.addEventListener('click', backToMainFeed);
  backToFeed2.addEventListener('click', backToMainFeed);

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    currentUser = { id: 1, firstName: 'Demo', lastName: 'User' }; // temporary auto-login
    enterApp();
  });

})();
