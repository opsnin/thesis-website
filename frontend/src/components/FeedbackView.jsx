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
  const role = localStorage.getItem('role'); // Retrieve role to control feedback submission access

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
      const response = await fetch(`${backendUrl}/thesis/${thesisId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch assignment details');
      }
      const data = await response.json();
      setAssignmentDetails(data);
    } catch (err) {
      setError('Failed to fetch assignment details');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/${thesisId}/feedbacks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
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
      const response = await fetch(`${backendUrl}/thesis/${thesisId}/feedbacks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newFeedback }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSuccess('Feedback submitted successfully');
      setNewFeedback('');
      fetchFeedbacks();
    } catch (err) {
      setError('Failed to submit feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => window.history.back()} className="mr-4 text-lg">&#8592; Home</button>
        <h1 className="text-lg font-semibold">Thesis Feedback</h1>
      </header>

      {assignmentDetails && (
        <div className="max-w-2xl mx-auto mt-8 bg-gray-200 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-blue-800 mb-2">{assignmentDetails.title}</h2>
          <p className="text-gray-700 mb-1">Assigned to: <strong>{assignmentDetails.studentName || 'Not assigned'}</strong></p>
          <p className="text-gray-700 mb-1">
            Last Update: <strong>{assignmentDetails.lastUpdate ? new Date(assignmentDetails.lastUpdate).toLocaleDateString() : 'No updates yet'}</strong>
          </p>
          <p className="text-gray-700 mb-1">
            Status: <strong>{assignmentDetails.submitted ? 'Submitted' : 'Not Submitted'}</strong>
          </p>
          {assignmentDetails.fileName && (
            <p className="text-gray-700">
              File: <a href={`${backendUrl}/thesis/files/${assignmentDetails.fileName}`} download className="text-blue-500 underline">
                {assignmentDetails.fileName}
              </a>
            </p>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto mt-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback, index) => (
              <div key={feedback.id || index} className="flex items-start mb-4">
                <div className="w-12 h-12 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xs text-gray-700">{feedback.author?.username || 'Teacher'}</span>
                </div>
                <div className={`p-4 rounded-lg shadow-md max-w-lg ${index % 2 === 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}>
                  <p>{feedback.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No feedback available</p>
          )}
        </div>

        {role === 'TEACHER' && (
          <form onSubmit={handleFeedbackSubmit} className="flex mt-4">
            <input
              type="text"
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="Write a feedback"
              className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-500 flex items-center">
              <FaPaperPlane className="mr-1" /> Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackView;
