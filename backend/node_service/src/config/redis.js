import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient({
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis Client Connected'));

await client.connect();

export default client;
