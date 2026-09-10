import express from 'express';
import { getWhitelistAndBlacklist, addDomainEntry, deleteDomainEntry } from '../controllers/whitelistController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWhitelistAndBlacklist);
router.post('/', addDomainEntry);
router.delete('/:id', deleteDomainEntry);

export default router;
