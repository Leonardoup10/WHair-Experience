const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize, Professional, Service, Sale } = require('./models');

const filePath = path.join(__dirname, '..', 'BaseServicoseVendas.xlsx');

function excelDateToJSDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

function normalizeString(str) {
    return str ? str.toString().trim().toUpperCase() : '';
}

async function runImport() {
    console.log('🚀 Starting import to Supabase...');

    // Sanitize DB URL
    if (process.env.DATABASE_URL) {
        process.env.DATABASE_URL = process.env.DATABASE_URL.trim().replace(/^['"]+|['"]+$/g, '');
    }

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database.');
    } catch (e) {
        console.error('❌ Connection failed:', e);
        return;
    }

    if (!require('fs').existsSync(filePath)) {
        console.error('❌ Excel file not found:', filePath);
        return;
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    console.log(`📊 Found ${rows.length} rows in Excel.`);

    // 0. Clear Sales Table
    console.log('🧹 Clearing Sales table...');
    try {
        await Sale.destroy({ where: {}, truncate: true, restartIdentity: true, cascade: true });
    } catch (e) {
        // Fallback for older Sequelize versions
        await sequelize.query('TRUNCATE TABLE "Sales" RESTART IDENTITY CASCADE;');
    }
    console.log('✅ Sales table cleared (IDs reset).');

    // 1. Ensure Generic Service
    let service = await Service.findOne({ where: { name: 'Serviço Importado' } });
    if (!service) {
        service = await Service.create({
            name: 'Serviço Importado',
            price: 0
        });
        console.log('✅ Created generic service:', service.id);
    } else {
        console.log('ℹ️  Using existing generic service:', service.id);
    }

    // 2. Ensure Generic Product
    // We use dynamic require to access Product model since it might not be destructured above if older CommonJS style
    // But line 4 includes it? server/models.js exports Product.
    // Let's rely on require('./models').Product as in my previous attempt just to be safe or use what I imported.
    const { Product } = require('./models');

    let product = await Product.findOne({ where: { name: 'Produto Importado' } });
    if (!product) {
        product = await Product.create({
            name: 'Produto Importado',
            price: 0,
            stock: 9999
        });
        console.log('✅ Created generic product:', product.id);
    } else {
        console.log('ℹ️  Using existing generic product:', product.id);
    }

    // Cache Professionals
    const profCache = {};
    const allProfs = await Professional.findAll();
    allProfs.forEach(p => profCache[p.name.toUpperCase()] = p.id);

    const salesToInsert = [];
    const BATCH_SIZE = 500;
    let newProfsCount = 0;

    console.log('🔄 Processing rows...');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const profNameRaw = row['PROFISSIONAL'];
        if (!profNameRaw) continue;

        const profName = normalizeString(profNameRaw);

        // Find or Create Professional
        let profId = profCache[profName];
        if (!profId) {
            try {
                const newProf = await Professional.create({
                    name: profNameRaw,
                    service_commission_rate: 45.0,
                    product_commission_rate: 10.0,
                    active: true
                });
                profId = newProf.id;
                profCache[profName] = profId;
                newProfsCount++;
                console.log(`   ➕ Created new professional: ${profNameRaw}`);
            } catch (err) {
                console.error(`   ❌ Error creating professional ${profName}:`, err.message);
                continue;
            }
        }

        // Prepare Sale Object
        const date = excelDateToJSDate(row['DATA']);
        const salePrice = parseFloat(row[' VALOR '] || row['VALOR']) || 0;
        const commission = parseFloat(row['COMISSÃO']) || 0;

        // Determine Type
        const typeRaw = row['TIPO'] ? row['TIPO'].toString().toUpperCase() : 'SERVIÇO';
        const isProduct = typeRaw.includes('PRODUTO');

        const type = isProduct ? 'PRODUCT' : 'SERVICE';
        const itemId = isProduct ? product.id : service.id;

        salesToInsert.push({
            professional_id: profId,
            type: type,
            item_id: itemId,
            sale_price: salePrice,
            commission_amount: commission,
            client_name: row['CLIENTE'] || 'Cliente Importado',
            client_origin: row['FUNIL'] || 'Outro',
            payment_method: row['FORMA_PAGAMENTO'] || 'Numerário',
            date: date,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Batch Insert
        if (salesToInsert.length >= BATCH_SIZE) {
            await Sale.bulkCreate(salesToInsert);
            console.log(`   Processed ${i + 1} / ${rows.length} rows...`);
            salesToInsert.length = 0; // Clear array
        }
    }

    // Insert remaining
    if (salesToInsert.length > 0) {
        await Sale.bulkCreate(salesToInsert);
        console.log(`   Processed ${rows.length} / ${rows.length} rows.`);
    }

    console.log('-----------------------------------');
    console.log('✅ Import finished!');
    console.log(`Total Rows in Excel: ${rows.length}`);
    console.log(`New Professionals Created: ${newProfsCount}`);

    // Verify Count
    const count = await Sale.count();
    console.log(`📊 Total Sales in DB now: ${count}`);

    await sequelize.close();
}

runImport();
