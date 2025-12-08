const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function verify() {
    console.log('🔍 Verifying data in Supabase...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing');
        return;
    }

    // Sanitize URL
    const url = process.env.DATABASE_URL.trim().replace(/^['"]+|['"]+$/g, '');
    console.log('Connecting to:', url.split('@')[1]); // Log only host for safety

    const sequelize = new Sequelize(url, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connection successful.');

        const [results] = await sequelize.query('SELECT count(*) FROM "Users";');
        console.log('📊 Users count:', results[0].count);

        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('📑 Tables found:', tables.map(t => t.table_name));

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await sequelize.close();
    }
}

verify();
