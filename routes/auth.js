const router = require('express').Router();
const AuthController = require('../controllers/auth');
const checkAuth = require('../middleware/checkAuth');

//! @route    POST api/auth/register
//! @desc     Register user
//! @access   Public
router.post('/register', AuthController.register);

//! @route    POST api/auth/login
//! @desc     Login user
//! @access   Public
router.post('/login', AuthController.login);

//! @route    GET api/auth/load_user
//! @desc     Load user
//! @access   Private
router.get('/load_user', checkAuth, AuthController.loadUser);

//! @route    PUT api/auth/logout
//! @desc     Logout user
//! @access   Private
router.put('/logout', checkAuth, AuthController.logout);

module.exports = router;