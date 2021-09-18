const Message = require('../models/Message');
const { isEmpty } = require('jvh-is-empty');
const vonage = require('../middleware/vonage');

//! @route    POS api/message/create
//! @desc     Create a message
//! @access   Private
exports.createMessage = async (req, res, next) => {
    const newMessage = new Message({
        name: req.user.name,
        messageType: req.body.messageType,
        message: req.body.message,
    });

    await newMessage.save().then(async (message) => {
        let formattedMsg = "Hello how are you?" 

        vonage('18773818296', process.env.MY_PHONE, formattedMsg);
        res.status(201).json({
            serverMsg: `Thank you, ${message.name}. Your feedback has been received`,
        });
    }).catch((err) => {
        res.status(500).json({
            serverMsg: 'There was a problem completing this request. Please try again later.'
        });
    });
};  