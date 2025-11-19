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
  
      const fakeFriends = [
  {
    friendsId: "101",
    username: "astro_bot",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=astro",
    movies: [
      {
        id: 1,
        title: "Inception",
        poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
        rating: 5,
      },
      {
        id: 2,
        title: "The Matrix",
        poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        rating: 5,
      },
      {
        id: 3,
        title: "The Prestige",
        poster: "https://image.tmdb.org/t/p/w500/qwJAnVQZGJKuQGb22AaJYv0TJwC.jpg",
        rating: 5,
      },
      {
        id: 4,
        title: "Ford v Ferrari",
        poster: "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
        rating: 4,
      },
      {
        id: 5,
        title: "John Wick",
        poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
        rating: 5,
      },
      {
        id: 6,
        title: "Edge of Tomorrow",
        poster: "https://image.tmdb.org/t/p/w500/uQrSH5ueHft2vIzaw5nUmf4dZYE.jpg",
        rating: 5,
      },
    ],
  },

  {
    friendsId: "102",
    username: "pixel_cat",
    avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat",
    movies: [
      {
        id: 7,
        title: "Spider-Man: No Way Home",
        poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        rating: 4,
      },
      {
        id: 8,
        title: "La La Land",
        poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        rating: 5,
      },
      {
        id: 9,
        title: "Whiplash",
        poster: "https://image.tmdb.org/t/p/w500/oPxnRhyAIzJKGUEdSiwTJQBa3NM.jpg",
        rating: 5,
      },
      {
        id: 10,
        title: "The Social Network",
        poster: "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
        rating: 5,
      },
      {
        id: 11,
        title: "Ratatouille",
        poster: "https://image.tmdb.org/t/p/w500/t3vaWRPSf6WjDSamIkKDs1iQWna.jpg",
        rating: 5,
      },
      {
        id: 12,
        title: "The Mitchells vs the Machines",
        poster: "https://image.tmdb.org/t/p/w500/mI9j8qUe5G5tgTQRX7g7L59Y35k.jpg",
        rating: 4,
      },
    ],
  },

  {
    friendsId: "103",
    username: "cyber_owl",
    avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=owl",
    movies: [
      {
        id: 13,
        title: "The Dark Knight",
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        rating: 5,
      },
      {
        id: 14,
        title: "Joker",
        poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
        rating: 5,
      },
      {
        id: 15,
        title: "The Batman",
        poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        rating: 4,
      },
      {
        id: 16,
        title: "Gone Girl",
        poster: "https://image.tmdb.org/t/p/w500/qymaJhucquUwjpb8oiqynMeXnID.jpg",
        rating: 5,
      },
      {
        id: 17,
        title: "Seven",
        poster: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg",
        rating: 5,
      },
      {
        id: 18,
        title: "The Martian",
        poster: "https://image.tmdb.org/t/p/w500/5JYJxj2lLjGHD153Ua7okeYIhbn.jpg",
        rating: 4,
      },
    ],
  },

  {
    friendsId: "104",
    username: "nebula_fox",
    avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fox",
    movies: [
      {
        id: 19,
        title: "Frozen",
        poster: "https://image.tmdb.org/t/p/w500/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg",
        rating: 3,
      },
      {
        id: 20,
        title: "Finding Nemo",
        poster: "https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
        rating: 5,
      },
      {
        id: 21,
        title: "Coco",
        poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
        rating: 5,
      },
      {
        id: 22,
        title: "Soul",
        poster: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg",
        rating: 4,
      },
      {
        id: 23,
        title: "Big Hero 6",
        poster: "https://image.tmdb.org/t/p/w500/9gLU47Zw5ertuFTZaxXOvNfy78T.jpg",
        rating: 5,
      },
      {
        id: 24,
        title: "Luca",
        poster: "https://image.tmdb.org/t/p/w500/jTswp6KyDYKtvC52GbHagrZbGvD.jpg",
        rating: 4,
      },
    ],
  },

  {
    friendsId: "105",
    username: "tech_dragon",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=dragon",
    movies: [
      {
        id: 25,
        title: "Avatar",
        poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
        rating: 4,
      },
      {
        id: 26,
        title: "Titanic",
        poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
        rating: 5,
      },
      {
        id: 27,
        title: "Gladiator",
        poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
        rating: 5,
      },
      {
        id: 28,
        title: "Mad Max: Fury Road",
        poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
        rating: 5,
      },
      {
        id: 29,
        title: "Top Gun: Maverick",
        poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        rating: 4,
      },
      {
        id: 30,
        title: "1917",
        poster: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
        rating: 5,
      },
    ],
  },

  {
    friendsId: "106",
    username: "glitch_penguin",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=penguin",
    movies: [
      {
        id: 31,
        title: "Barbie",
        poster: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        rating: 4,
      },
      {
        id: 32,
        title: "Coco",
        poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
        rating: 5,
      },
      {
        id: 33,
        title: "The Super Mario Bros. Movie",
        poster: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
        rating: 4,
      },
      {
        id: 34,
        title: "Megamind",
        poster: "https://image.tmdb.org/t/p/w500/1zd7zuCyhXnlI8Bm8RkBQmkW2Ak.jpg",
        rating: 5,
      },
      {
        id: 35,
        title: "Kung Fu Panda 2",
        poster: "https://image.tmdb.org/t/p/w500/mtU6D9tP8cCSuKL7mg0FUKfZo8h.jpg",
        rating: 4,
      },
      {
        id: 36,
        title: "Finding Dory",
        poster: "https://image.tmdb.org/t/p/w500/3U0ibE5fE5C9b0cW73ec1jt2FHe.jpg",
        rating: 4,
      },
    ],
  },
];




      setFriends(fakeFriends);
    } catch (error) {
      console.error("Error loading fake friends:", error);
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
