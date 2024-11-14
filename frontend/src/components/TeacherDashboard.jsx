import React, { useState } from 'react';
import { FaBell, FaFileAlt, FaPlusSquare, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const username = localStorage.getItem('username') || 'Teacher'; // Retrieve username from localStorage
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5174/logout', { method: 'POST', credentials: 'include' });

      // Clear local storage or any stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/assets/uni-logo.webp" alt="Logo" className="h-8 mr-2" />
          <h1 className="text-lg font-semibold">King's Own Institute</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-blue-700 p-2 rounded-full hover:bg-blue-600"
          >
            <FaUserCircle className="text-white text-2xl" />
            <span>{username}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Banner Image */}
      <div
        className="h-56 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/library.jpg')",
        }}
      ></div>

      {/* Action Cards */}
      <div className="p-8 flex justify-center space-x-6">
        <ActionCard
          icon={<FaBell className="text-red-500 text-4xl" />}
          title="Title Request"
          onClick={() => navigate('/teacher-dashboard/thesis-approval')}
        />
        <ActionCard
          icon={<FaFileAlt className="text-blue-500 text-4xl" />}
          title="Thesis"
          onClick={() => navigate('/teacher-dashboard/teacher-thesis-view')} // Updated path
        />
        <ActionCard
          icon={<FaPlusSquare className="text-yellow-500 text-4xl" />}
          title="Add Title"
          onClick={() => navigate('/teacher-dashboard/add-title')}
        />
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-40 bg-white p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-gray-800 font-semibold">{title}</h3>
    </div>
  );
};

export default TeacherDashboard;
