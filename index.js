const express = require ('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));
app.use(express.json({limit:'50mb'}))
const bcrypt = require('bcryptjs')
const ejs = require('ejs')
const dotenv = require('dotenv')
dotenv.config()
const path = require('path');
const cloudinary = require('cloudinary')
const { type } = require('os');
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true, limit:'50mb' }))
const UserRoute = require('./routes/user.routes')
app.use('/user', UserRoute)





let URI = process.env.DATABASE_URI;
mongoose.connect(URI)
.then(() => {
    console.log('database connected');
  }).catch((e) => {
    console.log(e);

  })

app.get('/', (req,res)=>{
  res.send({status:true, message:'application working fine'})
})





let port = 2800
app.listen(port, (err) => {
  if (err) {
    console.log('server cannot start');

  } else {
    console.log('server started');

  }
})
