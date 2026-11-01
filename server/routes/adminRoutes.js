const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Every admin route requires a valid login AND the admin role
router.use(protect, adminOnly);

router.get('/dashboard', c.getDashboard);
router.get('/users', c.getUsers);
router.delete('/users/:id', c.deleteUser);
router.get('/items', c.getAllItems);
router.put('/items/:id/status', c.updateItemStatus);
router.delete('/items/:id', c.deleteItem);

module.exports = router;
