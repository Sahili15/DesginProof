import express from 'express';
import { Product, Brand } from '../models/index.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Get all products for user's brand
router.get('/', async (req, res, next) => {
    try {
        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand not found' });
        }
        const products = await Product.findAll({ where: { brand_id: brand.id }, order: [['created_at', 'DESC']] });
        return res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    } catch (e) {
        next(e);
    }
});

// Create product manually
router.post('/', async (req, res, next) => {
    try {
        const { name, sku, primary_image_url, priority } = req.body;
        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand not found' });
        }
        const newProduct = await Product.create({
            brand_id: brand.id,
            name,
            sku,
            primary_image_url,
            priority: priority || 'medium',
            protection_active: true
        });
        return res.status(201).json({
            status: 'success',
            data: newProduct
        });
    } catch (e) {
        next(e);
    }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand not found' });
        }
        const deleted = await Product.destroy({ where: { id, brand_id: brand.id } });
        if (!deleted) {
            return res.status(404).json({ status: 'fail', message: 'Product not found or unauthorized' });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (e) {
        next(e);
    }
});

export default router;
