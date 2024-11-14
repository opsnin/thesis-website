import React, { useEffect, useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const TitleRequest = () => {
  const [theses, setTheses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all unassigned thesis titles on component mount
  useEffect(() => {
    fetchTheses();
  }, []);

  const fetchTheses = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/unassigned`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch theses');
      }

      const data = await response.json();

      // Filter only theses that have not been requested yet
      const unassignedTheses = data.filter(thesis => thesis.requestedBy === null);

      console.log('Fetched unassigned theses:', unassignedTheses); // Debugging line
      setTheses(unassignedTheses);
    } catch (err) {
      setError(err.message || 'Failed to fetch theses');
    }
  };

  const handleRequest = async (thesisId) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${backendUrl}/thesis/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ thesisId }),
      });

      if (!response.ok) {
        throw new Error('Failed to request thesis');
      }

      const data = await response.json();
      setSuccess('Thesis requested successfully!');
      fetchTheses(); // Refresh the theses list to update the status
    } catch (err) {
      setError(err.message || 'Failed to request thesis');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => window.history.back()} className="mr-4 text-lg">&#8592; Home</button>
        <h1 className="text-lg font-semibold">Title Request</h1>
      </header>
      
      <div className="max-w-2xl mx-auto mt-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        {theses.length === 0 ? (
          <p className="text-gray-700 text-center mt-8">
            No titles found that are free or unassigned. Please contact your teacher for further assistance.
          </p>
        ) : (
          theses.map((thesis) => (
            <div key={thesis.id} className="bg-gray-200 p-4 rounded-lg mb-4 shadow-md">
              <h2 className="text-lg font-semibold text-blue-800">{thesis.title}</h2>
              <p className="text-gray-700">{thesis.description}</p>
              <p className="text-sm text-gray-600">Due date: {thesis.date}</p>
              <button
                onClick={() => handleRequest(thesis.id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Request
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TitleRequest;