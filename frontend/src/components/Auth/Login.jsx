import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Auth.css';



function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);



    try {
      await authService.login({ email, password });
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🎬 Welcome Back!</h1>
        <p className="auth-subtitle">Login to continue rating movies</p>


        {error && <div className="alert alert-error">{error}</div>}


        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>



          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>



          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login 🍿'}
          </button>
        </form>



        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}


export default Login;
