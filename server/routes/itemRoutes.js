const router = require('express').Router();
const c = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadItemImage } = require('../middleware/upload');

router.get('/', optionalAuth, c.getItems);
router.post('/', protect, uploadItemImage, c.createItem);

// IMPORTANT: "/my-listings" must be declared BEFORE "/:id", otherwise Express treats "my-listings" as an id
router.get('/my-listings', protect, c.getMyListings);

router.get('/:id', optionalAuth, c.getItemById);
router.put('/:id', protect, uploadItemImage, c.updateItem);
router.delete('/:id', protect, c.deleteItem);

module.exports = router;
