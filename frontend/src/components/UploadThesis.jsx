import React, { useState, useEffect } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const UploadThesis = () => {
  const [file, setFile] = useState(null);
  const [theses, setTheses] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignedTheses();
  }, []);

  const fetchAssignedTheses = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/student`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assigned theses');
      }

      const data = await response.json();
      setTheses(data); 
      if (data.length > 0) setSelectedThesisId(data[0].id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      !['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)
    ) {
      setError('Only .pdf and .docx files are allowed');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!selectedThesisId) {
      setError('Please select a thesis');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('thesisId', selectedThesisId); 

    try {
      const response = await fetch(`${backendUrl}/upload-thesis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload thesis');
      }

      setSuccess('Thesis uploaded successfully!');
      setFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => window.history.back()} className="mr-4 text-lg">&#8592; Home</button>
        <h1 className="text-lg font-semibold">Upload Thesis</h1>
      </header>

      <div className="max-w-lg mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleUpload} className="space-y-4">
          <label className="block text-gray-700 font-semibold">Select Thesis</label>
          <select
            value={selectedThesisId}
            onChange={(e) => setSelectedThesisId(e.target.value)}
            className="w-full p-3 rounded-md border focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select a thesis</option>
            {theses.map((thesis) => (
              <option key={thesis.id} value={thesis.id}>
                {thesis.title}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="w-full p-3 rounded-md border focus:outline-none focus:ring focus:ring-blue-500"
          />

          <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-500">
            Upload Thesis
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadThesis;
