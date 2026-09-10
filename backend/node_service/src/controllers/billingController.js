import { Subscription, Brand } from '../models/index.js';
import crypto from 'crypto';

export const getSubscriptionStatus = async (req, res, next) => {
    try {
        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand configuration not found.' });
        }

        let sub = await Subscription.findOne({ where: { brand_id: brand.id } });
        if (!sub) {
            // Create a default free tier subscription if missing
            sub = await Subscription.create({
                id: crypto.randomUUID(),
                brand_id: brand.id,
                plan_id: '00000000-0000-0000-0000-000000000000', // Free Plan ID placeholder
                status: 'active',
                billing_period: 'monthly',
                started_at: new Date(),
                renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });
        }

        // Map plan IDs to readable names and scan credits
        const plansMapping = {
            '00000000-0000-0000-0000-000000000000': { name: 'Free Tier', credits: 50, price: '$0' },
            '11111111-1111-1111-1111-111111111111': { name: 'Growth Plan', credits: 500, price: '$49/mo' },
            '22222222-2222-2222-2222-222222222222': { name: 'Scale Plan', credits: 2500, price: '$149/mo' },
            '33333333-3333-3333-3333-333333333333': { name: 'Enterprise Plan', credits: 10000, price: '$499/mo' }
        };

        const planDetails = plansMapping[sub.plan_id] || { name: 'Custom Tier', credits: 100, price: 'Custom' };

        return res.status(200).json({
            status: 'success',
            data: {
                id: sub.id,
                planName: planDetails.name,
                planPrice: planDetails.price,
                status: sub.status,
                billingPeriod: sub.billing_period,
                startedAt: sub.started_at,
                renewsAt: sub.renews_at,
                scanCreditsUsed: 12, // simulated usage
                scanCreditsTotal: planDetails.credits
            }
        });
    } catch (error) {
        next(error);
    }
};

export const checkoutSubscription = async (req, res, next) => {
    try {
        const { planId } = req.body;
        if (!planId) {
            return res.status(400).json({ status: 'fail', message: 'planId is required.' });
        }

        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) {
            return res.status(404).json({ status: 'fail', message: 'Brand configuration not found.' });
        }

        let sub = await Subscription.findOne({ where: { brand_id: brand.id } });
        if (!sub) {
            sub = await Subscription.create({
                id: crypto.randomUUID(),
                brand_id: brand.id,
                plan_id: planId,
                status: 'active',
                billing_period: 'monthly',
                started_at: new Date(),
                renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
        } else {
            sub.plan_id = planId;
            sub.started_at = new Date();
            sub.renews_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await sub.save();
        }

        return res.status(200).json({
            status: 'success',
            message: 'Stripe Mock checkout session completed successfully! Subscription upgraded.',
            data: sub
        });
    } catch (error) {
        next(error);
    }
};
