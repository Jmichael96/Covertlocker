const router = require('express').Router();
const checkAuth = require('../middleware/checkAuth');
const FolderController = require('../controllers/folder');

//! @route    POST api/folder/create
//! @desc     Create a folder
//! @access   Private
router.post('/create', checkAuth, FolderController.createFolder);

//! @route    GET api/folder/fetch
//! @desc     Fetch folders
//! @access   Private
router.get('/fetch', checkAuth, FolderController.fetchFolders);

//! @route    DELETE api/folder/delete/:folderName
//! @desc     Delete a folder
//! @access   Private
router.delete('/delete/:folderName', checkAuth, FolderController.deleteFolder);

module.exports = router;