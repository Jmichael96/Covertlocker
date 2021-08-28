const Padlock = require('../models/Padlock');
const { isEmpty } = require('jvh-is-empty');
const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET);

//! @route    POST api/padlock/create
//! @desc     Create a padlock
//! @access   Private
exports.createPadlock = async (req, res, next) => {
    if (isEmpty(req.user)) {
        return res.status(406).json({
            serverMsg: 'User is not authorized'
        });
    }

    if (isEmpty(req.body.title) || isEmpty(req.body.username) || isEmpty(req.body.password)) {
        return res.status(403).json({
            serverMsg: 'Please fill the required fields'
        });
    }
    const newPadlock = new Padlock({
        userId: req.user._id,
        title: req.body.title,
        username: cryptr.encrypt(req.body.username),
        password: cryptr.encrypt(req.body.password),
        notes: req.body.notes
    });

    await newPadlock.save().then((padlock) => {
        res.status(201).json({
            serverMsg: 'Your padlock was created'
        });
    }).catch((err) => {
        res.status(500).json({
            serverMsg: 'There was a problem completing your request. Please try again later'
        });
    });
    // await bcrypt.hash(req.body.password, 15).then(async (hash) => {
    //     const newPadlock = new Padlock({
    //         userId: req.user._id,
    //         title: req.body.title,
    //         username: req.body.username,
    //         password: hash,
    //         notes: req.body.notes
    //     });

    //     await newPadlock.save().then((padlock) => {
    //         res.status(201).json({
    //             serverMsg: 'Your padlock was created',
    //             padlock
    //         });
    //     }).catch((err) => {
    //         res.status(500).json({
    //             serverMsg: 'There was a problem completing your request. Please try again later'
    //         });
    //     });
    // }).catch((err) => {
    //     res.status(500).json({
    //         serverMsg: 'There was a problem'
    //     });
    // });
};

//! @route    GET api/padlock/fetch
//! @desc     Fetch the padlocks
//! @access   Private
exports.fetchPadlocks = async (req, res, next) => {

};
