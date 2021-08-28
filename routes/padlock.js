const router = require('express').Router();
const checkAuth = require('../middleware/checkAuth');
const PadlockController = require('../controllers/padlock');

//! @route    POST api/padlock/create
//! @desc     Create a padlock
//! @access   Private
router.post('/create', checkAuth, PadlockController.createPadlock);

module.exports = router;