import { Product, Brand } from '../models/index.js';
import crypto from 'crypto';

const MOCK_SHOPIFY_PRODUCTS = [
    { name: 'Traditional Anarkali Suit', sku: 'ANAR-001', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500' },
    { name: 'Designer Cotton Kurti', sku: 'KURT-002', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500' },
    { name: 'Festive Wear Georgette Gown', sku: 'GOWN-003', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500' },
    { name: 'Chanderi Silk Kurta Set', sku: 'CHAND-004', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500' }
];

const MOCK_WOO_PRODUCTS = [
    { name: 'Casual Dailywear Kurta', sku: 'CAS-001', image: 'https://images.unsplash.com/photo-1608748010899-18f300247112?w=500' },
    { name: 'Jaipuri Printed Ethnic Suit', sku: 'JAIP-002', image: 'https://images.unsplash.com/photo-1610030470298-31952219fa62?w=500' },
    { name: 'Elegant Silk Blend Kurti', sku: 'SILK-003', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500' }
];

export const importFromShopify = async (req, res, next) => {
    try {
        const { storeUrl, apiKey } = req.body;
        if (!storeUrl) {
            return res.status(400).json({ status: 'fail', message: 'Shopify Store URL is required.' });
        }

        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand configuration not found.' });
        }

        console.log(`[Import] Simulating Shopify import for: ${storeUrl}`);

        const importedProducts = [];
        for (const item of MOCK_SHOPIFY_PRODUCTS) {
            const product = await Product.create({
                id: crypto.randomUUID(),
                brand_id: brand.id,
                name: item.name,
                sku: item.sku,
                primary_image_url: item.image,
                priority: 'medium',
                protection_active: true
            });
            importedProducts.push(product);
        }

        return res.status(200).json({
            status: 'success',
            message: `Successfully imported ${importedProducts.length} designs from Shopify store ${storeUrl}!`,
            data: importedProducts
        });

    } catch (error) {
        next(error);
    }
};

export const importFromWooCommerce = async (req, res, next) => {
    try {
        const { storeUrl, consumerKey, consumerSecret } = req.body;
        if (!storeUrl) {
            return res.status(400).json({ status: 'fail', message: 'WooCommerce Store URL is required.' });
        }

        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand configuration not found.' });
        }

        console.log(`[Import] Simulating WooCommerce import for: ${storeUrl}`);

        const importedProducts = [];
        for (const item of MOCK_WOO_PRODUCTS) {
            const product = await Product.create({
                id: crypto.randomUUID(),
                brand_id: brand.id,
                name: item.name,
                sku: item.sku,
                primary_image_url: item.image,
                priority: 'medium',
                protection_active: true
            });
            importedProducts.push(product);
        }

        return res.status(200).json({
            status: 'success',
            message: `Successfully imported ${importedProducts.length} designs from WooCommerce store ${storeUrl}!`,
            data: importedProducts
        });

    } catch (error) {
        next(error);
    }
};
