const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { userValidationRules, handleValidationErrors } = require('../middleware/validators');

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null, user: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Username and password are required',
        user: null
      });
    }
    const user = await User.findByUsername(username);
    if (!user) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Invalid credentials',
        user: null
      });
    }
    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Invalid credentials',
        user: null
      });
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    if (user.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/student');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('error', { 
      message: 'Server error', 
      error: { status: 500 },
      title: 'Error'
    });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null, user: null });
});

router.post('/register', userValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.render('register', { 
        title: 'Register', 
        error: 'Username already exists',
        user: null
      });
    }
    await User.create({ username, password, role });
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('error', { 
      message: 'Server error', 
      error: { status: 500 },
      title: 'Error'
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).render('error', { 
        message: 'Server error', 
        error: { status: 500 },
        title: 'Error'
      });
    }
    res.redirect('/login');
  });
});

module.exports = router;