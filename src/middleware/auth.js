function requireAuth(role) {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user) return res.redirect('/auth/login');
    if (role && user.role !== role) return res.status(403).send('Forbidden');
    next();
  };
}

module.exports = { requireAuth };
