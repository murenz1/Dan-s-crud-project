const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { setCurrentUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    },
  },
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_super_secret_session_key_change_in_production',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(setCurrentUser);

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);

app.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/student');
    }
  }
  res.redirect('/login');
});

app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: { status: 404 },
    title: 'Error - Page Not Found',
    user: req.session.user
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {},
    title: 'Error',
    user: req.session.user
  });
});

async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();