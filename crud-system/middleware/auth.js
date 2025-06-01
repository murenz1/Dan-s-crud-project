const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).render('error', { 
    message: 'Access denied. Admin privileges required.', 
    error: { status: 403 },
    title: 'Access Denied'
  });
};

const isStudent = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'student') {
    return next();
  }
  return res.status(403).render('error', { 
    message: 'Access denied. Student privileges required.', 
    error: { status: 403 },
    title: 'Access Denied'
  });
};

const setCurrentUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentUser = req.session.user || null;
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isStudent,
  setCurrentUser
};