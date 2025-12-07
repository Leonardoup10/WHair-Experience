const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

async function migrateSales() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Sales');

        if (!tableInfo.client_name) {
            console.log('Adding client_name to Sales...');
            await queryInterface.addColumn('Sales', 'client_name', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!tableInfo.client_origin) {
            console.log('Adding client_origin to Sales...');
            await queryInterface.addColumn('Sales', 'client_origin', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!tableInfo.payment_method) {
            console.log('Adding payment_method to Sales...');
            await queryInterface.addColumn('Sales', 'payment_method', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        console.log('Sales migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateSales();
