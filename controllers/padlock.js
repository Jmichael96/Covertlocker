const Padlock = require('../models/Padlock');
const { isEmpty } = require('jvh-is-empty');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET);
const User = require('../models/User');
const Folder = require('../models/Folder');

//! @route    POST api/padlock/create
//! @desc     Create a padlock
//! @access   Private
exports.createPadlock = async (req, res, next) => {
    if (isEmpty(req.user)) {
        return res.status(401).json({
            serverMsg: 'User is not authorized'
        });
    }

    if (isEmpty(req.body.title) || isEmpty(req.body.username) || isEmpty(req.body.password)) {
        return res.status(406).json({
            serverMsg: 'Please fill the required fields'
        });
    }
    const newPadlock = new Padlock({
        userId: req.user._id,
        title: req.body.title,
        username: cryptr.encrypt(req.body.username),
        password: cryptr.encrypt(req.body.password),
        notes: req.body.notes,
        folder: req.body.folder,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await newPadlock.save().then((padlock) => {
        res.status(201).json({
            serverMsg: 'Your padlock was created'
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({
            serverMsg: 'There was a problem completing your request. Please try again later'
        });
    });
};

//! @route    GET api/padlock/fetch
//! @desc     Fetch the padlocks
//! @access   Private
exports.fetchPadlocks = async (req, res, next) => {

    await Padlock.find({ userId: req.user._id }).sort({ date: -1 })
        .then((padlocks) => {
            if (isEmpty(padlocks)) {
                return res.status(404).json({
                    status: 404,
                });
            }
            let formattedPadlockArr = [];
            for (let pl of padlocks) {
                formattedPadlockArr.push({
                    updatedAt: pl.updatedAt,
                    createdAt: pl.createdAt,
                    folder: pl.folder,
                    notes: pl.notes,
                    title: pl.title,
                    username: cryptr.decrypt(pl.username),
                    password: cryptr.decrypt(pl.password),
                    userId: pl.userId,
                    _id: pl._id
                });
            }
            return res.status(200).json(formattedPadlockArr);
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({
                serverMsg: 'There was a problem completing your request. Please try again later'
            });
        });
};

//! @route    DELETE api/padlock/delete/:id
//! @desc     Delete a padlock
//! @access   Private
exports.deletePadlock = async (req, res, next) => {
    await Padlock.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        .then((padlock) => {
            if (!padlock) {
                return res.status(404).json({
                    status: 404,
                    serverMsg: 'Could not find the padlock you were looking for'
                });
            }
            return res.status(200).json({
                serverMsg: `Deleted your ${padlock.name} padlock successfully`,
                padlockId: padlock._id
            });
        }).catch((err) => {
            return res.status(500).json({
                serverMsg: 'There was a problem completing your request. Please try again later'
            });
        });
};

//! @route    GET api/padlock/fetch_padlock/:id
//! @desc     Fetch a single padlock
//! @access   Private
exports.fetchPadlock = async (req, res, next) => {
    await Padlock.findById({ _id: req.params.id })
        .then((padlock) => {
            if (isEmpty(padlock)) {
                return res.status(404).json({
                    status: 404,
                    serverMsg: 'Could not find the padlock you were looking for'
                });
            }
            return res.status(200).json({
                updatedAt: padlock.updatedAt,
                createdAt: padlock.createdAt,
                folder: padlock.folder,
                notes: padlock.notes,
                title: padlock.title,
                username: cryptr.decrypt(padlock.username),
                password: cryptr.decrypt(padlock.password),
                userId: padlock.userId,
                _id: padlock._id
            });
        }).catch((err) => {
            return res.status(500).json({
                serverMsg: 'There was a problem completing your request. Please try again later'
            });
        });
};

//! @route    PUT api/padlock/update/:id
//! @desc     Update a padlock
//! @access   Private
exports.updatePadlock = async (req, res, next) => {
    const padlockFields = {
        title: req.body.title,
        username: cryptr.encrypt(req.body.username),
        password: cryptr.encrypt(req.body.password),
        notes: req.body.notes,
        folder: req.body.folder,
        updatedAt: new Date()
    };

    Padlock.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: padlockFields },
        { new: true, upsert: true }
    ).then(async (padlock) => {
        if (isEmpty(padlock)) {
            return res.status(404).json({
                status: 404,
                serverMsg: 'Could not find the post you wanted to update.'
            });
        }
        await Folder.updateOne({ folderName: padlock.folder }, { updatedAt: padlock.updatedAt }).catch((err) => err);
        
        return res.status(200).json({
            serverMsg: 'Updated padlock successfully',
            padlock
        });
    }).catch((err) => {
        return res.status(500).json({
            serverMsg: 'There was a problem completing your request. Please try again later'
        });
    });
};