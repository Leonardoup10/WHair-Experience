const { sequelize } = require('./models');

async function addPaymentMethodColumn() {
    try {
        await sequelize.query("ALTER TABLE Transactions ADD COLUMN payment_method VARCHAR(255);");
        console.log('Column payment_method added successfully');
    } catch (error) {
        console.log('Column payment_method might already exist or error:', error.message);
    }
}

addPaymentMethodColumn();
