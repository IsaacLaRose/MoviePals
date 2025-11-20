import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./FriendProfile.css";

function FriendProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [friend, setFriend] = useState(null);
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sharedMovies, setSharedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const myUserId = localStorage.getItem("userId");

  useEffect(() => {
    async function loadFriendProfile() {
      try {
        // Load your friends
        const res = await api.post("/api/viewFriendsList", { userId: myUserId });
        const allFriends = res.data.friendsList || [];

        // Find the friend in URL
        const target = allFriends.find((f) => f.username === username);

        if (!target) {
          setLoading(false);
          return;
        }

        setFriend(target);

        // Load friend's ratings
        const ratedRes = await api.post("/api/getMoviesSeen", {
          userId: target.friendsId,
        });

        const friendMovies = ratedRes.data.movies || [];

        const favs = friendMovies.filter((m) => m.rating == 5);
        const nonFavs = friendMovies.filter((m) => m.rating != 5);

        setFavorites(favs);
        setMovies(nonFavs);

        // Load your movies to compute shared
        const myMoviesRes = await api.post("/api/getMoviesSeen", {
          userId: myUserId,
        });

        const myMovies = myMoviesRes.data.movies || [];

        const shared = friendMovies.filter((fm) =>
          myMovies.some((mm) => mm.tmdbId === fm.tmdbId)
        );

        setSharedMovies(shared);
      } catch (err) {
        console.error("Error loading friend profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFriendProfile();
  }, [username, myUserId]);

  // 🔥 Remove friend
  const handleUnfriend = async () => {
    if (!window.confirm(`Remove ${friend.username} from your friends?`)) return;

    try {
      await api.post("/api/removeFriend", {
        userId: myUserId,
        friendId: friend.friendsId,
      });

      // Redirect back to Friends page
      navigate("/friends");
    } catch (err) {
      console.error("Error removing friend:", err);
      alert("Failed to remove friend.");
    }
  };

  if (loading) return <div className="fp-loading">Loading profile...</div>;

  if (!friend) {
    return (
      <div className="fp-error">
        <h2>User Not Found</h2>
        <p>This friend does not exist or is no longer connected.</p>
      </div>
    );
  }

  return (
    <div className="fp-page">
      {/* HEADER SECTION */}
      <div className="fp-header">
        <img
          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`}
          className="fp-avatar"
          alt={friend.username}
        />

        <h1 className="fp-name">
          {friend.firstName} {friend.lastName}
        </h1>

        <p className="fp-username">@{friend.username}</p>

        <p className="fp-stats">
          {movies.length + favorites.length} ratings • {favorites.length} favorites •{" "}
          {sharedMovies.length} shared
        </p>

        {/* ⭐ UNFRIEND BUTTON */}
        <button className="fp-unfriend-btn" onClick={handleUnfriend}>
          Remove Friend
        </button>
      </div>

      {/* SHARED MOVIES */}
      {sharedMovies.length > 0 && (
        <div className="fp-section">
          <h2>Shared Movies</h2>
          <div className="fp-movie-grid">
            {sharedMovies.map((m) => (
              <div key={m.tmdbId} className="fp-movie-card">
                <img src={m.poster} alt={m.title} />
                <p>{m.title}</p>
                <p className="fp-stars">{"★".repeat(m.rating)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAVORITES */}
      <div className="fp-section">
        <h2>Favorites</h2>
        {favorites.length === 0 ? (
          <p className="fp-empty">No 5-star movies yet.</p>
        ) : (
          <div className="fp-movie-grid">
            {favorites.map((m) => (
              <div key={m.tmdbId} className="fp-movie-card">
                <img src={m.poster} alt={m.title} />
                <p>{m.title}</p>
                <p className="fp-stars">{"★".repeat(m.rating)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTHER RATINGS */}
      <div className="fp-section">
        <h2>Ratings</h2>
        {movies.length === 0 ? (
          <p className="fp-empty">No ratings yet.</p>
        ) : (
          <div className="fp-movie-grid">
            {movies.map((m) => (
              <div key={m.tmdbId} className="fp-movie-card">
                <img src={m.poster} alt={m.title} />
                <p>{m.title}</p>
                <p className="fp-stars">{"★".repeat(m.rating)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to="/friends" className="fp-back-btn">
        ← Back to Friends
      </Link>
    </div>
  );
}

export default FriendProfile;
