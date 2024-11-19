const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/authenticate');
const { authorizeTeacher, authorizeStudent } = require('../middleware/authorization');
const upload = require('../config/multerConfig');
const path = require('path');
const fs = require('fs'); 

const router = express.Router();
const prisma = new PrismaClient();

// Upload thesis endpoint
router.post('/upload-thesis', authenticate, authorizeStudent, upload.single('file'), async (req, res) => {
const { userId } = req;
const { thesisId } = req.body;

if (!thesisId) {
    return res.status(400).json({ message: 'Thesis ID is required' });
}

try {
    // Define thesis directory path
    const thesisDir = path.join(__dirname, '../student-thesis'); // Update to go one level up from routes folder

    // Ensure the `student-thesis` directory exists
    if (!fs.existsSync(thesisDir)) {
    fs.mkdirSync(thesisDir, { recursive: true });
    }

    // Check if the thesis is assigned to the user
    const thesis = await prisma.thesis.findFirst({
    where: { id: parseInt(thesisId), requestedBy: userId },
    });

    if (!thesis) {
    return res.status(404).json({ message: 'Thesis not found or not assigned to the user' });
    }

    // Construct a consistent file name and path
    const fileName = `thesis_${userId}_${thesisId}${path.extname(req.file.originalname)}`;
    const targetPath = path.join(thesisDir, fileName);

    // Delete the existing file if it exists
    if (thesis.fileName && fs.existsSync(path.join(thesisDir, thesis.fileName))) {
    fs.unlinkSync(path.join(thesisDir, thesis.fileName));
    }

    // Move the uploaded file to the designated path
    fs.renameSync(req.file.path, targetPath);

    // Update the thesis record with new file details
    await prisma.thesis.update({
    where: { id: thesis.id },
    data: {
        submitted: true,
        lastUpdate: new Date(),
        fileName,
    },
    });

    res.status(200).json({ message: 'Thesis uploaded successfully', fileLink: `/thesis/files/${fileName}` });
} catch (error) {
    console.error('Database error while handling thesis upload:', error);
    res.status(500).json({ message: 'Failed to upload thesis' });
}
});

// Delete a thesis by ID
router.delete('/thesis/:thesisId', authenticate, authorizeTeacher, async (req, res) => {
  const { thesisId } = req.params;

  try {
    await prisma.thesis.delete({
      where: { id: parseInt(thesisId) },
    });
    res.status(200).json({ message: 'Thesis deleted successfully' });
  } catch (error) {
    console.error('Error deleting thesis:', error);
    res.status(500).json({ message: 'Failed to delete thesis' });
  }
});
  
// Route to submit feedback (POST /thesis/:thesisId/feedbacks)
router.post('/thesis/:thesisId/feedbacks', authenticate, authorizeTeacher, async (req, res) => {
  const { thesisId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Feedback content is required' });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        content,
        thesisId: parseInt(thesisId), 
        userId: req.userId,
      },
    });
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// Backend route to get all theses assigned to a student with feedback
router.get('/thesis/student', authenticate, async (req, res) => {
    try {
      const theses = await prisma.thesis.findMany({
        where: { requestedBy: req.userId },
        include: {
          feedbacks: {
            include: { author: { select: { username: true } } },
          },
        },
      });
      res.json(theses);
    } catch (error) {
      console.error('Error fetching student theses:', error);
      res.status(500).json({ message: 'Failed to fetch theses' });
    }
  });
  
