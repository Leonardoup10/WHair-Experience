const { sequelize, Transaction } = require('./models');

async function checkDuplicates() {
    try {
        const transactions = await Transaction.findAll({
            order: [['date', 'DESC']]
        });

        console.log(`Total Transactions: ${transactions.length}`);

        transactions.forEach(t => {
            console.log(`[${t.id}] ${t.date.toISOString()} - ${t.type} - ${t.description} - €${t.amount}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkDuplicates();
