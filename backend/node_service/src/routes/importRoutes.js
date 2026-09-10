import express from 'express';
import { importFromShopify, importFromWooCommerce } from '../controllers/importController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/shopify', protect, importFromShopify);
router.post('/woocommerce', protect, importFromWooCommerce);

export default router;