// Backend route to fetch thesis details with assignment information
router.get('/thesis/:thesisId/details', authenticate, async (req, res) => {
    const { thesisId } = req.params;
  
    try {
      const thesis = await prisma.thesis.findUnique({
        where: { id: parseInt(thesisId) },
        include: {
          student: { select: { username: true, id: true } },
        },
      });
  
      if (!thesis) {
        return res.status(404).json({ message: 'Thesis not found' });
      }
  
      res.json({
        title: thesis.title,
        studentName: thesis.student ? thesis.student.username : null,
        lastUpdate: thesis.lastUpdate ? thesis.lastUpdate.toISOString() : null,
        submitted: thesis.submitted,
        fileName: thesis.fileName,
      });
    } catch (error) {
      console.error('Error fetching thesis details:', error);
      res.status(500).json({ message: 'Failed to fetch thesis details' });
    }
  });
  
  router.get('/thesis/:thesisId/feedbacks', authenticate, async (req, res) => {
    const { thesisId } = req.params;
  
    try {
      const feedbacks = await prisma.feedback.findMany({
        where: {
          thesisId: parseInt(thesisId),
        },
        include: {
          author: { 
            select: {
              username: true,
            },
          },
        },
      });
  
      res.json(feedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({ message: 'Failed to fetch feedbacks' });
    }
  });
  
// Route to submit feedback (POST /thesis/:thesisId/feedbacks)
router.post('/thesis/:thesisId/feedbacks', authenticate, authorizeTeacher, async (req, res) => {
    const { thesisId } = req.params;
    const { content } = req.body;
  
    if (!content) {
      return res.status(400).json({ message: 'Feedback content is required' });
    }
  
    try {
      const feedback = await prisma.feedback.create({
        data: {
          content,
          thesisId: parseInt(thesisId),
          userId: req.userId, 
        },
      });
      res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Failed to submit feedback' });
    }
  });
  
  
// Route for teachers to create a thesis title
router.post('/thesis/add', authenticate, authorizeTeacher, async (req, res) => {
    const { title, date, description } = req.body;
    try {
      const thesis = await prisma.thesis.create({
        data: {
          title,
          date,
          description,
          addedBy: req.userId,
        },
      });
      res.status(201).json({ message: 'Thesis title added successfully', thesis });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add thesis title' });
    }
  });
  
  // Route to fetch all thesis titles with their status (for teachers)
  router.get('/thesis/view', authenticate, authorizeTeacher, async (req, res) => {
    try {
      const theses = await prisma.thesis.findMany({
        include: {
          student: { select: { username: true } },
        },
      });
      res.json(theses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch theses' });
    }
  });
  
  // Route for students to fetch unassigned thesis titles
  router.get('/thesis/unassigned', authenticate, authorizeStudent, async (req, res) => {
    try {
      const theses = await prisma.thesis.findMany({
        where: { requestedBy: null },
      });
      res.json(theses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch unassigned theses' });
    }
  });
  
  router.post('/thesis/request', authenticate, authorizeStudent, async (req, res) => {
    const { thesisId } = req.body;
    console.log('Thesis ID:', thesisId, 'User ID:', req.userId);
    try {
      const thesis = await prisma.thesis.update({
        where: { id: thesisId },
        data: { requestedBy: req.userId },
      });
      res.status(200).json({ message: 'Thesis requested successfully', thesis });
    } catch (error) {
      console.error('Error requesting thesis:', error);
      res.status(500).json({ message: 'Failed to request thesis' });
    }
  });
  
  // Route to fetch thesis requests that need teacher approval
  router.get('/thesis/requests-for-approval', authenticate, authorizeTeacher, async (req, res) => {
    try {
      const thesisRequests = await prisma.thesis.findMany({
        where: {
          requestedBy: { not: null },
          approved: false,
        },
        include: {
          student: { select: { username: true } },
        },
      });
  
      const requests = thesisRequests.map(thesis => ({
        id: thesis.id,
        title: thesis.title,
        description: thesis.description,
        studentName: thesis.student ? thesis.student.username : 'Not assigned',
        approved: thesis.approved,
        requestedBy: thesis.requestedBy,
      }));
  
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch requests' });
    }
  });
  
  // Route for teachers to approve a thesis request
  router.post('/thesis/approve', authenticate, authorizeTeacher, async (req, res) => {
    const { thesisId, studentId } = req.body;
    try {
      const thesis = await prisma.thesis.update({
        where: { id: thesisId },
        data: {
          requestedBy: studentId,
          approved: true,
        },
      });
      res.status(200).json({ message: 'Thesis approved successfully', thesis });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve thesis' });
    }
  });
module.exports = router;
