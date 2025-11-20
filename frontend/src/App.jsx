import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Home from "./components/Home/Home";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import MovieSearch from "./components/Movies/MovieSearch";
import Favorites from "./components/Favorites/Favorites";
import Followers from "./components/Followers/Followers";
import Friends from "./components/Friends/Friends";
import MovieDetails from "./components/MovieDetails/MovieDetails";
import NavBar from "./components/NavBar/NavBar";
import Ratings from "./components/Ratings/Ratings";
import Watchlist from "./components/Watchlist/Watchlist";
import Trending from "./components/Trending/Trending";
import Profile from "./components/Profile/Profile";
import UserProfile from "./components/Profile/UserProfile";
import Logout from "./components/Auth/Logout";
import FriendProfile from "./pages/FriendProfile"

import "./App.css";

function AppContent() {
  const location = useLocation();

  // hide navbar on these routes
  const hideNav = ["/login", "/register", "/"].includes(location.pathname);

  return (
    <>
      {!hideNav && <NavBar />}

      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<MovieSearch />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/followers" element={<Followers />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/ratings" element={<Ratings />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/user/:username" element={<FriendProfile />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
