const router = require('express').Router();
const MessageController = require('../controllers/message');
const checkAuth = require('../middleware/checkAuth');

//! @route    POS api/message/create
//! @desc     Create a message
//! @access   Private
router.post('/create', checkAuth, MessageController.createMessage);

module.exports = router;