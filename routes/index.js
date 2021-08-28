const router = require('express').Router();
const htmlRoutes = require('./htmlRoutes');
const auth = require('./auth');
const padlock = require('./padlock');

router.use(htmlRoutes);
router.use('/api/auth', auth);
router.use('/api/padlock', padlock);

module.exports = router;