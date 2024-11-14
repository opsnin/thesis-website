import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const TeacherThesisView = () => {
  const [theses, setTheses] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all thesis titles on component mount
  useEffect(() => {
    fetchTheses();
  }, []);

  const fetchTheses = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/view`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch theses');
      }

      const data = await response.json();
      setTheses(data);
    } catch (err) {
      setError('Failed to fetch theses');
    }
  };

  // Handle thesis click to navigate to the feedback view
  const handleThesisClick = (thesisId) => {
    navigate(`/feedback-view/${thesisId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => window.history.back()} className="mr-4 text-lg">&#8592; Home</button>
        <h1 className="text-lg font-semibold">Thesis</h1>
      </header>
      
      <div className="max-w-2xl mx-auto mt-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {theses.length === 0 ? (
          <p className="text-gray-700 text-center mt-8">
            No thesis titles available.
          </p>
        ) : (
          theses.map((thesis) => (
            <div
              key={thesis.id}
              className="bg-gray-200 p-4 rounded-lg mb-4 shadow-md cursor-pointer"
              onClick={() => handleThesisClick(thesis.id)}
            >
              <h2 className="text-lg font-semibold text-blue-800">{thesis.title}</h2>
              <p className="text-gray-700">{thesis.description}</p>
              <p className="text-sm text-gray-600">Due date: {thesis.date}</p>
              <p className="text-sm text-gray-600 mt-2">
                Assigned to: {thesis.requestedBy ? thesis.student?.username : 'Not assigned till now'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Last Update: {thesis.lastUpdate ? new Date(thesis.lastUpdate).toLocaleDateString() : 'No updates yet'}
              </p>
              {thesis.fileName && (
                <p className="text-sm text-gray-600 mt-2">
                  File: {thesis.fileName}
                  <a
                    href={`${backendUrl}/student-thesis/${thesis.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 ml-2"
                  >
                    Download
                  </a>
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherThesisView;