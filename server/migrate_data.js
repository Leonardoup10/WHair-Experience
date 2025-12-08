const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'migration_full.log');
// Clear log
fs.writeFileSync(logFile, '');

const log = (msg) => {
    // try to convert object to string if needed
    if (typeof msg !== 'string') msg = JSON.stringify(msg, null, 2);
    // write to stdout
    process.stdout.write(msg + '\n');
    // append to file
    fs.appendFileSync(logFile, msg + '\n');
};
const error = (msg) => {
    if (msg instanceof Error) {
        msg = '[ERROR OBJECT] ' + msg.message + '\n' + msg.stack;
    } else if (typeof msg !== 'string') {
        msg = JSON.stringify(msg, null, 2);
    }
    process.stderr.write(msg + '\n');
    fs.appendFileSync(logFile, '[ERROR] ' + msg + '\n');
};

console.log = log;
console.error = error;
// Models will be required dynamically after .env load
// const { sequelize, User, Professional, Service, Product, Sale, Transaction, VaultTransaction } = require('./models');

// Connect to the OLD SQLite database
const sqliteDbPath = path.join(__dirname, 'database_v2.sqlite');
const db = new sqlite3.Database(sqliteDbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
        process.exit(1);
    }
    console.log('Connected to source SQLite database:', sqliteDbPath);
});

async function migrate() {
    let sequelize;
    try {
        // ... (env loading) ...

        const envPath = path.join(__dirname, '.env');
        const result = require('dotenv').config({ path: envPath });

        if (result.error) {
            console.error('❌ Error loading .env file:', result.error.message);
            console.log('Ensure .env exists in:', envPath);
        } else {
            console.log('✅ .env loaded from:', envPath);
            // Sanitize DATABASE_URL immediately
            if (process.env.DATABASE_URL) {
                process.env.DATABASE_URL = process.env.DATABASE_URL.trim().replace(/^['"]+|['"]+$/g, '');
            }
            console.log('🔑 Found keys in .env:', Object.keys(result.parsed || {}));


            // Debug raw content header
            const fs = require('fs');
            try {
                const raw = fs.readFileSync(envPath, 'utf8');
                console.log('📄 Raw header (first 50 chars):', raw.substring(0, 50).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
            } catch (e) { }
        }

        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL is missing! Migration aborted to prevent writing to local SQLite.');
            process.exit(1);
        }

        // Re-import models to pick up the new env var
        const models = require('./models.js');
        sequelize = models.sequelize;
        const { User, Professional, Service, Product, Sale, Transaction, VaultTransaction } = models;

        await sequelize.authenticate();
        const config = sequelize.connectionManager.config;
        console.log(`✅ Connected to TARGET DB: ${config.database} on ${config.host} (${sequelize.getDialect()})`);

        if (sequelize.getDialect() !== 'postgres') {
            console.error('❌ Connected to SQLite! Aborting migration to Supabase.');
            process.exit(1);
        }

        // Optional: Force sync to ensure tables exist (and maybe clear them?)
        // WARNING: This clears the Supabase DB to ensure clean import of IDs
        console.log('Syncing/Clearing Supabase tables...');
        await sequelize.sync({ force: true });
        console.log('Tables recreated.');

        // Helper to get data from SQLite
        const getAll = (table) => {
            return new Promise((resolve, reject) => {
                db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        };

        // --- MIGRATION SEQUENCE (Order matches foreign key deps) ---

        // 1. Users
        console.log('Migrating Users...');
        const users = await getAll('Users');
        if (users.length > 0) {
            console.log(`Migrating Users... (${users.length} records)`);
            const mappedUsers = users.map(u => {
                let role = u.role ? u.role.toUpperCase() : 'RECEPTION';
                if (role === 'RECEPÇÃO' || role === 'RECEPCAO') role = 'RECEPTION';
                if (role === 'GERENTE') role = 'MANAGER';
                if (role === 'ADMINISTRADOR') role = 'ADMIN';

                if (!['ADMIN', 'MANAGER', 'RECEPTION'].includes(role)) {
                    console.warn(`WARNING: Unknown role "${role}" mapped to RECEPTION`);
                    role = 'RECEPTION';
                }
                return { ...u, role };
            });
            await User.bulkCreate(mappedUsers);
        }
        console.log(`Migrated ${users.length} Users.`);

        // 2. Professionals
        console.log('Migrating Professionals...');
        const professionals = await getAll('Professionals');
        if (professionals.length > 0) {
            await Professional.bulkCreate(professionals);
        }
        console.log(`Migrated ${professionals.length} Professionals.`);

        // 3. Services
        console.log('Migrating Services...');
        const services = await getAll('Services');
        if (services.length > 0) {
            await Service.bulkCreate(services);
        }
        console.log(`Migrated ${services.length} Services.`);

        // 4. Products
        console.log('Migrating Products...');
        const products = await getAll('Products');
        if (products.length > 0) {
            await Product.bulkCreate(products);
        }
        console.log(`Migrated ${products.length} Products.`);

        // 5. Sales
        console.log('Migrating Sales...');
        const sales = await getAll('Sales');
        if (sales.length > 0) {
            await Sale.bulkCreate(sales);
        }
        console.log(`Migrated ${sales.length} Sales.`);

        // 6. Transactions
        console.log('Migrating Transactions...');
        const transactions = await getAll('Transactions');
        if (transactions.length > 0) {
            await Transaction.bulkCreate(transactions);
        }
        console.log(`Migrated ${transactions.length} Transactions.`);

        // 7. VaultTransactions
        console.log('Migrating VaultTransactions...');
        // Check if table exists in SQLite (might be new)
        try {
            const vault = await getAll('VaultTransactions');
            if (vault.length > 0) {
                // Determine model availability (if exported)
                // Assuming VaultTransaction model is available in models/index.js
                // If not, we might need to skip or handle specifically. 
                // Based on previous reads, VaultTransaction IS in models.js but might not be exported in index.js?
                // Let's check imports above. I added VaultTransaction to require.
                const { VaultTransaction } = require('./models');
                if (VaultTransaction) {
                    await VaultTransaction.bulkCreate(vault);
                    console.log(`Migrated ${vault.length} VaultTransactions.`);
                } else {
                    console.log('VaultTransaction model not found, skipping.');
                }
            }
        } catch (e) {
            console.log('VaultTransactions table not found in SQLite or error:', e.message);
        }

        console.log('✅ Migration COMPLETED successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, 'error_summary.txt'),
            '[ERROR MESSAGE]\n' + error.message + '\n\n[STACK]\n' + error.stack
        );
    } finally {
        db.close();
        if (sequelize) await sequelize.close();
    }
}

migrate();
