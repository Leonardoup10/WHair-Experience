const { sequelize, Transaction, VaultTransaction } = require('./models');

async function migrate() {
    try {
        // Add columns to Transactions
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Transactions');

        if (!tableInfo.status) {
            await queryInterface.addColumn('Transactions', 'status', {
                type: 'TEXT', // SQLite uses TEXT for ENUM
                defaultValue: 'COMPLETED'
            });
            console.log('✅ Added status column to Transactions');
        }

        if (!tableInfo.due_date) {
            await queryInterface.addColumn('Transactions', 'due_date', {
                type: 'DATEONLY',
                allowNull: true
            });
            console.log('✅ Added due_date column to Transactions');
        }

        // Create VaultTransactions table
        await VaultTransaction.sync();
        console.log('✅ Synced VaultTransactions table');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
