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
    console.log('Upload thesis request received:', { userId, thesisId });

    if (!thesisId) {
        console.log('Thesis ID is missing');
        return res.status(400).json({ message: 'Thesis ID is required' });
    }

    try {
        const thesisDir = path.join(__dirname, '../student-thesis');
        if (!fs.existsSync(thesisDir)) {
            console.log('Creating thesis directory:', thesisDir);
            fs.mkdirSync(thesisDir, { recursive: true });
        }

        const thesis = await prisma.thesis.findFirst({
            where: { id: parseInt(thesisId), requestedBy: userId },
        });
        console.log('Thesis check result:', thesis ? 'Thesis found' : 'Thesis not found');

        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found or not assigned to the user' });
        }

        const fileName = `thesis_${userId}_${thesisId}${path.extname(req.file.originalname)}`;
        const targetPath = path.join(thesisDir, fileName);

        if (thesis.fileName && fs.existsSync(path.join(thesisDir, thesis.fileName))) {
            console.log('Deleting existing file:', thesis.fileName);
            fs.unlinkSync(path.join(thesisDir, thesis.fileName));
        }

        console.log('Saving file to:', targetPath);
        fs.renameSync(req.file.path, targetPath);

        await prisma.thesis.update({
            where: { id: thesis.id },
            data: {
                submitted: true,
                lastUpdate: new Date(),
                fileName,
            },
        });
        console.log('Thesis uploaded successfully:', fileName);

        res.status(200).json({ message: 'Thesis uploaded successfully', fileLink: `/thesis/files/${fileName}` });
    } catch (error) {
        console.error('Database error while handling thesis upload:', error);
        res.status(500).json({ message: 'Failed to upload thesis' });
    }
});

// Delete a thesis by ID
router.delete('/thesis/:thesisId', authenticate, authorizeTeacher, async (req, res) => {
    const { thesisId } = req.params;
    console.log('Delete thesis request received for ID:', thesisId);

    try {
        await prisma.thesis.delete({
            where: { id: parseInt(thesisId) },
        });
        console.log('Thesis deleted successfully:', thesisId);
        res.status(200).json({ message: 'Thesis deleted successfully' });
    } catch (error) {
        console.error('Error deleting thesis:', error);
        res.status(500).json({ message: 'Failed to delete thesis' });
    }
});

// Route to submit feedback
router.post('/thesis/:thesisId/feedbacks', authenticate, authorizeTeacher, async (req, res) => {
    const { thesisId } = req.params;
    const { content } = req.body;
    console.log('Feedback submission received:', { thesisId, content });

    if (!content) {
        console.log('Feedback content is missing');
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
        console.log('Feedback submitted successfully for thesis:', thesisId);
        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
});

// Get all theses assigned to a student with feedback
router.get('/thesis/student', authenticate, async (req, res) => {
    console.log('Fetching theses for student:', req.userId);

    try {
        const theses = await prisma.thesis.findMany({
            where: { requestedBy: req.userId },
            include: {
                feedbacks: {
                    include: { author: { select: { username: true } } },
                },
            },
        });
        console.log('Fetched theses for student:', theses.length);
        res.json(theses);
    } catch (error) {
        console.error('Error fetching student theses:', error);
        res.status(500).json({ message: 'Failed to fetch theses' });
    }
});

// Fetch thesis details with assignment information
router.get('/thesis/:thesisId/details', authenticate, async (req, res) => {
    const { thesisId } = req.params;
    console.log('Fetching thesis details for ID:', thesisId);

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

        console.log('Fetched thesis details:', thesis.title);
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

// Fetch feedbacks for a thesis
router.get('/thesis/:thesisId/feedbacks', authenticate, async (req, res) => {
    const { thesisId } = req.params;
    console.log('Fetching feedbacks for thesis ID:', thesisId);

    try {
        const feedbacks = await prisma.feedback.findMany({
            where: { thesisId: parseInt(thesisId) },
            include: {
                author: { select: { username: true } },
            },
        });
        console.log('Fetched feedbacks:', feedbacks.length);
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ message: 'Failed to fetch feedbacks' });
    }
});

// Route for teachers to create a thesis title
router.post('/thesis/add', authenticate, authorizeTeacher, async (req, res) => {
    const { title, date, description } = req.body;
    console.log('Adding thesis title:', { title, date, description });

    try {
        const thesis = await prisma.thesis.create({
            data: {
                title,
                date,
                description,
                addedBy: req.userId,
            },
        });
        console.log('Thesis title added successfully:', title);
        res.status(201).json({ message: 'Thesis title added successfully', thesis });
    } catch (error) {
        console.error('Failed to add thesis title:', error);
        res.status(500).json({ message: 'Failed to add thesis title' });
    }
});

// Route to fetch all thesis titles with their status (for teachers)
router.get('/thesis/view', authenticate, authorizeTeacher, async (req, res) => {
    console.log('Fetching all thesis titles for teacher view');

    try {
        const theses = await prisma.thesis.findMany({
            include: {
                student: { select: { username: true } },
            },
        });
        console.log('Fetched theses:', theses.length);
        res.json(theses);
    } catch (error) {
        console.error('Failed to fetch theses:', error);
        res.status(500).json({ message: 'Failed to fetch theses' });
    }
});

// Route for students to fetch unassigned thesis titles
router.get('/thesis/unassigned', authenticate, authorizeStudent, async (req, res) => {
    console.log('Fetching unassigned theses');

    try {
        const theses = await prisma.thesis.findMany({
            where: { requestedBy: null },
        });
        console.log('Fetched unassigned theses:', theses.length);
        res.json(theses);
    } catch (error) {
        console.error('Failed to fetch unassigned theses:', error);
        res.status(500).json({ message: 'Failed to fetch unassigned theses' });
    }
});

// Route to request a thesis
router.post('/thesis/request', authenticate, authorizeStudent, async (req, res) => {
    const { thesisId } = req.body;
    console.log('Requesting thesis:', { thesisId, userId: req.userId });

    try {
        const thesis = await prisma.thesis.update({
            where: { id: thesisId },
            data: { requestedBy: req.userId },
        });
        console.log('Thesis requested successfully:', thesisId);
        res.status(200).json({ message: 'Thesis requested successfully', thesis });
    } catch (error) {
        console.error('Error requesting thesis:', error);
        res.status(500).json({ message: 'Failed to request thesis' });
    }
});

// Route to fetch thesis requests that need teacher approval
router.get('/thesis/requests-for-approval', authenticate, authorizeTeacher, async (req, res) => {
    console.log('Fetching thesis requests for approval');

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

        console.log('Fetched thesis requests for approval:', requests.length);
        res.json(requests);
    } catch (error) {
        console.error('Failed to fetch requests:', error);
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
});

// Route for teachers to approve a thesis request
router.post('/thesis/approve', authenticate, authorizeTeacher, async (req, res) => {
    const { thesisId, studentId } = req.body;
    console.log('Approving thesis request:', { thesisId, studentId });

    try {
        const thesis = await prisma.thesis.update({
            where: { id: thesisId },
            data: {
                requestedBy: studentId,
                approved: true,
            },
        });
        console.log('Thesis approved successfully:', thesisId);
        res.status(200).json({ message: 'Thesis approved successfully', thesis });
    } catch (error) {
        console.error('Failed to approve thesis:', error);
        res.status(500).json({ message: 'Failed to approve thesis' });
    }
});

module.exports = router;
