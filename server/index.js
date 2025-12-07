const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize, Professional, Service, Product, Sale, User, Transaction } = require('./models');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

console.log('User model loaded:', !!User);

// Sync Database
sequelize.sync({ force: false }).then(async () => {
    console.log('Database synced');

    // Create default users if they don't exist
    try {
        const adminExists = await User.findOne({ where: { email: 'admin@test.com' } });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@test.com',
                password: 'admin',
                role: 'ADMIN'
            });
            console.log('✅ Admin user created');
        }

        const recepExists = await User.findOne({ where: { email: 'recepcao@test.com' } });
        if (!recepExists) {
            await User.create({
                name: 'Receção',
                email: 'recepcao@test.com',
                password: 'recepcao',
                role: 'RECEPTION'
            });
            console.log('✅ Reception user created');
        }
    } catch (error) {
        console.log('ℹ️  Default users already exist or error:', error.message);
    }
});

// --- Routes ---

// User routes
const userRoutes = require('./routes/user.routes');
app.use('/users', userRoutes);

// Professionals
app.get('/professionals', async (req, res) => {
    const professionals = await Professional.findAll({
        order: [['name', 'ASC']]
    });
    res.json(professionals);
});

app.post('/professionals', async (req, res) => {
    try {
        const professional = await Professional.create(req.body);
        res.json(professional);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/professionals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professional = await Professional.findByPk(id);
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }
        await professional.update(req.body);
        res.json(professional);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/professionals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professional = await Professional.findByPk(id);
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }
        await professional.destroy();
        res.json({ message: 'Professional deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Services
app.get('/services', async (req, res) => {
    const services = await Service.findAll();
    res.json(services);
});

app.post('/services', async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        await service.update(req.body);
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        await service.destroy();
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Products
app.get('/products', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
});

app.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sales (POS)
app.post('/sales', async (req, res) => {
    const { professional_id, type, item_id, sale_price, client_name, client_origin, payment_method, tip_amount } = req.body;

    try {
        const professional = await Professional.findByPk(professional_id);
        if (!professional) return res.status(404).json({ error: 'Professional not found' });

        let finalPrice = 0;
        let commissionRate = 0;

        if (type === 'SERVICE') {
            const service = await Service.findByPk(item_id);
            if (!service) return res.status(404).json({ error: 'Service not found' });
            // Use provided price or default to service price
            finalPrice = sale_price ? parseFloat(sale_price) : parseFloat(service.price);
            commissionRate = professional.service_commission_rate;
        } else if (type === 'PRODUCT') {
            const product = await Product.findByPk(item_id);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            // Use provided price or default to product price
            finalPrice = sale_price ? parseFloat(sale_price) : parseFloat(product.price);
            commissionRate = professional.product_commission_rate;

            // Update stock
            if (product.stock > 0) {
                await product.decrement('stock');
            }
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        const commissionAmount = finalPrice * commissionRate;

        const sale = await Sale.create({
            professional_id,
            type,
            item_id,
            sale_price: finalPrice,
            commission_amount: commissionAmount,
            client_name,
            client_origin,
            payment_method,
            tip_amount: tip_amount ? parseFloat(tip_amount) : 0
        });

        // Auto-create cash flow transaction if payment is in cash (Numerário)
        if (payment_method === 'Numerário') {
            const itemName = type === 'SERVICE'
                ? (await Service.findByPk(item_id))?.name
                : (await Product.findByPk(item_id))?.name;

            const description = type === 'PRODUCT'
                ? `Venda - ${itemName || 'Produto'}`
                : `Serviço - ${itemName || 'Atendimento'}`;

            await Transaction.create({
                type: 'IN',
                description: description,
                amount: finalPrice,
                category: type === 'PRODUCT' ? 'Venda de Produto' : 'Serviço Prestado',
                user_id: null, // System-generated
                date: new Date()
            });
        }
        res.json(sale);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cash Flow Balance
app.get('/cash-flow/balance', async (req, res) => {
    try {
        // Reset Date: Only count transactions/sales from this date onwards
        const CASH_FLOW_START_DATE = '2025-12-02 00:00:00';

        const [salesResult] = await sequelize.query(
            "SELECT SUM(sale_price) as total FROM Sales WHERE payment_method = 'Numerário' AND date >= :startDate",
            { replacements: { startDate: CASH_FLOW_START_DATE } }
        );
        const totalSales = salesResult[0].total || 0;

        const [inResult] = await sequelize.query(
            "SELECT SUM(amount) as total FROM Transactions WHERE type = 'IN' AND date >= :startDate",
            { replacements: { startDate: CASH_FLOW_START_DATE } }
        );
        const totalIn = inResult[0].total || 0;

        const [outResult] = await sequelize.query(
            "SELECT SUM(amount) as total FROM Transactions WHERE type = 'OUT' AND category NOT IN ('Pagamento Comissão', 'Adiantamento') AND status = 'COMPLETED' AND date >= :startDate",
            { replacements: { startDate: CASH_FLOW_START_DATE } }
        );
        const totalOut = outResult[0].total || 0;

        // totalIn already includes cash sales (generated as transactions), so we don't add totalSales again
        const balance = totalIn - totalOut;

        res.json({
            balance,
            breakdown: {
                sales: totalSales, // Keep for display if needed, but not for balance
                in: totalIn,
                out: totalOut
            }
        });
    } catch (error) {
        console.error('Error calculating balance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Transactions Routes
app.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [
                { model: User, attributes: ['name'] },
                { model: Professional, attributes: ['name'] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/transactions', async (req, res) => {
    try {
        const { type, description, amount, category, payment_method, user_id, professional_id, status, due_date } = req.body;

        const transaction = await Transaction.create({
            type,
            description,
            amount,
            category,
            payment_method,
            user_id,
            professional_id,
            status: status || 'COMPLETED',
            due_date
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        await transaction.update(req.body);
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query; // Get user_id from query params

        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Audit: Record who deleted it before soft deleting
        if (user_id) {
            transaction.deleted_by = user_id;
            await transaction.save();
        }

        await transaction.destroy(); // Soft delete (sets deletedAt)
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dashboard / Reports
app.get('/sales', async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [Professional],
            order: [['date', 'DESC']]
        });
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/dashboard/commissions', async (req, res) => {
    try {
        const commissions = await Sale.findAll({
            attributes: [
                'professional_id',
                [sequelize.fn('sum', sequelize.col('commission_amount')), 'total_commission'],
                [sequelize.fn('count', sequelize.col('Sale.id')), 'total_sales']
            ],
            include: [{
                model: Professional,
                attributes: ['id', 'name']
            }],
            group: ['professional_id', 'Professional.id', 'Professional.name']
        });
        res.json(commissions);
    } catch (error) {
        console.error('Error fetching commissions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Vault Routes
app.get('/vault', async (req, res) => {
    try {
        const transactions = await VaultTransaction.findAll({
            order: [['date', 'DESC']]
        });

        const balance = transactions.reduce((acc, curr) => {
            return curr.type === 'DEPOSIT'
                ? acc + Number(curr.amount)
                : acc - Number(curr.amount);
        }, 0);

        res.json({ balance, transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/vault', async (req, res) => {
    try {
        const { type, amount, category, description } = req.body;

        const transaction = await VaultTransaction.create({
            type,
            amount,
            category,
            description
        });

        // If it's a DEPOSIT into Vault, it comes OUT of the main Cash Flow
        // If it's a WITHDRAW from Vault, it comes IN to the main Cash Flow (usually)
        // For now, let's just record the Vault movement. 
        // Ideally, a Vault Deposit should be an OUT transaction in the main ledger.

        if (type === 'DEPOSIT') {
            await Transaction.create({
                type: 'OUT',
                description: `Depósito em Cofre - ${description || category}`,
                amount: amount,
                category: 'Transferência Cofre',
                status: 'COMPLETED',
                payment_method: 'Numerário', // Assuming cash move
                date: new Date()
            });
        } else {
            await Transaction.create({
                type: 'IN',
                description: `Levantamento Cofre - ${description || category}`,
                amount: amount,
                category: 'Transferência Cofre',
                status: 'COMPLETED',
                payment_method: 'Numerário',
                date: new Date()
            });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

