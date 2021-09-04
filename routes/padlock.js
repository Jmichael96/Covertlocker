const router = require('express').Router();
const checkAuth = require('../middleware/checkAuth');
const PadlockController = require('../controllers/padlock');

//! @route    POST api/padlock/create
//! @desc     Create a padlock
//! @access   Private
router.post('/create', checkAuth, PadlockController.createPadlock);

//! @route    GET api/padlock/fetch
//! @desc     Fetch the padlocks
//! @access   Private
router.get('/fetch', checkAuth, PadlockController.fetchPadlocks);

module.exports = router;