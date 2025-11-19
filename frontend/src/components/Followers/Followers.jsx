import React, { useState } from "react";
import { Link } from "react-router-dom";  
import "./Followers.css";

function Followers() {
  const [followers] = useState([
    {
      id: 1,
      name: "Sameer",
      avatar: "https://i.pravatar.cc/150?img=45"
    },
    {
      id: 2,
      name: "Zara",
      avatar: "https://i.pravatar.cc/150?img=14"
    },
    {
      id: 3,
      name: "Ayaan",
      avatar: "https://i.pravatar.cc/150?img=39"
    }
  ]);

  return (
    <div className="followers-page">
      <h1 className="followers-title">Followers</h1>

      <div className="followers-list">
        {followers.map((person) => (
          <Link
            key={person.id}
            to={`/user/${person.name}`}     
            className="follower-card-link"
          >
            <div className="follower-card">
              <img
                src={person.avatar}
                alt={person.name}
                className="follower-avatar"
              />
              <h3 className="follower-name">{person.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Followers;
