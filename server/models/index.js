const { Sequelize } = require('sequelize');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let sequelize;

console.log('DEBUG: Checking DATABASE_URL...');
if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL.trim().replace(/^['"]+|['"]+$/g, '');
    console.log('DEBUG: DATABASE_URL is set:', url.substring(0, 20) + '...');
    try {
        sequelize = new Sequelize(url, {
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
        console.log('DEBUG: Sequelize initialized with Postgres dialect.');
    } catch (e) {
        console.error('DEBUG: Error initializing Sequelize with Postgres:', e);
    }
} else {
    console.log('DEBUG: DATABASE_URL is NOT set. Falling back to SQLite.');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'database.sqlite'),
        logging: false
    });
}

const Professional = require('./professional.model')(sequelize);
const Service = require('./service.model')(sequelize);
const Product = require('./product.model')(sequelize);
const Sale = require('./sale.model')(sequelize);
const User = require('./user.model')(sequelize);
const Transaction = require('./transaction.model')(sequelize);
const VaultTransaction = require('./vault_transaction.model')(sequelize);

// Relationships
Sale.belongsTo(Professional, { foreignKey: 'professional_id' });

module.exports = {
    sequelize,
    Professional,
    Service,
    Product,
    Sale,
    User,
    Transaction,
    VaultTransaction
};
