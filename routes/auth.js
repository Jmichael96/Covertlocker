const router = require('express').Router();
const AuthController = require('../controllers/auth');
const checkAuth = require('../middleware/checkAuth');
const nodemail = require('../middleware/nodemailer');

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

//! @route    PUT api/auth/check_security
//! @desc     Submit security answer for user authentication validation
//! @access   Private
router.put('/check_security', checkAuth, AuthController.checkSecurity);

//! @route    PUT api/auth/update_name/:id
//! @desc     Update user's name
//! @access   Private
router.put('/update_name/:id', checkAuth, AuthController.updateName);

//! @route    PUT api/auth/update_email/:id
//! @desc     Update user's email
//! @access   Private
router.put('/update_email/:id', checkAuth, AuthController.updateEmail);

//! @route    POST api/auth/init_change_security/:email
//! @desc     Initiate change users security questions by emailing confirmation to user
//! @access   Public
router.post('/init_change_security/:email', nodemail);

//! @route    PUT api/auth/change_security/:email/:id
//! @desc     Change the users security questions
//! @access   Public
router.put('/change_security/:email/:id', AuthController.changeSecurity);

//! @route    POST api/auth/init_change_security/:email
//! @desc     Initiate change users security questions by emailing confirmation to user
//! @access   Public
router.post('/init_change_password/:email', nodemail);

//! @route    PUT api/auth/change_password/:email/:id
//! @desc     Change the users password
//! @access   Public
router.put('/change_password/:email/:id', AuthController.changePassword);

//! @route    PUT api/auth/forgot_password/:email
//! @desc     Change the users password
//! @access   Public
router.put('/forgot_password/:email', nodemail);


module.exports = router;