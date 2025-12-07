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
    commission_rate: DataTypes.FLOAT
});

const Service = sequelize.define('Service', {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    duration: DataTypes.INTEGER
});

async function check() {
    try {
        await sequelize.authenticate();
        const pros = await Professional.findAll();
        const services = await Service.findAll();

        console.log('Professionals:', JSON.stringify(pros, null, 2));
        console.log('Services:', JSON.stringify(services, null, 2));
    } catch (error) {
        console.error(error);
    }
}

check();
