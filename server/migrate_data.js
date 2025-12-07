const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { sequelize, User, Professional, Service, Product, Sale, Transaction, VaultTransaction } = require('./models');

// Connect to the OLD SQLite database
const sqliteDbPath = path.join(__dirname, 'database_v2.sqlite');
const db = new sqlite3.Database(sqliteDbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

async function migrate() {
    try {
        // 1. Authenticate with Postgres (Supabase) via Sequelize
        await sequelize.authenticate();
        console.log('Connected to Supabase (Postgres).');

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
            await User.bulkCreate(users);
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
    } finally {
        db.close();
        await sequelize.close();
    }
}

migrate();
