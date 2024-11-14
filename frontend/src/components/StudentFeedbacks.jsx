import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentFeedbacks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theses = location.state?.theses || [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Feedback for Assigned Theses</h1>
        <button
          onClick={() => navigate('/student-dashboard')}
          className="bg-white text-blue-800 px-4 py-2 rounded hover:bg-gray-200 transition"
        >
          Go to Homepage
        </button>
      </header>
      
      {theses.length > 0 ? (
        theses.map((thesis) => (
          <div key={thesis.id} className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-blue-800 mb-2">{thesis.title}</h2>
            <div className="mt-4">
              {thesis.feedbacks.length > 0 ? (
                thesis.feedbacks.map((feedback) => (
                  <div key={feedback.id} className="p-4 border-b border-gray-200">
                    <p><strong>{feedback.author.username}:</strong> {feedback.content}</p>
                    <p className="text-gray-500 text-sm">{new Date(feedback.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No feedback available for this thesis.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center mt-8 text-gray-500">No theses assigned yet.</p>
      )}
    </div>
  );
};

export default StudentFeedbacks;
