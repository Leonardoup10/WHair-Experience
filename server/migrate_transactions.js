const { sequelize, Transaction, Professional } = require('./models');
const { Op } = require('sequelize');

async function migrateTransactions() {
    try {
        console.log('Starting migration...');

        // Fetch all professionals
        const professionals = await Professional.findAll();
        const professionalsMap = {};
        professionals.forEach(p => {
            professionalsMap[p.name.toLowerCase()] = p.id;
        });

        // Fetch transactions without professional_id
        const transactions = await Transaction.findAll({
            where: {
                professional_id: null,
                type: 'OUT'
            }
        });

        console.log(`Found ${transactions.length} transactions to check.`);

        let updatedCount = 0;

        for (const t of transactions) {
            const descLower = t.description.toLowerCase();
            let matchedId = null;

            // Try to find professional name in description
            for (const [name, id] of Object.entries(professionalsMap)) {
                if (descLower.includes(name)) {
                    matchedId = id;
                    break;
                }
            }

            if (matchedId) {
                t.professional_id = matchedId;
                await t.save();
                console.log(`Updated transaction ${t.id}: Linked to professional ID ${matchedId}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} transactions.`);

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateTransactions();
