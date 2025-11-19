import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

function UserProfile() {
  const { username } = useParams();
  const myUserId = localStorage.getItem("userId");

  const [friendUser, setFriendUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);

  const [ratedMovies] = useState([
    {
      id: 1,
      title: "Interstellar",
      poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
    {
      id: 2,
      title: "Dune",
      poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    },
  ]);

  // Fetch real user info (from friends list or users table)
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.post("/api/getUserByUsername", { username });
        setFriendUser(res.data.user);

        // check if already friends
        if (res.data.isFriend) {
          setIsFriend(true);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    fetchUser();
  }, [username]);

  const handleAddFriend = async () => {
    try {
      await axios.post("/api/addFriend", {
        userId: myUserId,
        friendsId: friendUser._id,
      });
      setIsFriend(true);
      alert("Friend added!");
    } catch (e) {
      console.error("Error adding friend:", e);
      alert("Error adding friend.");
    }
  };

  if (!friendUser)
    return <p className="profile-loading">Loading profile...</p>;

  return (
    <div className="profile-page">
      <div className="profile-header-instagram">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {friendUser.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-user-info">
          <h2 className="profile-username">{friendUser.username}</h2>

          <div className="profile-action-buttons">
            <button
              className="profile-addfriend-btn"
              onClick={handleAddFriend}
              disabled={isFriend}
            >
              {isFriend ? "Friends ✓" : "Add Friend"}
            </button>
          </div>

          <p className="profile-bio-box">
            {friendUser.bio || "This user loves movies!"}
          </p>
        </div>
      </div>

      {/* RATED MOVIES */}
      <h3 className="profile-section-title">Their Ratings</h3>

      <div className="profile-movie-grid">
        {ratedMovies.map((movie) => (
          <div key={movie.id} className="profile-movie-grid-item">
            <img src={movie.poster} alt={movie.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserProfile;
