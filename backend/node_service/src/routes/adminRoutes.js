import express from 'express';
import { getUsers, updateUser, getPlatformStats, getAuditLogs, getTemplate, saveTemplate } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Secure all endpoints for Admin only

router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/stats', getPlatformStats);
router.get('/audit-logs', getAuditLogs);
router.get('/template', getTemplate);
router.post('/template', saveTemplate);

export default router;
