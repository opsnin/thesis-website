const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = 5174;
const SECRET_KEY = 'your_jwt_secret_key';

// Enable CORS for requests from frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(bodyParser.json());

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log('Token verified successfully:', decoded);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  });
};

// Middleware to authorize teachers only
const authorizeTeacher = (req, res, next) => {
  if (req.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Middleware to authorize students only
const authorizeStudent = (req, res, next) => {
  if (req.role !== 'STUDENT') return res.status(403).json({ message: 'Access denied' });
  next();
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, 'student-thesis');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      cb(null, dir);
    },
    filename: async (req, file, cb) => {
      const userId = req.userId;
  
      if (!userId) {
        console.error('User ID is required');
        return cb(new Error('User ID is required'), null);
      }
  
      try {
        const ext = path.extname(file.originalname);
        const newFileName = `thesis_${userId}${ext}`;
        const filePath = path.join(__dirname, 'student-thesis', newFileName);
  
        // Check if file exists, and if so, delete it to overwrite
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Remove the existing file
        }
  
        cb(null, newFileName); // Use a consistent file name per user
      } catch (err) {
        console.error('Error processing file upload:', err);
        cb(new Error('Database error'), null);
      }
    }
  });
  
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Only .pdf and .docx files are allowed'), false);
      }
      cb(null, true);
    },
  });
  
  // Upload thesis endpoint
  app.post('/upload-thesis', authenticate, authorizeStudent, upload.single('file'), async (req, res) => {
    const { userId } = req;
    const { thesisId } = req.body; // Capture thesisId from the request body
  
    if (!thesisId) {
      return res.status(400).json({ message: 'Thesis ID is required' });
    }
  
    try {
      // Ensure the `student-thesis` directory exists
      const thesisDir = path.join(__dirname, 'student-thesis');
      if (!fs.existsSync(thesisDir)) {
        fs.mkdirSync(thesisDir);
      }
  
      // Check if the thesis is assigned to the user
      const thesis = await prisma.thesis.findFirst({
        where: { id: parseInt(thesisId), requestedBy: userId },
      });
  
      if (!thesis) {
        return res.status(404).json({ message: 'Thesis not found or not assigned to the user' });
      }
  
      // Construct a consistent file name
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
  
      res.status(200).json({ message: 'Thesis uploaded successfully', fileLink: `/student-thesis/${fileName}` });
    } catch (error) {
      console.error('Database error while handling thesis upload:', error);
      res.status(500).json({ message: 'Failed to upload thesis' });
    }
  });
  
  
// Route to submit feedback (POST /thesis/:thesisId/feedbacks)
app.post('/thesis/:thesisId/feedbacks', authenticate, authorizeTeacher, async (req, res) => {
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
        teacherId: req.userId,
      },
    });
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});
// Backend route to get all theses assigned to a student with feedback
app.get('/thesis/student', authenticate, async (req, res) => {
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
app.get('/thesis/:thesisId/details', authenticate, async (req, res) => {
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
  
  

  app.get('/thesis/:thesisId/feedbacks', authenticate, async (req, res) => {
    const { thesisId } = req.params;
  
    try {
      const feedbacks = await prisma.feedback.findMany({
        where: {
          thesisId: parseInt(thesisId),
        },
        include: {
          author: { // Use the relation field as defined in the schema
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
app.post('/thesis/:thesisId/feedbacks', authenticate, authorizeTeacher, async (req, res) => {
    const { thesisId } = req.params;
    const { content } = req.body;
  
    if (!content) {
      return res.status(400).json({ message: 'Feedback content is required' });
    }
  
    try {
      const feedback = await prisma.feedback.create({
        data: {
          content,
          thesisId: parseInt(thesisId), // Use thesisId directly
          userId: req.userId, // Use userId from the token (authenticated teacher)
        },
      });
      res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Failed to submit feedback' });
    }
  });
  
  
// Signup route
//app.post('/signup', async (req, res) => {
//  const { username, email, password, role } = req.body;
//
//  try {
//    const existingUser = await prisma.user.findFirst({
//      where: { OR: [{ email }, { username }] },
//    });
//
//    if (existingUser) {
//      return res.status(400).json({ message: 'User with this email or username already exists' });
//    }
//
//    const hashedPassword = await bcrypt.hash(password, 10);
//
//    const user = await prisma.user.create({
//      data: {
//        username,
//        email,
//        password: hashedPassword,
//        role: role === 'teacher' ? 'TEACHER' : 'STUDENT',
//      },
//    });
//
//    console.log('User created successfully:', { username: user.username, role: user.role });
//    res.status(201).json({ message: 'User created successfully' });
//  } catch (error) {
//    console.error('Signup error:', error);
//    res.status(500).json({ message: 'Internal server error' });
//  }
//});

// Login route returns token, role, username, and userId
//app.post('/login', async (req, res) => {
//    const { email, password } = req.body;
//  
//    try {
//      const user = await prisma.user.findUnique({ where: { email } });
//      if (!user) {
//        return res.status(400).json({ message: 'Invalid email or password' });
//      }
//  
//      const isPasswordValid = await bcrypt.compare(password, user.password);
//      if (!isPasswordValid) {
//        return res.status(400).json({ message: 'Invalid email or password' });
//      }
//  
//      // Generate JWT token including userId and role
//      const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
//  
//      // Send user information and token to the client
//      res.json({ 
//        message: 'Login successful', 
//        token, 
//        role: user.role, 
//        username: user.username, 
//        userId: user.id // Include userId in the response
//      });
//    } catch (error) {
//      console.error('Login error:', error);
//      res.status(500).json({ message: 'Internal server error' });
//    }
//  });  

// Logout route
app.post('/logout', (req, res) => {
  console.log('Logout request received');
  res.status(200).json({ message: 'Logout successful' });
});

// Route for teachers to create a thesis title
app.post('/thesis/add', authenticate, authorizeTeacher, async (req, res) => {
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
app.get('/thesis/view', authenticate, authorizeTeacher, async (req, res) => {
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
app.get('/thesis/unassigned', authenticate, authorizeStudent, async (req, res) => {
  try {
    const theses = await prisma.thesis.findMany({
      where: { requestedBy: null },
    });
    res.json(theses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unassigned theses' });
  }
});

// Route for students to request a thesis
app.post('/thesis/request', authenticate, authorizeStudent, async (req, res) => {
  const { thesisId } = req.body;
  try {
    const thesis = await prisma.thesis.update({
      where: { id: thesisId },
      data: { requestedBy: req.userId },
    });
    res.status(200).json({ message: 'Thesis requested successfully', thesis });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request thesis' });
  }
});

// Route to fetch thesis requests that need teacher approval
app.get('/thesis/requests-for-approval', authenticate, authorizeTeacher, async (req, res) => {
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
app.post('/thesis/approve', authenticate, authorizeTeacher, async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
