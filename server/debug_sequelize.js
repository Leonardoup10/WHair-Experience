const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

const Professional = sequelize.define('Professional', {
    name: DataTypes.STRING,
    role: DataTypes.STRING,
    service_commission_rate: DataTypes.FLOAT,
    product_commission_rate: DataTypes.FLOAT
});

const Sale = sequelize.define('Sale', {
    professional_id: DataTypes.INTEGER,
    type: DataTypes.ENUM('SERVICE', 'PRODUCT'),
    item_id: DataTypes.INTEGER,
    sale_price: DataTypes.DECIMAL(10, 2),
    commission_amount: DataTypes.DECIMAL(10, 2),
    date: DataTypes.DATE,
    client_name: DataTypes.STRING,
    client_origin: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    tip_amount: DataTypes.DECIMAL(10, 2)
});

Sale.belongsTo(Professional, { foreignKey: 'professional_id' });
Professional.hasMany(Sale, { foreignKey: 'professional_id' });

async function test() {
    try {
        console.log('Fetching sales...');
        const sales = await Sale.findAll({
            include: [Professional],
            order: [['date', 'DESC']],
            limit: 10
        });
        console.log(`Success! Fetched ${sales.length} sales.`);
        console.log('First sale date:', sales[0].date);
        console.log('First sale date type:', typeof sales[0].date);
    } catch (error) {
        console.error('Error fetching sales:', error.message);
        console.error('Parent:', error.parent);
    }
}

test();
