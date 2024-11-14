import React, { useState, useEffect } from 'react';
import { FaBell, FaFileAlt, FaUpload, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const StudentDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theses, setTheses] = useState([]);
  const username = localStorage.getItem('username') || 'Student';
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentTheses();
  }, []);

  const fetchStudentTheses = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/student`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const thesesData = await response.json();
        setTheses(thesesData || []);
      } else {
        console.error('Failed to fetch theses data');
      }
    } catch (error) {
      console.error('Error fetching theses:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${backendUrl}/logout`, { method: 'POST', credentials: 'include' });
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleFeedbackClick = () => {
    if (theses.length > 0) {
      navigate('/student-feedbacks', { state: { theses } });
    } else {
      alert("No thesis assigned yet");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/assets/uni-logo.webp" alt="Logo" className="h-8 mr-2" />
          <h2 className="text-lg font-semibold">King's Own Institute</h2>
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

      <div className="h-56 bg-cover bg-center" style={{ backgroundImage: "url('/assets/library.jpg')" }}></div>

      <div className="p-8 flex justify-center space-x-6">
        <ActionCard
          icon={<FaBell className="text-red-500 text-4xl" />}
          title="Feedback"
          onClick={handleFeedbackClick}
        />
        <ActionCard
          icon={<FaFileAlt className="text-blue-500 text-4xl" />}
          title="Title Request"
          onClick={() => navigate('/student-dashboard/title-request')}
        />
        <ActionCard
          icon={<FaUpload className="text-yellow-500 text-4xl" />}
          title="Upload Thesis"
          onClick={() => navigate('/upload-thesis')}
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

export default StudentDashboard;
