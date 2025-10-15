const express = require('express');
const router = express.Router();
const { readJson } = require('../utils/storage');
const bcrypt = require('bcryptjs');

router.get('/login', (req, res) => {
  res.render('partials/layout', { title: 'Login', user: req.session.user || null, body: `
    <div class="container">
      <h1>Login</h1>
      <form method="POST" action="/auth/login">
        <div><label>Email <input type="email" name="email" required></label></div>
        <div><label>Password <input type="password" name="password" required></label></div>
        <button type="submit">Login</button>
      </form>
      <p>Teacher: teacher@example.com / teacher123</p>
      <p>Student: student@example.com / student123</p>
    </div>
  ` });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJson('users.json', []);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).send('Invalid credentials');
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).send('Invalid credentials');
  req.session.user = { id: user.id, name: user.name, role: user.role, email: user.email };
  if (user.role === 'teacher') return res.redirect('/teacher');
  return res.redirect('/student');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;
