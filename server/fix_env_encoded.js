const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
// Password: #Le1035os!25.2 -> %23Le1035os!25.2
const correctContent = `DATABASE_URL="postgresql://postgres.tfovigcvgsynoahdjcfk:%23Le1035os!25.2@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"`;

try {
    fs.writeFileSync(envPath, correctContent);
    console.log('✅ .env fixed with ENCODED password.');
} catch (e) {
    console.error('❌ Error writing .env:', e);
}
