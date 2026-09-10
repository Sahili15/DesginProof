import { User, Brand } from '../models/index.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, brandName, websiteUrl } = req.body;

        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ status: 'fail', message: 'User already exists' });
        }

        // Split name into first/last
        const nameParts = (name || '').split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            email,
            password_hash: password, // The model hook handles hashing
            role: 'client'
        });

        // Create Brand automatically with a fallback name
        const finalBrandName = brandName || `${firstName}'s Brand`;
        await Brand.create({
            owner_id: user.id,
            name: finalBrandName,
            website_url: websiteUrl || ''
        });

        if (user) {
            res.status(201).json({
                status: 'success',
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user.id),
            });
        }
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            res.json({
                status: 'success',
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Brand, as: 'brands' }]
        });
        const userData = user.toJSON();
        userData.name = `${user.first_name} ${user.last_name}`.trim();
        res.json({ status: 'success', user: userData });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
