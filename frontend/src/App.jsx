import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Signup from './components/SignUp';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AddTitle from './components/AddTitle';
import TitleRequest from './components/TitleRequest'; // Student's request view
import ThesisApproval from './components/ThesisApproval'; // Teacher's approval view
import TeacherThesisView from './components/TeacherThesisView';
import UploadThesis from './components/UploadThesis';
import FeedbackView from './components/FeedbackView';
import StudentFeedbacks from './components/StudentFeedbacks';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-dashboard/add-title" element={<AddTitle />} />
        <Route path="/student-dashboard/title-request" element={<TitleRequest />} />
        <Route path="/teacher-dashboard/thesis-approval" element={<ThesisApproval />} />
        <Route path="/teacher-dashboard/teacher-thesis-view" element={<TeacherThesisView />} />
        <Route path="/upload-thesis" element={<UploadThesis />} />
        <Route path="/feedback-view/:thesisId" element={<FeedbackView />} />
        <Route path="/student-feedbacks" element={<StudentFeedbacks />} />
      </Routes>
    </Router>
  );
}

export default App;
