import React, { useState, useEffect } from 'react';
import { FaBell, FaFileAlt, FaUpload, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const StudentDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theses, setTheses] = useState([]);
  const [notification, setNotification] = useState('');
  const [unreadFeedbacks, setUnreadFeedbacks] = useState({});
  const username = localStorage.getItem('username') || 'Student';
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentTheses();

    // Polling every 10 seconds for new feedback
    const interval = setInterval(() => {
      checkForNewFeedback();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchStudentTheses = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/student`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const thesesData = await response.json();
        setTheses(thesesData || []);
        initializeUnreadFeedbacks(thesesData);
      } else {
        console.error('Failed to fetch theses data');
      }
    } catch (error) {
      console.error('Error fetching theses:', error);
    }
  };

  const initializeUnreadFeedbacks = (theses) => {
    const unreadTracker = {};
    theses.forEach((thesis) => {
      unreadTracker[thesis.id] = thesis.feedbacks.length; 
    });
    setUnreadFeedbacks(unreadTracker);
  };

  const checkForNewFeedback = async () => {
    for (const thesis of theses) {
      try {
        const response = await fetch(`${backendUrl}/thesis/thesis/${thesis.id}/feedbacks`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const feedbacksData = await response.json();
          const currentFeedbackCount = feedbacksData.length;

          // Check if there is new feedback by comparing with previous count
          if (currentFeedbackCount > (unreadFeedbacks[thesis.id] || 0)) {
            const latestFeedback = feedbacksData[feedbacksData.length - 1];
            setNotification(`${latestFeedback.author.username} has given feedback for ${thesis.title}`);
            setUnreadFeedbacks((prev) => ({
              ...prev,
              [thesis.id]: currentFeedbackCount,
            }));
          }
        } else {
          console.error('Failed to fetch feedback for thesis', thesis.id);
        }
      } catch (error) {
        console.error('Error fetching feedback for thesis:', thesis.id, error);
      }
    }
  };

  const handleFeedbackClick = () => {
    if (theses.length > 0) {
      markAllFeedbacksAsRead();
      navigate('/student-feedbacks', { state: { theses } });
    } else {
      alert("No thesis assigned yet");
    }
  };

  const markAllFeedbacksAsRead = () => {
    const readTracker = { ...unreadFeedbacks };
    Object.keys(readTracker).forEach((thesisId) => {
      readTracker[thesisId] = 0; // Mark all feedbacks as read by setting count to 0
    });
    setUnreadFeedbacks(readTracker);
    setNotification(''); 
  };

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

      {/* Notification Alert */}
      {notification && (
        <div className="fixed top-16 right-4 bg-yellow-200 text-yellow-800 px-4 py-2 rounded-md shadow-lg">
          <p>{notification}</p>
          <button
            onClick={() => setNotification('')}
            className="text-yellow-600 underline text-sm mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

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
