import express from 'express';
import { getVerificationToken, verifyDomain } from '../controllers/verificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/token', protect, getVerificationToken);
router.post('/', protect, verifyDomain);

export default router;
