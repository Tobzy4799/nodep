const express = require('express');
const { registerPage, loginPageP, checkMail, upload, verifyToken, getUser, transferTokens} = require('../controllers/user.controller')
const router = express.Router();

router.post('/sign-up', registerPage)

router.post('/login', loginPageP)

router.post('/check-mail', checkMail)

router.post('/upload', upload);

router.post('/transfer', transferTokens);

router.get('/dashboard/:id', verifyToken, getUser)

// router.post('/update-password', verifyToken,updatePassword)

module.exports = router