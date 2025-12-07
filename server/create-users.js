const axios = require('axios');

async function createUsers() {
    const users = [
        { name: 'Admin', email: 'admin@test.com', password: 'admin', role: 'ADMIN' },
        { name: 'Receção', email: 'recepcao@test.com', password: 'recepcao', role: 'RECEPTION' }
    ];

    for (const user of users) {
        try {
            const response = await axios.post('http://localhost:3001/users', user);
            console.log(`✅ Usuário criado: ${user.email}`);
        } catch (error) {
            if (error.response?.data?.error?.includes('já cadastrado')) {
                console.log(`ℹ️  Usuário já existe: ${user.email}`);
            } else {
                console.log(`❌ Erro ao criar ${user.email}:`, error.response?.data?.error || error.message);
            }
        }
    }

    console.log('\n📋 Logins disponíveis:');
    console.log('Admin: admin@test.com / admin');
    console.log('Receção: recepcao@test.com / recepcao');
}

createUsers();
