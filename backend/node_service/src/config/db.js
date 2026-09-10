import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.DATABASE_URL.includes('localhost') ? {} : {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    })
    : new Sequelize(
        process.env.DB_NAME || 'designproof_db',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'root',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false,
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
