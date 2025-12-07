const { Sequelize } = require('sequelize');

const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
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
} else {
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
