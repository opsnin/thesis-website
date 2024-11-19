import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Only send email and password
      });
  
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
  
      const data = await response.json();
      const { token, username, role } = data;
  
      // Store token, username, and role in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role); // Store role from backend
      localStorage.setItem('userId', data.userId);
      // Redirect based on role
      if (role === 'STUDENT') {
        navigate('/student-dashboard');
      } else if (role === 'TEACHER') {
        navigate('/teacher-dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ 
        backgroundImage: "url('/assets/background.jpg')",
        backgroundColor: '#f0f0f0'
      }}
    >
      <div className="bg-white bg-opacity-90 w-80 p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-semibold text-blue-600 mb-6">Login</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="mb-4 p-2 border border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="mb-6 p-2 border border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            Login
          </button>
        </form>
        
        <p className="mt-4 text-gray-600 text-sm">
          Don’t have an account? <Link to="/signup" className="text-blue-600 hover:underline">Register now?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
