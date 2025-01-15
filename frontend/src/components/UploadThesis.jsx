import React, { useState, useEffect } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const UploadThesis = () => {
  const [file, setFile] = useState({});
  const [theses, setTheses] = useState([]);
  const [selectedThesisId, setSelectedThesisId] = useState('');
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignedTheses();
  }, []);

  useEffect(() => {
    const thesis = theses.find((t) => t.id === parseInt(selectedThesisId));
    setSelectedThesis(thesis || null);
  }, [selectedThesisId, theses]);

  const fetchAssignedTheses = async () => {
    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/student`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assigned theses');
      }

      const data = await response.json();
      setTheses(data);

      if (data.length > 0) {
        setSelectedThesisId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (subtaskId, file) => {
    setFile((prev) => ({ ...prev, [subtaskId]: file }));
  };

  const handleUpload = async (subtaskId) => {
    const selectedFile = file[subtaskId];
    if (!selectedFile) {
      setError(`Please select a file for ${subtaskId === 'main' ? 'the main thesis' : `subtask ${subtaskId}`}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('thesisId', selectedThesisId);
    if (subtaskId !== 'main') {
      formData.append('subtaskId', subtaskId);
    }

    try {
      const endpoint = subtaskId === 'main' ? '/thesis/upload-thesis' : `/thesis/subtask/${subtaskId}/upload`;
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file for ${subtaskId === 'main' ? 'main thesis' : `subtask ${subtaskId}`}`);
      }

      setSuccess(`File uploaded successfully for ${subtaskId === 'main' ? 'main thesis' : `subtask ${subtaskId}`}`);
      setFile((prev) => ({ ...prev, [subtaskId]: null }));
      fetchAssignedTheses(); // Refresh the list to show updated files
    } catch (err) {
      setError(err.message);
    }
  };

  const isAllSubtasksSubmitted = () => {
    if (!selectedThesis?.subtasks) return true;
    return selectedThesis.subtasks.every((subtask) => subtask.submitted);
  };

  const isDueDatePassed = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => window.history.back()} className="mr-4 text-lg">
          &#8592; Home
        </button>
        <h1 className="text-lg font-semibold">Upload Thesis</h1>
      </header>

      <div className="max-w-lg mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form className="space-y-4">
          <label className="block text-gray-700 font-semibold">Select Thesis</label>
          <select
            value={selectedThesisId}
            onChange={(e) => setSelectedThesisId(e.target.value)}
            className="w-full p-3 rounded-md border focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a thesis
            </option>
            {theses.map((thesis) => (
              <option key={thesis.id} value={thesis.id}>
                {thesis.title}
              </option>
            ))}
          </select>

          {selectedThesis && (
            <div className="p-4 mt-4 bg-gray-100 border rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Due Date to Submit:</strong>{' '}
                {new Date(selectedThesis.thesisDueDate).toLocaleDateString()}
              </p>
              {isDueDatePassed(selectedThesis.thesisDueDate) && (
                <p className="text-red-500 mt-2">Due date passed</p>
              )}
            </div>
          )}

          {selectedThesis?.subtasks && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Subtasks</h3>
              <ul className="list-disc ml-4">
                {selectedThesis.subtasks.map((subtask) => (
                  <li key={subtask.id} className="mb-4 bg-gray-50 p-4 rounded shadow">
                    <p>
                      <strong>Week:</strong> {subtask.week}
                    </p>
                    <p>
                      <strong>Description:</strong> {subtask.description}
                    </p>
                    {subtask.fileName ? (
                      <p className="mt-2 text-blue-500">
                        <strong>Submitted File:</strong>{' '}
                        <a
                          href={`${backendUrl}/thesis/subtask/${subtask.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {subtask.fileName}
                        </a>
                      </p>
                    ) : (
                      <p className="text-gray-500 mt-2">No file submitted</p>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => handleFileChange(subtask.id, e.target.files[0])}
                      className="mt-2 w-full p-3 border rounded-md"
                      disabled={isDueDatePassed(selectedThesis.thesisDueDate)}
                    />
                    <button
                      onClick={() => handleUpload(subtask.id)}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                      disabled={isDueDatePassed(selectedThesis.thesisDueDate)}
                    >
                      Upload for Subtask
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Main Thesis</h3>
            {selectedThesis?.fileName ? (
              <p className="mt-2 text-blue-500">
                <strong>Submitted File:</strong>{' '}
                <a
                  href={`${backendUrl}/thesis/${selectedThesis.fileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {selectedThesis.fileName}
                </a>
              </p>
            ) : (
              <p className="text-gray-500 mt-2">No file submitted</p>
            )}
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange('main', e.target.files[0])}
              className="w-full p-3 border rounded-md"
              disabled={isDueDatePassed(selectedThesis?.thesisDueDate)}
            />
            <button
              onClick={() => handleUpload('main')}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Upload Main Thesis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadThesis;
