const { sequelize, Sale, Professional } = require('./models');
const { Op } = require('sequelize');

async function inspectSales() {
    try {
        const sales = await Sale.findAll({
            where: {
                date: {
                    [Op.gte]: new Date('2025-12-01T00:00:00'),
                    [Op.lt]: new Date('2025-12-02T00:00:00')
                }
            },
            include: [{
                model: Professional,
                where: { name: 'WANDA ALVES' }
            }]
        });

        console.log(`Found ${sales.length} sales for Wanda Alves on 2025-12-01:`);
        sales.forEach(s => {
            console.log(`ID: ${s.id} | Price: ${s.sale_price} | Comm: ${s.commission_amount} | Rate: ${s.commission_rate} | Type: ${s.type}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

inspectSales();
