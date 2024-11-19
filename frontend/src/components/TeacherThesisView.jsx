import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

// Header Component
const Header = ({ onBack, title }) => (
  <header className="bg-blue-800 text-white p-4 flex items-center justify-between rounded-lg shadow-lg">
    <button onClick={onBack} className="text-lg text-white hover:text-gray-200 transition-colors">
      &#8592; Home
    </button>
    <h1 className="text-lg font-semibold">{title}</h1>
  </header>
);

// ThesisCard Component
const ThesisCard = ({ thesis, onClick, onDelete }) => (
  <div className="bg-gray-100 p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex justify-between items-start">
      <div className="cursor-pointer flex-1" onClick={() => onClick(thesis.id)}>
        <h2 className="text-xl font-bold text-blue-700 mb-2">{thesis.title}</h2>
        <p className="text-gray-600 mb-2">{thesis.description}</p>
        <p className="text-sm text-gray-500 mb-1">Due date: {thesis.date}</p>
        <p className="text-sm text-gray-500 mb-1">
          {thesis.approved
            ? `Assigned to: ${thesis.student?.username || 'Not assigned to any user'}`
            : 'Not assigned to any Student'}
        </p>
        <p className="text-sm text-gray-500 mb-1">
          Last Update: {thesis.lastUpdate ? new Date(thesis.lastUpdate).toLocaleDateString() : 'No updates yet'}
        </p>
        {thesis.fileName && (
          <p className="text-sm text-gray-500 mt-2">
            File:
            <a
              href={`${backendUrl}/thesis/student-thesis/${thesis.fileName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 ml-2 underline hover:text-blue-600"
            >
              Download
            </a>
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(thesis.id)}
        className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
        title="Delete"
      >
        <FaTrash className="text-lg" />
      </button>
    </div>
  </div>
);

// ThesisList Component
const ThesisList = ({ theses, onThesisClick, onDelete }) => (
  <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded-lg shadow-lg">
    {theses.length === 0 ? (
      <p className="text-gray-700 text-center mt-8 text-lg">No thesis titles available.</p>
    ) : (
      theses.map((thesis) => (
        <ThesisCard key={thesis.id} thesis={thesis} onClick={onThesisClick} onDelete={onDelete} />
      ))
    )}
  </div>
);

const TeacherThesisView = () => {
  const [theses, setTheses] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTheses();
  }, []);

  const fetchTheses = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/view`, {
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
      const response = await fetch(`${backendUrl}/thesis/thesis/${thesisId}`, {
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-gray-100 p-8">
      <Header title="Thesis Management" onBack={() => navigate(-1)} />
      
      {error && (
        <p className="text-red-500 text-center mt-4 font-semibold">
          {error}
        </p>
      )}
      
      <ThesisList theses={theses} onThesisClick={handleThesisClick} onDelete={handleDeleteThesis} />
    </div>
  );
};

export default TeacherThesisView;
