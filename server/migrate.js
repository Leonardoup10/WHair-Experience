const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const tables = ['Professionals', 'Services', 'Products'];
        const queryInterface = sequelize.getQueryInterface();

        for (const table of tables) {
            const tableInfo = await queryInterface.describeTable(table);

            if (!tableInfo.updated_by) {
                console.log(`Adding updated_by to ${table}...`);
                await queryInterface.addColumn(table, 'updated_by', {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'Users',
                        key: 'id'
                    }
                });
                console.log(`✅ updated_by added to ${table}`);
            } else {
                console.log(`ℹ️  ${table} already has updated_by`);
            }
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
