const Folder = require('../models/Folder');
const { isEmpty } = require('jvh-is-empty');
const Padlock = require('../models/Padlock');

//! @route    POST api/folder/create
//! @desc     Create a folder
//! @access   Private
exports.createFolder = async (req, res, next) => {
    console.log(req.body)
    if (isEmpty(req.body.folderName)) {
        return res.status(406).json({
            serverMsg: 'Please enter a folder name'
        });
    }

    // next check if folder already exists
    let foundFolder = await Folder.findOne({ folderName: req.body.folderName });

    if (foundFolder) {
        return res.status(406).json({
            status: 406,
            serverMsg: 'Folder already exists'
        });
    }

    const newFolder = new Folder({
        userId: req.user._id,
        folderName: req.body.folderName
    });

    await newFolder.save().then(async (folder) => {
        console.log(folder);
        res.status(201).json({
            serverMsg: 'Created folder successfully',
            folder
        });
    }).catch((err) => {
        res.status(500).json({
            serverMsg: 'There was a problem completing your request. Please try again later'
        });
    });
};

//! @route    GET api/folder/fetch
//! @desc     Fetch folders
//! @access   Private
exports.fetchFolders = async (req, res, next) => {
    await Folder.find({ userId: req.user._id }).sort({ date: -1 }).then((folders) => {
        if (isEmpty(folders)) {
            return res.status(404).json({
                status: 404,
                // serverMsg: 'You don\'t have any folders created'
            });
        }
        res.status(200).json(folders);
    }).catch((err) => {
        res.status(500).json({
            serverMsg: 'There was a problem completing your request. Please try again later'
        });
    })
};

//! @route    DELETE api/folder/delete/:folderName
//! @desc     Delete a folder
//! @access   Private
exports.deleteFolder = async (req, res, next) => {
    await Folder.findOneAndDelete({ folderName: req.params.folderName })
    .then(async (deletedFolder) => {
            let padlockIdArr = [];
            let parsedPadlocks = JSON.parse(req.query.padlocks);

            if (!deletedFolder) {
                return res.status(404).json({
                    status: 404,
                    serverMsg: 'Could not find the folder you wanted to delete'
                });
            }

            if (parsedPadlocks.length >= 1) {
                for (let pl of JSON.parse(req.query.padlocks)) {
                    padlockIdArr.push(pl._id);
                }
                await Padlock.deleteMany({
                    _id: {
                        $in: padlockIdArr
                    }
                }).then((response) => {
                    next();
                }).catch((err) => {
                    return res.status(500).json({
                        serverMsg: 'There was a problem deleting the padlocks. Please try again later'
                    });
                });
            }

            return res.status(200).json({
                serverMsg: `Deleted your ${deletedFolder.folderName} folder successfully`,
                folderName: deletedFolder.folderName
            });
        }).catch((err) => {
            res.status(500).json({
                serverMsg: 'There was a problem completing your request. Please try again later'
            });
        });
};