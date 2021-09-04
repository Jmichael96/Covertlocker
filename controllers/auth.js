const User = require('../models/User');
const { isEmpty } = require('jvh-is-empty');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//! @route    POST api/auth/register
//! @desc     Register user
//! @access   Public
exports.register = async (req, res, next) => {
    console.log('register()')
    console.log(req.body)
    if (isEmpty(req.body.email) || isEmpty(req.body.name) || isEmpty(req.body.password) || isEmpty(req.body.question) || isEmpty(req.body.answer)) {
        return res.status(406).json({
            serverMsg: 'Please enter the required information'
        });
    }

    let foundUser = await User.findOne({ email: req.body.email });
    if (!isEmpty(foundUser)) {
        return res.status(401).json({
            serverMsg: 'User already exists'
        });
    }

    await bcrypt.hash(req.body.password, 15).then(async (hash) => {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            security: {
                question: req.body.question,
                answer: req.body.answer
            }
        });

        await newUser.save().then(async (user) => {
            const payload = {
                user: {
                    _id: user._id,
                    name: user.name,
                }
            };
            await jwt.sign(payload, process.env.SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;

                return res.status(201).json({
                    serverMsg: 'Registered successfully',
                    token
                });
            });
        }).catch((err) => {
            res.status(500).json({
                serverMsg: 'Please try again later'
            });
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({
            serverMsg: 'Please try again later'
        });
    })
};

//! @route    POST api/auth/login
//! @desc     Login user
//! @access   Public
exports.login = async (req, res, next) => {
    if (isEmpty(req.body.email) || isEmpty(req.body.password)) {
        return res.status(403).json({
            serverMsg: 'Please enter the required information'
        });
    }
    let fetchedUser;

    User.findOne({ email: req.body.email })
        .then(async (user) => {
            if (!user) {
                return res.status(404).json({
                    serverMsg: 'User not found'
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        }).then(async (result) => {
            if (!result) {
                return res.status(401).json({
                    serverMsg: 'Invalid username or password'
                });
            }
            const payload = {
                user: {
                    _id: fetchedUser._id,
                    name: fetchedUser.name
                }
            };
            await jwt.sign(payload, process.env.SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;

                return res.status(201).json({
                    serverMsg: `Howdy, ${fetchedUser.name}`,
                    token
                });
            });
        }).catch((err) => {
            res.status(500).json({
                serverMsg: 'Please try again later'
            });
        });
};

//! @route    GET api/auth/load_user
//! @desc     Load user
//! @access   Private
exports.loadUser = (req, res, next) => {
    User.findById(req.user._id).select('-password').select('-email').select('-security.answer')
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    serverMsg: 'There is no user authorized'
                });
            }
            return res.status(200).json(user);
        })
        .catch((err) => {
            res.status(500).json({
                serverMsg: 'Load user server error'
            });
        });
};

//! @route    PUT api/auth/logout
//! @desc     Logout user
//! @access   Private
exports.logout = (req, res, next) => {
    User.findById({ _id: req.user._id })
        .then(async (user) => {
            // if a user doesnt exist
            if (!user) {
                return res.status(404).json({
                    serverMsg: 'No user found'
                });
            }
            // remove the auth header
            delete req.headers['x-auth-token'];
            return res.status(201).json({
                serverMsg: `Goodbye, ${user.firstName}`
            });
        }).catch((err) => {
            res.status(500).json({
                serverMsg: 'There was a problem completing this request. Please try again later'
            });
        });
};