import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Friends.css";

function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchFriends() {
      try {
        const response = await axios.post("/api/viewFriendsList", {
          userId,
        });

        // Attach mock movies for each friend (demo only)
        const friendsWithMovies = response.data.friendsList.map((friend) => ({
          ...friend,
          avatar: `https://i.pravatar.cc/150?u=${friend.friendsId}`,
          movies: [
            {
              id: 1,
              title: "Inception",
              poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
              rating: 5,
            },
            {
              id: 2,
              title: "Spider-Man",
              poster: "https://image.tmdb.org/t/p/w500/r7XifzvtezNtF1epF1mjM25s9pA.jpg",
              rating: 4,
            },
          ],
        }));

        setFriends(friendsWithMovies);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, [userId]);

  if (loading) return <p className="friends-loading">Loading friends...</p>;

  return (
    <div className="friends-page">
      <h1 className="friends-title">Friends</h1>

      {friends.length === 0 && (
        <p className="friends-empty">You haven't added any friends yet.</p>
      )}

      <div className="friends-list">
        {friends.map((friend) => (
          <Link
            key={friend.friendsId}
            to={`/user/${friend.username}`}
            className="friend-card-link"
          >
            <div className="friend-card">
              <div className="friend-header">
                <img
                  src={friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <h3 className="friend-name">{friend.username}</h3>
              </div>

              <div className="friend-movies">
                {friend.movies.map((movie) => (
                  <div key={movie.id} className="friend-movie">
                    <img src={movie.poster} alt={movie.title} />
                    <p className="friend-movie-title">{movie.title}</p>
                    <p className="friend-movie-rating">
                      {"★".repeat(movie.rating)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Friends;
