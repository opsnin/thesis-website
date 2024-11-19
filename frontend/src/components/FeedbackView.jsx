import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const FeedbackView = () => {
  const { thesisId } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (thesisId) {
      fetchAssignmentDetails();
      fetchFeedbacks();
    } else {
      setError('Thesis ID is missing.');
    }
  }, [thesisId]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/${thesisId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch assignment details');
      const data = await response.json();
      setAssignmentDetails(data);
    } catch (err) {
      setError('Failed to fetch assignment details');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/${thesisId}/feedbacks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      setError('Failed to fetch feedback');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!newFeedback) {
      setError('Please write some feedback');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/${thesisId}/feedbacks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newFeedback }),
      });
      if (!response.ok) throw new Error('Failed to submit feedback');

      setSuccess('Feedback submitted successfully');
      setNewFeedback('');
      fetchFeedbacks();
    } catch (err) {
      setError('Failed to submit feedback');
    }
  };

  // Function to generate bright colors based on the user ID or username
  const getColorForUser = (userId) => {
    const colors = [
      '#FFB6C1', // Light Pink
      '#FFA07A', // Light Salmon
      '#FFD700', // Gold
      '#98FB98', // Pale Green
      '#87CEFA', // Light Sky Blue
      '#FF69B4', // Hot Pink
      '#FF6347', // Tomato
      '#40E0D0', // Turquoise
      '#FFDAB9', // Peach Puff
      '#AFEEEE', // Pale Turquoise
    ];
    return colors[userId % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <header className="bg-blue-800 text-white p-4 rounded-lg shadow-md flex items-center justify-between">
        <button onClick={() => window.history.back()} className="text-lg hover:text-gray-200 transition-colors">
          &#8592; Home
        </button>
        <h1 className="text-lg font-semibold">Thesis Feedback</h1>
      </header>

      {assignmentDetails && (
        <div className="max-w-3xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">{assignmentDetails.title}</h2>
          <p className="text-gray-700 mb-1">Assigned to: <strong>{assignmentDetails.studentName || 'Not assigned'}</strong></p>
          <p className="text-gray-700 mb-1">
            Last Update: <strong>{assignmentDetails.lastUpdate ? new Date(assignmentDetails.lastUpdate).toLocaleDateString() : 'No updates yet'}</strong>
          </p>
          <p className="text-gray-700 mb-1">
            Status: <strong>{assignmentDetails.submitted ? 'Submitted' : 'Not Submitted'}</strong>
          </p>
          {assignmentDetails.fileName && (
            <p className="text-gray-700">
              File: <a href={`${backendUrl}/thesis/thesis/files/${assignmentDetails.fileName}`} download className="text-blue-500 underline">
                {assignmentDetails.fileName}
              </a>
            </p>
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-8 space-y-6">
        {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
        {success && <p className="text-green-500 text-center font-semibold">{success}</p>}

        <div className="bg-white p-6 rounded-lg shadow-md">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback, index) => (
              <div key={feedback.id || index} className="flex items-start mb-4 space-x-4">
                <div
                  className="flex items-center justify-center text-xs text-white font-semibold rounded-full p-3"
                  style={{
                    backgroundColor: getColorForUser(feedback.author?.userId || index),
                    width: `${feedback.author?.username.length * 8}px`,
                  }}
                >
                  {feedback.author?.username || 'Teacher'}
                </div>
                <div
                  className={`p-4 rounded-lg shadow-md max-w-lg`}
                  style={{
                    backgroundColor: getColorForUser(feedback.author?.userId || index),
                    color: '#3E4E5A',
                  }}
                >
                  <p>{feedback.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No feedback available</p>
          )}
        </div>

        {role === 'TEACHER' && assignmentDetails?.studentName && (
          <form onSubmit={handleFeedbackSubmit} className="flex mt-4 max-w-3xl mx-auto">
            <input
              type="text"
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="Write a feedback"
              className="flex-grow p-3 border rounded-l-md focus:outline-none focus:ring focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 rounded-r-md hover:bg-blue-500 flex items-center justify-center">
              <FaPaperPlane className="mr-2" /> Send
            </button>
          </form>
        )}
        {role === 'TEACHER' && !assignmentDetails?.studentName && (
          <p className="text-red-500 text-center mt-4">Feedback can only be submitted if the thesis is assigned to a student.</p>
        )}
      </div>
    </div>
  );
};

export default FeedbackView;
