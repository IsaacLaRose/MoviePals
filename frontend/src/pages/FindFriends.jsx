import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./FindFriends.css";

function FindFriends() {
  const userId = localStorage.getItem("userId");

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const res = await api.post("/api/viewFriendsList", { userId });
      setFriendsList(res.data.friendsList || []);
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  };

  const handleSearch = async () => {
    setError("");
    setSearchResults([]);

    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }

    try {
      const res = await api.post("/api/searchUsers", {
        userId,
        query: query.trim(),
      });

      setSearchResults(res.data.users || []);
      if (res.data.users.length === 0) {
        setError("No users found.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search error. Try again.");
    }
  };

  const addFriend = async (friendId) => {
    try {
      await api.post("/api/addFriend", {
        userId,
        friendsId: friendId,
      });

      loadFriends();
      setQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Add friend failed:", err);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await api.post("/api/removeFriend", {
        userId,
        friendsId: friendId,
      });

      loadFriends();
    } catch (err) {
      console.error("Remove friend failed:", err);
    }
  };

  return (
    <div className="findfriends-page">

      <h1 className="findfriends-title">Find Friends</h1>

      <div className="findfriends-search-box">
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {searchResults.length > 0 &&
        searchResults.map((user) => (
          <div key={user._id} className="user-card">
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <p>@{user.username}</p>

            <button
              className="add-friend-btn"
              onClick={() => addFriend(user._id)}
            >
              Add Friend
            </button>
          </div>
        ))}

      <h2 className="friends-title">Your Friends</h2>

      <div className="friends-list">
        {friendsList.length > 0 ? (
          friendsList.map((friend) => (
            <div key={friend.friendsId} className="friend-item">

              <Link
                to={`/user/${friend.username}`}
                className="friend-info-link"
              >
                <div className="friend-info">
                  <strong>
                    {friend.firstName} {friend.lastName}
                  </strong>
                  <span>@{friend.username}</span>
                </div>
              </Link>

              <button
                className="remove-friend-btn"
                onClick={() => removeFriend(friend.friendsId)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="no-friends">You have no friends yet.</p>
        )}
      </div>
    </div>
  );
}

export default FindFriends;
