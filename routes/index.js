const router = require('express').Router();
const htmlRoutes = require('./htmlRoutes');
const auth = require('./auth');
const padlock = require('./padlock');
const folder = require('./folder');

router.use(htmlRoutes);
router.use('/api/auth', auth);
router.use('/api/padlock', padlock);
router.use('/api/folder', folder);

module.exports = router;