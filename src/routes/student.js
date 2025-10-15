const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const { readJson, writeJson } = require('../utils/storage');

const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

router.use(requireAuth('student'));

router.get('/', (req, res) => {
  const assignments = readJson('assignments.json', []);
  const submissions = readJson('submissions.json', []);
  const mySubs = submissions.filter(s => s.studentId === req.session.user.id);
  const body = `
  <div class="container">
    <h1>Assignments</h1>
    <ul>
      ${assignments.map(a => `<li><strong>${a.title}</strong> - Due: ${new Date(a.dueDate).toLocaleString()}
        <form method="POST" action="/student/submit" enctype="multipart/form-data" style="margin-top:8px;">
          <input type="hidden" name="assignmentId" value="${a.id}" />
          <input type="file" name="file" required />
          <button type="submit">Submit</button>
        </form>
      </li>`).join('')}
    </ul>

    <h2>Your Submissions</h2>
    <ul>
      ${mySubs.map(s => `<li>${s.assignmentId} - ${s.originalName} - ${s.status}${s.grade ? ` (Grade: ${s.grade})` : ''}</li>`).join('')}
    </ul>
  </div>`;
  res.render('partials/layout', { title: 'Student Dashboard', user: req.session.user, body });
});

router.post('/submit', upload.single('file'), (req, res) => {
  const { assignmentId } = req.body;
  if (!req.file) return res.status(400).send('No file uploaded');
  const submissions = readJson('submissions.json', []);
  submissions.push({
    id: uuidv4(),
    studentId: req.session.user.id,
    assignmentId,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    uploadedAt: new Date().toISOString(),
    status: 'submitted',
    grade: null,
    feedback: null,
  });
  writeJson('submissions.json', submissions);
  res.redirect('/student');
});

module.exports = router;
