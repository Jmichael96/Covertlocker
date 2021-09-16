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

//! @route    DELETE api/padlock/delete/:id
//! @desc     Delete a padlock
//! @access   Private
router.delete('/delete/:id', checkAuth, PadlockController.deletePadlock);

//! @route    GET api/padlock/fetch_padlock/:id
//! @desc     Fetch a single padlock
//! @access   Private
router.get('/fetch_padlock/:id', checkAuth, PadlockController.fetchPadlock);

//! @route    PUT api/padlock/update/:id
//! @desc     Update a padlock
//! @access   Private
router.put('/update/:id', checkAuth, PadlockController.updatePadlock);

module.exports = router;