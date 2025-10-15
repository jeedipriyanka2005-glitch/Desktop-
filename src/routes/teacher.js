const express = require('express');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const { readJson, writeJson } = require('../utils/storage');

const router = express.Router();

router.use(requireAuth('teacher'));

router.get('/', (req, res) => {
  const assignments = readJson('assignments.json', []);
  const submissions = readJson('submissions.json', []);
  const users = readJson('users.json', []);
  const studentsById = Object.fromEntries(users.filter(u => u.role === 'student').map(u => [u.id, u]));

  const body = `
  <div class="container">
    <h1>Teacher Dashboard</h1>
    <h2>Assignments</h2>
    <ul>
      ${assignments.map(a => `<li><strong>${a.title}</strong> - Due: ${new Date(a.dueDate).toLocaleString()}</li>`).join('')}
    </ul>

    <h2>Submissions</h2>
    <ul>
      ${submissions.map(s => `<li>
        ${s.assignmentId} - ${studentsById[s.studentId]?.name || s.studentId} - ${s.originalName}
        - Status: ${s.status}${s.grade ? ` (Grade: ${s.grade})` : ''}
        <form method="POST" action="/teacher/grade" style="display:inline-block; margin-left:8px;">
          <input type="hidden" name="submissionId" value="${s.id}" />
          <input name="grade" placeholder="Grade" style="width:80px"/>
          <input name="feedback" placeholder="Feedback" style="width:200px"/>
          <button type="submit">Save</button>
        </form>
      </li>`).join('')}
    </ul>
  </div>`;
  res.render('partials/layout', { title: 'Teacher Dashboard', user: req.session.user, body });
});

router.post('/grade', (req, res) => {
  const { submissionId, grade, feedback } = req.body;
  const submissions = readJson('submissions.json', []);
  const idx = submissions.findIndex(s => s.id === submissionId);
  if (idx === -1) return res.status(404).send('Submission not found');
  submissions[idx].grade = grade || submissions[idx].grade;
  submissions[idx].feedback = feedback || submissions[idx].feedback;
  submissions[idx].status = 'graded';
  writeJson('submissions.json', submissions);
  res.redirect('/teacher');
});

module.exports = router;
