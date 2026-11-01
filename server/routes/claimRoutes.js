const router = require('express').Router();
const c = require('../controllers/claimController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, c.createClaim);
router.get('/my-claims', protect, c.getMyClaims);
router.get('/', protect, adminOnly, c.getAllClaims);
router.put('/:id/status', protect, adminOnly, c.updateClaimStatus);

module.exports = router;
