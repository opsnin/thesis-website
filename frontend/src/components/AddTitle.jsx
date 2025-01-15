import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const AddTitle = () => {
  const [title, setTitle] = useState('');
  const [requestDueDate, setRequestDueDate] = useState(null);
  const [thesisDueDate, setThesisDueDate] = useState(null);
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { week: '', description: '' }]);
  };

  const handleSubtaskChange = (index, field, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index][field] = value;
    setSubtasks(updatedSubtasks);
  };

  const handleRemoveSubtask = (index) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          requestDueDate,
          thesisDueDate,
          description,
          subtasks,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Only teachers can add titles.');
        }
        throw new Error('Failed to add thesis title');
      }

      setSuccess('Thesis title added successfully!');
      setTimeout(() => navigate('/teacher-dashboard'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => navigate('/teacher-dashboard')} className="mr-4 text-lg">&#8592; Home</button>
        <h1 className="text-lg font-semibold">Add Title</h1>
      </header>
      
      <div className="max-w-xl mx-auto mt-8 p-8 bg-gray-200 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Add Thesis Title</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Thesis Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 rounded-md border focus:outline-none focus:ring focus:ring-blue-500"
          />

          <div className="relative">
            <label className="block mb-2 text-gray-700 font-semibold">Due Date to Request for Title</label>
            <DatePicker
              selected={requestDueDate}
              onChange={(date) => setRequestDueDate(date)}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select request due date"
              className="w-full p-3 rounded-md border focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block mb-2 text-gray-700 font-semibold">Due Date for This Thesis</label>
            <DatePicker
              selected={thesisDueDate}
              onChange={(date) => setThesisDueDate(date)}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select thesis due date"
              className="w-full p-3 rounded-md border focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <textarea
            placeholder="Thesis Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 rounded-md border focus:outline-none focus:ring focus:ring-blue-500"
          ></textarea>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Subtasks</h3>
            {subtasks.map((subtask, index) => (
              <div key={index} className="space-y-2 border p-4 rounded-md bg-white">
                <input
                  type="text"
                  placeholder="Week"
                  value={subtask.week}
                  onChange={(e) => handleSubtaskChange(index, 'week', e.target.value)}
                  required
                  className="w-full p-2 border rounded-md"
                />
                <textarea
                  placeholder="Subtask Description"
                  value={subtask.description}
                  onChange={(e) => handleSubtaskChange(index, 'description', e.target.value)}
                  required
                  className="w-full p-2 border rounded-md"
                ></textarea>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove Subtask
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSubtask}
              className="p-2 bg-green-600 text-white rounded-md hover:bg-green-500"
            >
              Add Subtask
            </button>
          </div>

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          
          <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
            Add Title
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTitle;
