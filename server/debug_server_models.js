const { sequelize, Sale, Professional } = require('./models');

async function test() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        for (let id = 12; id <= 12; id++) {
            try {
                // console.log(`Fetching ID ${id}...`);
                const sale = await Sale.findByPk(id, {
                    include: [Professional]
                });
                if (sale) {
                    // console.log(`ID ${id} OK.`);
                } else {
                    console.log(`ID ${id} not found.`);
                }
            } catch (err) {
                console.error(`Error fetching ID ${id}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Error fetching sales:', error.message);
        console.error('Parent:', error.parent);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

test();
