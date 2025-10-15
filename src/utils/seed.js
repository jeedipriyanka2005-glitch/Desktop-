const path = require('path');
const { readJson, writeJson } = require('./storage');
const bcrypt = require('bcryptjs');

function seed() {
  const users = readJson('users.json', []);
  const assignments = readJson('assignments.json', []);
  const submissions = readJson('submissions.json', []);

  if (users.length === 0) {
    const teacherPasswordHash = bcrypt.hashSync('teacher123', 10);
    const studentPasswordHash = bcrypt.hashSync('student123', 10);

    const seededUsers = [
      { id: 't1', name: 'Alice Teacher', email: 'teacher@example.com', role: 'teacher', passwordHash: teacherPasswordHash },
      { id: 's1', name: 'Bob Student', email: 'student@example.com', role: 'student', passwordHash: studentPasswordHash },
    ];
    writeJson('users.json', seededUsers);
    console.log('Seeded users');
  }

  if (assignments.length === 0) {
    writeJson('assignments.json', [
      { id: 'a1', title: 'Intro Assignment', description: 'Upload a text file.', dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
    ]);
    console.log('Seeded assignments');
  }

  if (submissions.length === 0) {
    writeJson('submissions.json', []);
    console.log('Seeded submissions');
  }
}

seed();
