const User = require('../models/User');
const { isEmpty } = require('jvh-is-empty');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET);

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
                answer: cryptr.encrypt(req.body.answer)
            }
        });

        await newUser.save().then(async (user) => {
            const payload = {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    security: user.security
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
            console.log(result)
            if (!result) {
                return res.status(401).json({
                    status: 401,
                    serverMsg: 'Invalid username or password'
                });
            }
            const payload = {
                user: {
                    _id: fetchedUser._id,
                    name: fetchedUser.name,
                    email: fetchedUser.email,
                    security: fetchedUser.security
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
            console.log(err);
            res.status(500).json({
                serverMsg: 'There was a problem with the server. Please try again later.'
            });
        });
};

//! @route    GET api/auth/load_user
//! @desc     Load user
//! @access   Private
exports.loadUser = (req, res, next) => {
    User.findById(req.user._id).select('-password').select('-security.answer')
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

//! @route    PUT api/auth/check_security
//! @desc     Submit security answer for user authentication validation
//! @access   Private
exports.checkSecurity = async (req, res, next) => {
    User.findById({ _id: req.user._id })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    serverMsg: 'Could not find the user'
                });
            }
            let dbQuestion = user.security.question;
            let dbAnswer = cryptr.decrypt(user.security.answer);

            if (dbQuestion !== req.body.question || dbAnswer !== req.body.answer) {
                return res.status(401).json({
                    status: 401,
                    serverMsg: 'Your answer is incorrect. Please try again later.'
                });
            } else {
                return res.status(200).json({
                    serverMsg: 'Question answered successfully'
                });
            }
        }).catch((err) => {
            res.status(500).json({
                serverMsg: 'There was a problem completing this request. Please try again later'
            });
        });
};

//! @route    PUT api/auth/update_name/:id
//! @desc     Update user's name
//! @access   Private
exports.updateName = async (req, res, next) => {
    if (req.params.id !== req.user._id) {
        return res.status(401).json({
            status: 401,
            serverMsg: 'You are not authorized'
        });
    }
    const newName = {
        name: req.body.name
    };

    User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: newName },
        { new: true, upsert: true }
    ).then((user) => {
        if (!user) {
            return res.status(404).json({
                status: 404,
                serverMsg: 'Could not find the user you were looking for'
            });
        }
        return res.status(200).json({
            serverMsg: 'Your name has been updated successfully',
            user
        });
    }).catch((err) => {
        res.status(500).json({
            serverMsg: 'There was a problem completing this request. Please try again later'
        });
    });
};

//! @route    PUT api/auth/update_email/:id
//! @desc     Update user's email
//! @access   Private
exports.updateEmail = async (req, res, next) => {
    if (req.params.id !== req.user._id) {
        return res.status(401).json({
            status: 401,
            serverMsg: 'You are not authorized'
        });
    }
    const newEmail = {
        email: req.body.email
    };
    User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: newEmail },
        { new: true, upsert: true }
    ).then((user) => {
        if (!user) {
            return res.status(404).json({
                status: 404,
                serverMsg: 'Could not find the user you were looking for'
            });
        }
        return res.status(200).json({
            serverMsg: 'Your email has been updated successfully',
            user
        });
    }).catch((err) => {
        res.status(500).json({
            serverMsg: 'There was a problem completing this request. Please try again later'
        });
    });
};

//! @route    PUT api/auth/change_security/:id
//! @desc     Change the users security questions
//! @access   Private
exports.changeSecurity = async (req, res, next) => {
    if (req.params.id !== req.user._id) {
        return res.status(401).json({
            status: 401,
            serverMsg: 'You are not authorized'
        });
    }

    const newSecurity = {
        security: {
            question: req.body.security.question,
            answer: cryptr.encrypt(req.body.security.answer)
        }
    };

    User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: newSecurity },
        { new: true, upsert: true }
    ).then((user) => {
        if (!user) {
            return res.status(404).json({
                status: 404,
                serverMsg: 'Could not find the user you were looking for'
            });
        }
        return res.status(200).json({
            serverMsg: 'Your security question has been change.',
            user
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({
            serverMsg: 'There was a problem completing this request. Please try again later'
        });
    });
};

//! @route    PUT api/auth/change_password/:id
//! @desc     Change the users password
//! @access   Private
exports.changePassword = async (req, res, next) => {
    if (req.params.id !== req.user._id) {
        return res.status(401).json({
            status: 401,
            serverMsg: 'You are not authorized'
        });
    }
    await bcrypt.hash(req.body.password, 15).then(async (hash) => {

        const newPassword = {
            password: hash
        };

        User.findOneAndUpdate(
            { _id: req.params.id },
            { $set: newPassword },
            { new: true, upsert: true }
        ).then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    serverMsg: 'Could not find the user you were looking for'
                });
            }
            return res.status(200).json({
                serverMsg: 'Updated your password successfully.',
                user
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                serverMsg: 'There was a problem completing this request. Please try again later'
            });
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({
            serverMsg: 'Please try again later'
        });
    });
};

//! @route    PUT api/auth/reset_password/:email
//! @desc     Resets the user password 
//! @access   Public
exports.resetPassword = async (req, res, next) => {
    await bcrypt.hash(req.body.password, 15).then(async (hash) => {

        const newPassword = {
            password: hash
        };

        User.findOneAndUpdate(
            { email: req.params.email },
            { $set: newPassword },
            { new: true, upsert: true }
        ).then((user) => {
            if (isEmpty(user)) {
                return res.status(404).json({
                    status: 404,
                    serverMsg: 'Could not find the user you were looking for'
                });
            }
            return res.status(200).json({
                serverMsg: 'Your password has been reset',
                user
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                serverMsg: 'There was a problem completing this request. Please try again later'
            });
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({
            serverMsg: 'Please try again later'
        });
    });
};