import { Whitelist, Brand } from '../models/index.js';

export const getWhitelistAndBlacklist = async (req, res, next) => {
    try {
        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand configuration not found.' });
        }

        const entries = await Whitelist.findAll({ where: { brand_id: brand.id } });

        return res.status(200).json({
            status: 'success',
            data: entries.map(e => ({
                id: e.id,
                domain: e.domain,
                type: e.type, // 'whitelist' or 'blacklist'
                createdAt: e.created_at
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const addDomainEntry = async (req, res, next) => {
    try {
        const { domain, type } = req.body;
        if (!domain || !type) {
            return res.status(400).json({ status: 'fail', message: 'domain and type are required.' });
        }

        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand configuration not found.' });
        }

        // Clean up domain format (extract hostname if user pasted a full URL)
        let cleanDomain = domain.trim().toLowerCase();
        try {
            if (/^https?:\/\//i.test(cleanDomain)) {
                cleanDomain = new URL(cleanDomain).hostname;
            }
            cleanDomain = cleanDomain.replace('www.', '');
        } catch (e) {}

        // Check if already exists
        const exists = await Whitelist.findOne({ where: { brand_id: brand.id, domain: cleanDomain, type } });
        if (exists) {
            return res.status(400).json({ status: 'fail', message: 'Domain already listed.' });
        }

        const entry = await Whitelist.create({
            brand_id: brand.id,
            domain: cleanDomain,
            type
        });

        return res.status(200).json({
            status: 'success',
            message: `Domain ${cleanDomain} successfully added to your ${type} list.`,
            data: entry
        });
    } catch (error) {
        next(error);
    }
};

export const deleteDomainEntry = async (req, res, next) => {
    try {
        const { id } = req.params;

        const entry = await Whitelist.findByPk(id);
        if (!entry) {
            return res.status(404).json({ status: 'fail', message: 'List entry not found.' });
        }

        // Verify ownership
        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand || entry.brand_id !== brand.id) {
            return res.status(403).json({ status: 'fail', message: 'Not authorized.' });
        }

        await entry.destroy();

        return res.status(200).json({
            status: 'success',
            message: 'Domain successfully removed from list.'
        });
    } catch (error) {
        next(error);
    }
};
