import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const ThesisApproval = () => {
  const [requests, setRequests] = useState([]);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all thesis requests that need approval
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${backendUrl}/thesis/thesis/requests-for-approval`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (thesisId, studentId) => {
    try {
      const response = await fetch(`${backendUrl}/thesis/thesis/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ thesisId, studentId }),
      });
      if (response.ok) {
        setRequests(requests.map(request => 
          request.id === thesisId ? { ...request, approved: true } : request
        ));
        setSuccess('Thesis approved successfully'); 
        setTimeout(() => setSuccess(''), 3000); // Clear message after 3 seconds
      } else {
        console.error('Approval failed');
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => navigate('/teacher-dashboard')} className="mr-4 text-lg">&#8592; Home</button>
        <h1 className="text-lg font-semibold">Thesis Approval</h1>
      </header>

      <div className="max-w-4xl mx-auto mt-8">
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

        {requests.length === 0 ? (
          <p className="text-gray-700 text-center mt-8">
            No pending approvals right now. Check again later.
          </p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-6 bg-gray-200 rounded-lg shadow-lg mb-4 flex justify-between">
              <div>
                <h2 className="text-lg font-bold text-blue-700">{request.title}</h2>
                <p>{request.description}</p>
                <p className="text-sm text-gray-500 mt-2">Requested by: {request.studentName}</p>
              </div>
              {!request.approved && (
                <button
                  onClick={() => handleApprove(request.id, request.requestedBy)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                >
                  Approve
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThesisApproval;
