const GMAIL = process.env.GMAIL;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { isEmpty } = require('jvh-is-empty');

const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: GMAIL,
        pass: GMAIL_PASSWORD
    }
};

const transporter = nodemailer.createTransport(smtpConfig);

module.exports = sendMail = async (req, res, next) => {
    let html = ``;

    const foundUser = await User.findOne({ email: req.params.email });

    if (isEmpty(foundUser)) {
        return res.status(404).json({ 
            status: 404,
            serverMsg: 'Could not find user with this email address.'
        });
    }
    console.log(req.body.type);
    if (req.body.type === 'password') {
        html = `
        <img style="width: 200px;" src="https://covertlocker.monster/assets/images/undercover.jpeg" />
        <a style="text-align: center; font-size: 1rem; font-weight: 500;" href="http://localhost:8080/password?user_email=${req.params.email}&id=${foundUser._id}" target="_blank">Click here to reset your password</a>`
    }

    if (req.body.type === 'security') {
        html = `
            <img style="width: 200px;" src="https://covertlocker.monster/assets/images/undercover.jpeg" />
            <a style="text-align: center; font-size: 1rem; font-weight: 500;" href="http://localhost:8080/security?user_email=${req.params.email}&id=${foundUser._id}" target="_blank">Click here to change your security question</a>
        `
    }

    let mailOptions = {
        from: `Consultation ${GMAIL}`,
        bcc: req.params.email,
        subject: req.body.subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                serverMsg: 'There was a problem. Please try again later'
            });
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(201).json({
                serverMsg: 'Please check your email to follow the next steps.'
            });
        }
    });
};