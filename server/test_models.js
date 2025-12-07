const { sequelize, Sale } = require('./models');

async function check() {
    try {
        console.log('Checking Sales via Models...');
        const count = await Sale.count();
        console.log(`Total Sales: ${count}`);

        if (count > 0) {
            const minDate = await Sale.min('date');
            const maxDate = await Sale.max('date');
            console.log('Min Date:', minDate);
            console.log('Max Date:', maxDate);

            const latest = await Sale.findOne({ order: [['date', 'DESC']] });
            console.log('Latest Sale:', JSON.stringify(latest, null, 2));
        } else {
            console.log('No sales found via models.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

check();
