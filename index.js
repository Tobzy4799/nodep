const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('cloudinary');

dotenv.config();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// ✅ CORS: Allow localhost AND Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://vibrawallet.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Routes
const UserRoute = require('./routes/user.routes');
app.use('/user', UserRoute);

const profile = require('./routes/profile.routes');
app.use('/api', profile); // Now /api/profile is active

// DB Connection
let URI = process.env.DATABASE_URI;
mongoose.connect(URI)
  .then(() => {
    console.log('database connected');
  })
  .catch((e) => {
    console.log(e);
  });

// Root
app.get('/', (req, res) => {
  res.send({ status: true, message: 'application working fine' });
});

// Server Start
let port = 2800;
app.listen(port, (err) => {
  if (err) {
    console.log('server cannot start');
  } else {
    console.log(`server started on port ${port}`);
  }
});

