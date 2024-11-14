import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const TeacherThesisView = () => {
  const [theses, setTheses] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleThesisClick = (thesisId) => {
    navigate(`/feedback-view/${thesisId}`);
  };

  const handleDeleteThesis = async (thesisId) => {
    try {
      const response = await fetch(`${backendUrl}/thesis/${thesisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete thesis');
      }

      setTheses((prevTheses) => prevTheses.filter((thesis) => thesis.id !== thesisId));
    } catch (err) {
      setError('Failed to delete thesis');
    }
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
              className="bg-gray-200 p-4 rounded-lg mb-4 shadow-md"
            >
              <div className="flex justify-between items-center">
                <div className="cursor-pointer" onClick={() => handleThesisClick(thesis.id)}>
                  <h2 className="text-lg font-semibold text-blue-800">{thesis.title}</h2>
                  <p className="text-gray-700">{thesis.description}</p>
                  <p className="text-sm text-gray-600">Due date: {thesis.date}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {thesis.approved
                      ? `Assigned to: ${thesis.student?.username || 'Not assigned to any user'}`
                      : 'Not assigned to any Student'}
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
                <button
                  onClick={() => handleDeleteThesis(thesis.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherThesisView;
