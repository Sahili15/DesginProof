import express from 'express';
import { sendLegalNotice } from '../controllers/noticeController.js';

const router = express.Router();

// POST /api/send-legal-notice
router.post('/', sendLegalNotice);

export default router;
