const { sequelize } = require('./models');

async function addColumn() {
    try {
        await sequelize.query("ALTER TABLE Transactions ADD COLUMN professional_id INTEGER REFERENCES Professionals(id);");
        console.log('Column professional_id added successfully');
    } catch (error) {
        console.error('Error adding column:', error);
    }
}

addColumn();
