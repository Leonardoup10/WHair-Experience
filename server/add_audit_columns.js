const { sequelize } = require('./models');

async function addAuditColumns() {
    try {
        await sequelize.query("ALTER TABLE Transactions ADD COLUMN deletedAt DATETIME;");
        console.log('Column deletedAt added successfully');
    } catch (error) {
        console.log('Column deletedAt might already exist or error:', error.message);
    }

    try {
        await sequelize.query("ALTER TABLE Transactions ADD COLUMN deleted_by INTEGER REFERENCES Users(id);");
        console.log('Column deleted_by added successfully');
    } catch (error) {
        console.log('Column deleted_by might already exist or error:', error.message);
    }
}

addAuditColumns();
