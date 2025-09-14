const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const User = require('./models/User');
const Upload = require('./models/Upload');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/wifto', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer config for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Unique filename
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- Auth APIs ---

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: 'User already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hash });
  await user.save();
  res.json({ success: true });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });
  res.json({ success: true, username });
});

// --- Upload APIs ---

// File/Image Upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (req.file) {
    const type = req.file.mimetype.startsWith('image') ? 'image' : 'file';
    const newUpload = new Upload({
      filename: req.file.originalname,
      url: '/uploads/' + req.file.filename,
      type,
      uploadedBy: req.body.uploadedBy || 'Anonymous',
    });
    await newUpload.save();
    return res.json({ success: true });
  }
  // Text upload
  if (req.body.text) {
    const newUpload = new Upload({
      type: 'text',
      text: req.body.text,
      uploadedBy: req.body.uploadedBy || 'Anonymous',
    });
    await newUpload.save();
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'No file or text uploaded' });
});

// Get all uploads
app.get('/api/uploads', async (req, res) => {
  const uploads = await Upload.find().sort({ date: -1 });
  res.json(uploads);
});

// --- Optionally: Quiz History, Leaderboard, Achievements APIs ---
// You can add endpoints to save/fetch these from User or separate models

// --- Run Server ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});