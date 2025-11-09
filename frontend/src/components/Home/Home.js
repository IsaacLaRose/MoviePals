import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';



function Home() {

  return (

    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="brand">MOVIEPALS</h1>
        </div>
        <div className="nav-right">
          <Link to="/login" className="nav-link">LOGIN</Link>
          <Link to="/register" className="nav-link-cta">SIGN UP</Link>
        </div>
      </nav>



      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Rate. Track. Share.</h1>
          <p className="hero-description">
            Your personal movie rating platform. Build your collection, 
            share your reviews, and discover what your friends are watching.
          </p>
          <Link to="/register" className="hero-cta">
            START RATING NOW
          </Link>
        </div>
      </div>



      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <h3 className="feature-title">Rate Movies</h3>
          <p className="feature-text">Give your honest ratings and build your personal movie library</p>
        </div>



        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Track Your Watchlist</h3>
          <p className="feature-text">Never forget what you've seen or want to watch next</p>
        </div>



        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3 className="feature-title">Social Feed</h3>
          <p className="feature-text">See what movies your friends are loving right now</p>
        </div>
      </div>



      {/* Call to Action Section */}
      <div className="cta-section">
        <h2 className="cta-heading">Ready to start your movie journey?</h2>
        <Link to="/register" className="cta-button-large">
          CREATE FREE ACCOUNT
        </Link>
      </div>
    </div>
  );
}



export default Home;