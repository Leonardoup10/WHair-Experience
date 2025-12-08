const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
// Also try root env if not found
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

let sequelize;

if (process.env.DATABASE_URL) {
  const fs = require('fs');
  const raw = process.env.DATABASE_URL;
  const url = raw.trim().replace(/^['"]+|['"]+$/g, '');
  const logMsg = `DEBUG [database.js]: Raw Len: ${raw.length}, San Len: ${url.length}, First10: ${url.substring(0, 10)}, Last5: ${url.substring(url.length - 5)}\n`;
  try { fs.appendFileSync('db_debug.log', logMsg); } catch (e) { }
  sequelize = new Sequelize(url, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
