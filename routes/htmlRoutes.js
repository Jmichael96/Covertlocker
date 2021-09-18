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

router.get('/padlock', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/padlock.html'));
});

router.get('/update', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/update.html'));
});

router.get('/security', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/security.html'));
});

router.get('/password', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/password.html'));
});

router.get('/reset_password', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/reset_password.html'));
});

router.get('/dev_contact', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../app/dev_contact.html'));
});

module.exports = router;