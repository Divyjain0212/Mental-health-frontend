import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // 1. Import the useAuth hook
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Get the login function from your context

  // 3. Add TypeScript type for the form event
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, ...userData } = response.data;
      login(userData, token);
      
      // Role-based redirect
      if (userData.role === 'admin') navigate('/admin/dashboard');
      else if (userData.role === 'counsellor') navigate('/counsellor/dashboard');
      else navigate('/student-dashboard');

    } catch (err: any) { // 5. Add a type for the caught error
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-hero">
        <h1>Welcome to Mastishk Setu</h1>
        <p>Your confidential, culturally aware campus mental health companion.</p>
      </div>
      <div className="login-form-wrapper">
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Mastishk Setu <br/><h1>Campus Portal</h1></h2>
            <p>Sign in to access your resources and support tools.</p>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                // 6. Add TypeScript type for the input change event
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required 
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-button" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            <div className="login-footer">By continuing you agree to our privacy policy.</div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;