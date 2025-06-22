const express = require('express');
const { registerPage, loginPageP, checkMail, upload} = require('../controllers/user.controller')
const router = express.Router();

router.post('/sign-up', registerPage)

router.post('/login', loginPageP)

router.post('/check-mail', checkMail)

router.post('/upload', upload)

// router.post('/update-password', updatePassword)

module.exports = router