const express = require('express');
const { registerPage, loginPageP, checkMail, upload, getUser, transferTokens, getTransactions,} = require('../controllers/user.controller')
const router = express.Router();
const verifyToken = require('../middleware/auth');


router.post('/sign-up', registerPage)

router.post('/login', loginPageP)

router.post('/check-mail', checkMail)

router.post('/upload', upload);

router.post('/transfer',verifyToken, transferTokens);

router.get('/dashboard/:id',verifyToken, getUser)

router.get('/transactions/:id', verifyToken, getTransactions);



module.exports = router