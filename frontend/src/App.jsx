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
const [isLoggedIn, setIsLoggedIn] = useState(true);



  const handleLogin = () => {
    localStorage.setItem("loggedIn", "true");
    setIsLoggedIn(true);
  };

  return (
    <Router>

      {/* Navbar only when logged in */}
      {isLoggedIn && <NavBar />}

      <div className="App">
        <Routes>

          {/* Landing page (no navbar) */}
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



           
           <Route path="/friends" element={<Friends />} />
<Route path="/followers" element={<Followers />} />


          <Route
  path="/user/:username"
  element={isLoggedIn ? <UserProfile /> : <Navigate to="/login" replace />}
/>

<Route path="/movie/:id" element={<MovieDetails />} />


<Route path="/user/:username" element={<FriendProfile />} />



          <Route
            path="/profile"
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/ratings"
            element={isLoggedIn ? <Ratings /> : <Navigate to="/login" replace />}
          />

          {/* Logout */}
          <Route path="/logout" element={<Navigate to="/" replace />} />

          

        </Routes>
      </div>
    </Router>
  );
}

export default App;
