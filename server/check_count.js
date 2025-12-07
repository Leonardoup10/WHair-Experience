const { sequelize, Sale, Transaction } = require('./models');

async function checkCount() {
    try {
        const salesCount = await Sale.count();
        const transactionsCount = await Transaction.count();
        console.log(`Total Sales: ${salesCount}`);
        console.log(`Total Transactions: ${transactionsCount}`);

        if (salesCount > 0) {
            const lastSale = await Sale.findOne({ order: [['date', 'DESC']] });
            console.log('Latest Sale Date:', lastSale.date);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkCount();
