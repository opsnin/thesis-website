import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    rePassword: '',
    role: '', // No default role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.rePassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.role) {
      setError("Please select a role (Student or Teacher)");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role, // Send role to backend
        }),
      });

      if (!response.ok) {
        throw new Error('Signup failed. Please try again.');
      }

      const data = await response.json();
      setSuccess("Signup successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/assets/background.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 w-96 p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-semibold text-blue-600 mb-6">Signup</h1>

        {/* Role selection buttons */}
        <div className="flex justify-center mb-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-l-lg ${formData.role === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handleRoleChange('student')}
          >
            Sign up as Student
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r-lg ${formData.role === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handleRoleChange('teacher')}
          >
            Sign up as Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mb-4 p-2 border border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mb-4 p-2 border border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mb-4 p-2 border border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mb-4 p-2 border border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="rePassword"
            placeholder="Re-Password"
            value={formData.rePassword}
            onChange={handleChange}
            required
            className="mb-6 p-2 border border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <button
            type="submit"
            className="py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            Signup
          </button>
        </form>

        <p className="mt-4 text-gray-600 text-sm">
          Already signed up? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
