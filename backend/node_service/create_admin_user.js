import { User, Brand } from './src/models/index.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

async function createAdminUser() {
    try {
        const email = 'admin@designproof.ai';
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            console.log("Admin user already exists. Updating password to 'password' and setting role to 'admin'...");
            userExists.password_hash = 'password';
            userExists.role = 'admin';
            userExists.is_active = true;
            userExists.is_verified = true;
            await userExists.save();
        } else {
            console.log("Creating new Admin user...");
            const user = await User.create({
                first_name: 'System',
                last_name: 'Admin',
                email,
                password_hash: 'password',
                role: 'admin',
                is_active: true,
                is_verified: true
            });
            await Brand.create({
                id: crypto.randomUUID(),
                owner_id: user.id,
                name: 'DesignProof Admin Brand',
                website_url: 'https://admin.designproof.ai',
                is_verified: true
            });
            console.log("Admin user created successfully!");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createAdminUser();
