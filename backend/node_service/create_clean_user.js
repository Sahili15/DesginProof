import { User, Brand } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function createCleanUser() {
    try {
        const email = 'gaurkhedesahili@gmail.com';
        console.log("Creating user Sahili...");
        const user = await User.create({
            first_name: 'Sahili',
            last_name: 'Gaurkhede',
            email,
            password_hash: 'password',
            role: 'client',
            is_verified: true,
            is_active: true
        });
        await Brand.create({
            owner_id: user.id,
            name: 'Gaurkhede Brand',
            website_url: 'https://gaurkhede.designproof.ai',
            is_verified: true
        });
        console.log("User Sahili Gaurkhede created successfully with password 'password'!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createCleanUser();
