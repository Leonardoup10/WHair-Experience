const { Sequelize } = require('sequelize');

const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
});

const Professional = require('./professional.model')(sequelize);
const Service = require('./service.model')(sequelize);
const Product = require('./product.model')(sequelize);
const Sale = require('./sale.model')(sequelize);
const User = require('./user.model')(sequelize);

// Relationships
Sale.belongsTo(Professional, { foreignKey: 'professional_id' });

module.exports = {
    sequelize,
    Professional,
    Service,
    Product,
    Sale,
    User
};
