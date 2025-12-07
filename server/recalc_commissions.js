const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Recalculating zero commissions...');

    // Update Service Commissions
    db.run(`
        UPDATE Sales 
        SET commission_amount = sale_price * (
            SELECT service_commission_rate 
            FROM Professionals 
            WHERE Professionals.id = Sales.professional_id
        )
        WHERE type = 'SERVICE' AND commission_amount = 0
    `, function (err) {
        if (err) console.error('Error updating services:', err);
        else console.log(`Updated ${this.changes} service commissions.`);
    });

    // Update Product Commissions
    db.run(`
        UPDATE Sales 
        SET commission_amount = sale_price * (
            SELECT product_commission_rate 
            FROM Professionals 
            WHERE Professionals.id = Sales.professional_id
        )
        WHERE type = 'PRODUCT' AND commission_amount = 0
    `, function (err) {
        if (err) console.error('Error updating products:', err);
        else console.log(`Updated ${this.changes} product commissions.`);
    });
});

db.close();
