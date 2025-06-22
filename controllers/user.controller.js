const bcrypt = require('bcryptjs')
const express = require('express') // to import express
const app = express();
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const nodemailer = require('nodemailer')
const UserModel = require('../models/user.model')
const dotenv =  require('dotenv')
dotenv.config()
let message;

cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_KEY, 
        api_secret: process.env.CLOUD_SECRET, // Click 'View API Keys' above to copy your API secret
    });

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAIL_GMAIL,
    pass: process.env.NODEMAIL_PASS,
  }
});

const upload=(req,res)=>{
  const {file} = req.body
  cloudinary.v2.uploader.upload(file, (error, result)=>{
    if(error){
      console.log(error)
      console.log('cannot upload file at this moment');
      res.send({status:false, message:'file cannot be uploaded'})     
    }else{
      console.log('file upload');
      console.log(result);
      res.send({status:true, message:' file uploaded successfully'})
      
    }
  
});
}

const registerPage = async (req, res) => {
  const { first_name, phone_number, email, password, profileImage } = req.body
    let image;
  try {
    const saltRound = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(req.body.password, saltRound)
    console.log(hashed);

   await cloudinary.v2.uploader.upload(profileImage, (error, result)=>{
    if(error){
      console.log(error)
      console.log('cannot upload file at this moment');
      res.send({status:false, message:'file cannot be uploaded'})     
    }else{
      console.log('file upload');
      console.log(result.secure_url);
      image =  result.secure_url
      res.send({status:true, message:' file uploaded successfully'})
      
    }
  
});
    let userForm = new UserModel({ first_name, phone_number, email, password: hashed, profileImage:image })
    await userForm.save()
    var mailOptions = {
  from:process.env.NODEMAIL_GMAIL,
  to: req.body.email,
  subject: `WELCOME TO VIBRANT ${req.body.first_name}`,
  text: 'Account created successfully'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
    
    // res.render('register', {message})
    res.send({status:true,message:'registered successfully' })
  } catch (err) {
    console.log(err.errorResponse.code);
    if(err.errorResponse.code == 11000){
      res.send({status:false, message:'registered failed, user already exist' })
    }else{
      res.send({
        status: 'false',
        message:'cannot create your account at this time'
      })
    }
   

  }

}

const loginPageP = async (req, res)=>{
  // const{email, phone_number, password} =req.body
  const{loginId, password} =req.body
  try{
    let user;
    let mail = req.body.loginId
    // if(!req.body,email && !req.body.phone_number){
    //   nessage = 'please input a phone number or email'
    //   res.render('login', {message})
    // }
    if(mail.includes('@')){
       user = await UserModel.findOne({email: req.body.loginId})
    }else{
       user = await UserModel.findOne({phone_number: req.body.loginId})
    }
  //  if(mail){
  //   user = await UserModel.findOne({email})
  //  }else{
  //   user = await UserModel.findOne({phone_number})
  //  }
  if(!user){
     res.send({status:true,message:'invalid credentials' })
    // message = 'invalid credentials'
    // res.render('login', {message});    
  }else{
   let isMatch = await bcrypt.compare(password, user.password)
   if (isMatch){
    // console.log('user logged in successfully');
    const token = jwt.sign({id:user._id}, process.env.APP_PASS, {expiresIn:'1h'} )
    res.send({message:'signin successful', token})
    // res.render('dashboard')
    
   }else{
    console.log('invalid credentials');
    // message = 'invalid credentials'
    // res.render('login', { message })
     res.send({status:true,message:'registered successfully' })
    
   }
  }
  }catch (err){
    console.log(err);
        
  }
}

const checkMail = async (req, res)=>{
   const{email, password} =req.body;
    try{
   let user = await UserModel.findOne({email})

   if (user){
    console.log(user);

    const saltRound = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(req.body.password, saltRound)
    const updatedUser = await UserModel.findByIdAndUpdate(user._id, {password:hashed})
    
    if (updatedUser){
      res.send({status:true, message:'Account updated successfully'})
    }
   }
  
  
  }catch (err){
    res.send({status:false, message:'cannot update info'})
      
  }
}

module.exports = {
    registerPage,
    checkMail,
    loginPageP,
    upload
    
}