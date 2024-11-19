import React, { useState, useEffect } from 'react';
import { FaBell, FaFileAlt, FaPlusSquare, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const TeacherDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newRequestNotification, setNewRequestNotification] = useState(false);
  const username = localStorage.getItem('username') || 'Teacher';
  const navigate = useNavigate();

  useEffect(() => {
    // Function to check for new thesis requests
    const checkNewRequests = async () => {
      try {
        const response = await fetch(`${backendUrl}/thesis/thesis/requests-for-approval`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        
        // Show notification if there are pending approvals
        if (data.length > 0) {
          setNewRequestNotification(true);
        }
      } catch (error) {
        console.error('Error fetching new requests:', error);
      }
    };

    // Polling for new requests every 30 seconds
    const interval = setInterval(checkNewRequests, 30000);
    checkNewRequests();

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${backendUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
      localStorage.removeItem('token');
      localStorage.removeItem('username');
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

      <div
        className="h-56 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/library.jpg')",
        }}
      ></div>

      {/* Main Content */}
      <div className="p-8 flex flex-col items-center space-y-4">
        {/* Action Cards and Notification */}
        <div className="flex flex-col items-center space-y-4">
          {/* Notification above "Title Request" */}
          {newRequestNotification && (
            <div className="w-full max-w-lg bg-red-600 text-white px-4 py-2 rounded-md shadow-lg text-center mb-4">
              <p>New thesis approval requests pending!</p>
              <button
                onClick={() => {
                  setNewRequestNotification(false);
                  navigate('/teacher-dashboard/thesis-approval');
                }}
                className="mt-2 underline"
              >
                View Requests
              </button>
            </div>
          )}
          
          <div className="flex justify-center space-x-6">
            <ActionCard
              icon={<FaBell className="text-red-500 text-4xl" />}
              title="Title Request"
              onClick={() => navigate('/teacher-dashboard/thesis-approval')}
            />
            <ActionCard
              icon={<FaFileAlt className="text-blue-500 text-4xl" />}
              title="Thesis"
              onClick={() => navigate('/teacher-dashboard/teacher-thesis-view')}
            />
            <ActionCard
              icon={<FaPlusSquare className="text-yellow-500 text-4xl" />}
              title="Add Title"
              onClick={() => navigate('/teacher-dashboard/add-title')}
            />
          </div>
        </div>
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
