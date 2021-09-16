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

    const foundUser = await User.findOne({ email: req.params.email });

    if (isEmpty(foundUser)) {
        return res.status(404).json({ 
            status: 404,
            serverMsg: 'Could not find user with this email address.'
        });
    }

    let mailOptions = {
        from: GMAIL,
        bcc: req.params.email,
        subject: req.body.subject,
        html: !req.body.html ? `<a href="http://localhost:8080/reset_password?user_email=${req.params.email}" target="_blank">Click here to reset password</a>`: req.body.html,
    }

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