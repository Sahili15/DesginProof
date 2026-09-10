import express from 'express';
import { getSubscriptionStatus, checkoutSubscription } from '../controllers/billingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/subscription', getSubscriptionStatus);
router.post('/checkout', checkoutSubscription);

export default router;
