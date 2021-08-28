const router = require('express').Router();
const path = require('path');

router.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/index.html'));
});

router.get('/account', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/account.html'));
});

router.get('/create', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/create_padlock.html'));
});

module.exports = router;