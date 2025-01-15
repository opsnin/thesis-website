const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const thesisRoutes = require('./routes/thesis');

const app = express();
const PORT = 5174;

// Enable CORS for requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE','PUT'],
  credentials: true
}));

// Serve static files for theses
app.use('/thesis/', express.static(path.join(__dirname, 'student-thesis')));
app.use('/thesis/subtask/', express.static(path.join(__dirname, 'student-thesis')));

// Parse JSON body
app.use(bodyParser.json());

// Mount routes #need update
app.use('/auth', authRoutes);
app.use('/thesis', thesisRoutes);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
