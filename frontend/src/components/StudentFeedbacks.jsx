import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentFeedbacks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theses = location.state?.theses || [];
  const [selectedThesis, setSelectedThesis] = useState(null);

  return (
    <div
      className="min-h-screen flex flex-col items-center p-8 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/assets/background.jpg')",
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <header className="bg-blue-700 text-white p-6 flex items-center rounded-t-lg">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="text-white hover:underline mr-4"
          >
            &larr; Back to Home
          </button>
          <h1 className="text-xl font-semibold">Assigned Theses</h1>
        </header>

        <div className="p-6">
          {selectedThesis ? (
            <>
              <button
                onClick={() => setSelectedThesis(null)}
                className="text-blue-600 hover:underline mb-4"
              >
                &larr; Back to Theses
              </button>
              <h2 className="text-xl font-semibold text-blue-700 mb-4">
                {selectedThesis.title}
              </h2>
              <div className="space-y-4">
                {selectedThesis.feedbacks.length > 0 ? (
                  selectedThesis.feedbacks.map((feedback, index) => (
                    <div
                      key={feedback.id}
                      className={`flex items-start ${
                        feedback.author.username === selectedThesis.feedbacks[0].author.username
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-md p-4 rounded-lg shadow ${
                          feedback.author.username === selectedThesis.feedbacks[0].author.username
                            ? 'bg-blue-100 text-gray-800 rounded-tl-none'
                            : 'bg-green-100 text-gray-800 rounded-tr-none'
                        }`}
                      >
                        <p className="font-medium">{feedback.author.username}</p>
                        <p className="mt-1">{feedback.content}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No feedback available for this thesis.</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {theses.map((thesis) => (
                <div
                  key={thesis.id}
                  onClick={() => setSelectedThesis(thesis)}
                  className="p-4 bg-gray-100 rounded-lg shadow-md hover:bg-blue-100 transition cursor-pointer"
                >
                  <h2 className="text-lg font-semibold text-blue-700">{thesis.title}</h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbacks;
