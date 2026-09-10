import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: console.log, // Turn on logging to see what's happening
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('[OK] Database connected (PostgreSQL Connection Established).');

        // Set force: false to preserve data after initial UUID migration
        await sequelize.sync({ force: false, alter: true });
        console.log('[OK] Database synchronized (Persistence enabled).');
    } catch (error) {
        console.error('[ERR] Unable to connect to the PostgreSQL database:', error);
        console.warn('[WARN] Server running, but DB connection failed.');
    }
};

export default sequelize;
