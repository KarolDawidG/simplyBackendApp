const nodemailer = require("nodemailer");
const {user, pass} = require("../config/configENV");
const express = require('express');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', (req, res)=>{
    res.render('home', {layout : 'contact'});
})

router.post('/', (req, res)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });
    const mailOptions = {
        from: req.body.email,
        to: user,
        subject: `Meesage from ${req.body.email}: ${req.body.subject}`,

        text:
            `Email sender: ${req.body.email}		
Name of sender: ${req.body.name}
Subject: ${req.body.subject}\n
Message:\n ${req.body.message}.`
    };

    transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
            console.log(error);
            res.send('error');
        } else {
            console.log('Email sent to ' + mailOptions.to);
            res.send('success');
        }
    });
})

module.exports = router;