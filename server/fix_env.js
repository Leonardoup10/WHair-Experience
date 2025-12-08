const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const correctContent = `DATABASE_URL="postgresql://postgres:#Le1035os!25.2@db.tfovigcvgsynoahdjcfk.supabase.co:5432/postgres"`;

try {
    fs.writeFileSync(envPath, correctContent);
    console.log('✅ .env fixed successfully.');
} catch (e) {
    console.error('❌ Error writing .env:', e);
}
