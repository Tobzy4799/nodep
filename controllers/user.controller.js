const bcrypt = require('bcryptjs')
const express = require('express') // to import express
const app = express();
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const nodemailer = require('nodemailer')
const UserModel = require('../models/user.model')
const dotenv =  require('dotenv')
dotenv.config()
const { ethers } = require('ethers');
const Transaction = require('../models/transaction.model');

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
  const { first_name, phone_number, email, password, profileImage } = req.body;

  try {
    const saltRound = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, saltRound);

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(profileImage);
    const image = uploadResult.secure_url;

    // Generate Ethereum-like wallet address
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;

    // Create and save user
    const userForm = new UserModel({
      first_name,
      phone_number,
      email,
      password: hashed,
      profileImage: image,
      walletAddress: walletAddress,
      balance: 100
    });

    await userForm.save();

    // Send welcome email
    const mailOptions = {
      from: process.env.NODEMAIL_GMAIL,
      to: email,
      subject: `WELCOME TO VIBRANT ${first_name}`,
      text: 'Account created successfully',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.send({ status: true, message: 'Registered successfully' });

  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.send({ status: false, message: 'Registration failed, user already exists' });
    } else {
      res.send({ status: false, message: 'Cannot create your account at this time' });
    }
  }
};


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
    res.send({message:'signin successful', token, id: user._id})
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

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).send({ status: false, message: "User not found" });
    }
    res.send({ status: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: false, message: "Error retrieving user" });
  }
};

const transferTokens = async (req, res) => {
  const { senderId, recipientAddress, amount } = req.body;

  try {
    const sender = await UserModel.findById(senderId);
    const recipient = await UserModel.findOne({ walletAddress: recipientAddress });

    if (!sender || !recipient) {
      return res.status(404).send({ status: false, message: "Sender or recipient not found" });
    }

    if (sender.walletAddress === recipientAddress) {
      return res.status(400).send({ status: false, message: "You can't send tokens to yourself" });
    }

    if (sender.balance < amount) {
      return res.status(400).send({ status: false, message: "Insufficient balance" });
    }

    // Perform token transfer
    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save();
    await recipient.save();

    // Save just one transaction (don't duplicate)
    await Transaction.create({
      from: sender.walletAddress,
      to: recipient.walletAddress,
      amount
    });

    return res.send({
      status: true,
      message: `Successfully sent ${amount} tokens to ${recipient.walletAddress}`,
      newBalance: sender.balance
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: false, message: "Transfer failed due to server error" });
  }
};


const getTransactions = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const wallet = user.walletAddress;

    // Find all transactions where the user is either sender or recipient
    const transactions = await Transaction.find({
      $or: [{ from: wallet }, { to: wallet }]
    }).sort({ timestamp: -1 });

    // Infer type based on user role in each transaction
    const taggedTransactions = transactions.map(tx => ({
      ...tx.toObject(),
      type: tx.from === wallet ? "sent" : "received"
    }));

    res.status(200).json({ status: true, transactions: taggedTransactions });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    res.status(500).json({ status: false, message: "Failed to fetch transactions" });
  }
};





module.exports = {
    registerPage,
    checkMail,
    loginPageP,
    upload,
    getUser,
    transferTokens,
    getTransactions
    
}