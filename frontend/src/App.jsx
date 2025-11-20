import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import Home from "./components/Home/Home";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import MovieSearch from "./components/Movies/MovieSearch";
import Profile from "./components/Profile/Profile";
import Ratings from "./components/Ratings/Ratings";
import Favorites from "./components/Favorites/Favorites";
import Friends from "./components/Friends/Friends";
import MovieDetails from "./components/MovieDetails/MovieDetails";
import FriendProfile from "./pages/FriendProfile/FriendProfile";

import "./App.css";

function App() {
  // ✔ Load login state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("loggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {/* Navbar only when logged in */}
      {isLoggedIn && <NavBar onLogout={handleLogout} />}

      <div className="App">
        <Routes>

          {/* Landing page (when logged out) */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/search" replace /> : <Home />
            }
          />

          {/* Login/Register */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/search"
            element={isLoggedIn ? <MovieSearch /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/favorites"
            element={isLoggedIn ? <Favorites /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/friends"
            element={isLoggedIn ? <Friends /> : <Navigate to="/login" replace />}
          />

          {/* ✔ ONLY ONE FRIEND PROFILE ROUTE */}
          <Route
            path="/user/:username"
            element={isLoggedIn ? <FriendProfile /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/movie/:id"
            element={isLoggedIn ? <MovieDetails /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/profile"
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/ratings"
            element={isLoggedIn ? <Ratings /> : <Navigate to="/login" replace />}
          />

          {/* Logout */}
          <Route path="/logout" element={<Navigate to="/login" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
