const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Transactions);");
        console.log('Transactions Table Columns:', results);
    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema();
