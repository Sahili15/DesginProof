import { User, Brand, Product, Detection, SentNotice, AuditLog } from '../models/index.js';

// Get all users (Admin only)
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: [{ model: Brand, as: 'brands' }],
            order: [['created_at', 'DESC']]
        });
        
        return res.status(200).json({
            status: 'success',
            data: users.map(u => ({
                id: u.id,
                name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Admin User',
                email: u.email,
                role: u.role,
                is_active: u.is_active,
                is_verified: u.is_verified,
                createdAt: u.created_at,
                brandName: u.brands?.[0]?.name || 'N/A'
            }))
        });
    } catch (error) {
        next(error);
    }
};

// Update user status/role (Admin only)
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, is_active } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found.' });
        }

        if (role !== undefined) user.role = role;
        if (is_active !== undefined) user.is_active = is_active;
        await user.save();

        // Log audit action
        await AuditLog.create({
            user_id: req.user.id,
            action: 'ADMIN_UPDATE_USER',
            entity_type: 'user',
            entity_id: user.id,
            ip_address: req.ip,
            metadata: { updated_fields: { role, is_active } }
        });

        return res.status(200).json({
            status: 'success',
            message: 'User status successfully updated.',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Get Global Platform Stats (Admin only)
export const getPlatformStats = async (req, res, next) => {
    try {
        const totalUsers = await User.count();
        const totalBrands = await Brand.count();
        const totalProducts = await Product.count();
        const totalDetections = await Detection.count();
        
        // Count resolved detections
        const totalResolved = await Detection.count({ where: { is_removed: true } });
        
        // Count emails sent
        const totalEmails = await SentNotice.count();

        return res.status(200).json({
            status: 'success',
            data: {
                total_users: totalUsers,
                total_brands: totalBrands,
                total_products: totalProducts,
                total_detections: totalDetections,
                total_resolved: totalResolved,
                total_emails_sent: totalEmails,
                success_rate: totalDetections > 0 ? ((totalResolved / totalDetections) * 100).toFixed(1) + '%' : '100%'
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get Global Audit Logs (Admin only)
export const getAuditLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.findAll({
            include: [{ model: User, as: 'user' }],
            order: [['created_at', 'DESC']],
            limit: 100
        });

        return res.status(200).json({
            status: 'success',
            data: logs.map(l => ({
                id: l.id,
                action: l.action,
                entity: l.entity_type,
                entityId: l.entity_id,
                ip: l.ip_address,
                timestamp: l.created_at,
                userName: l.user ? `${l.user.first_name || ''} ${l.user.last_name || ''}`.trim() : 'System'
            }))
        });
    } catch (error) {
        next(error);
    }
};

// Mock Legal Email Templates state storage
let currentTemplate = {
    subject: "URGENT: Legal Notice of Copyright Infringement - [InfringingDomain]",
    body: `Dear Website Administrator,

This is an official notice of copyright infringement regarding digital assets belonging to our client that are currently being utilized without authorization on your platform.

Infringing URL: [InfringingURL]
Original Asset: [OriginalURL]

Our automated brand protection system has verified that the content at the above-mentioned link is a direct reproduction of our proprietary designs. We request the immediate removal of all infringing digital assets from your servers within the next 48 hours to avoid further escalation.

Please confirm when the content has been removed.

Sincerely,
DesignProof Intellectual Property Protection Team`
};

export const getTemplate = async (req, res) => {
    return res.status(200).json({
        status: 'success',
        data: currentTemplate
    });
};

export const saveTemplate = async (req, res) => {
    const { subject, body } = req.body;
    if (subject) currentTemplate.subject = subject;
    if (body) currentTemplate.body = body;
    return res.status(200).json({
        status: 'success',
        message: 'Takedown template updated successfully.',
        data: currentTemplate
    });
};
