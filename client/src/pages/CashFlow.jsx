import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Trash2, Plus, Minus, Calendar } from 'lucide-react';

const CashFlow = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'OUT', // IN or OUT
        description: '',
        amount: '',
        category: 'Despesa'
    });

    const [balanceData, setBalanceData] = useState({ balance: 0, breakdown: { sales: 0, in: 0, out: 0 } });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transRes, salesRes, balanceRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/sales'),
                api.get('/cash-flow/balance')
            ]);
            setTransactions(transRes.data);
            setSales(salesRes.data);
            setBalanceData(balanceRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions', {
                ...formData,
                user_id: user?.id
            });
            setFormData({ type: 'OUT', description: '', amount: '', category: 'Despesa' });
            fetchData();
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Erro ao registrar movimentação');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
            try {
                await api.delete(`/transactions/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    // Calculate Daily Totals (Today)
    const today = new Date().toDateString();

    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
    const todayTransactions = transactions.filter(t => new Date(t.date).toDateString() === today);

    const totalSales = todaySales.reduce((acc, curr) => acc + Number(curr.sale_price), 0);
    const totalIn = todayTransactions.filter(t => t.type === 'IN').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalOut = todayTransactions.filter(t => t.type === 'OUT').reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Use fetched cumulative balance
    const currentBalance = balanceData.balance;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Fluxo de Caixa</h2>
                <p className="text-slate-500">Gestão de entradas e saídas do dia.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Vendas Hoje</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">€ {totalSales.toFixed(2)}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <ArrowUpCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Outras Entradas</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">€ {totalIn.toFixed(2)}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ArrowDownCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Saídas / Despesas</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">€ {totalOut.toFixed(2)}</h3>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-soft text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Saldo do Dia</span>
                    </div>
                    <h3 className="text-2xl font-bold">€ {currentBalance.toFixed(2)}</h3>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 sticky top-24">
                        <h3 className="font-bold text-lg mb-6 text-slate-800">Registrar Movimentação</h3>

                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            <button
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.type === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setFormData({ ...formData, type: 'IN', category: 'Suprimento' })}
                            >
                                <Plus className="w-4 h-4" /> Entrada
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setFormData({ ...formData, type: 'OUT', category: 'Despesa' })}
                            >
                                <Minus className="w-4 h-4" /> Saída
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    placeholder={formData.type === 'IN' ? 'Ex: Ajuste Inicial' : 'Ex: Pagamento Fornecedor'}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {formData.type === 'IN' ? (
                                        <>
                                            <option value="Suprimento">Ajuste</option>
                                            <option value="Aporte">Variável</option>
                                            <option value="Outros">Outros</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Despesa">Despesa</option>
                                            <option value="Sangria">Retirada Walter</option>
                                            <option value="Pagamento Fornecedor">Pagamento Fornecedor</option>
                                            <option value="Pagamento Gorjeta">Pagamento Gorjeta</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white p-3 rounded-xl font-bold transition-transform active:scale-[0.98] shadow-lg ${formData.type === 'IN'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                    }`}
                            >
                                {loading ? 'Salvando...' : 'Registrar'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                Movimentações Recentes
                            </h3>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {transactions.map((t) => (
                                <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {t.type === 'IN' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{t.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.category}</span>
                                                <span>•</span>
                                                <span>{new Date(t.date).toLocaleString()}</span>
                                                <span>•</span>
                                                <span>{t.User?.name || 'Sistema'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`font-bold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'IN' ? '+' : '-'} € {Number(t.amount).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="p-12 text-center text-slate-400">
                                    Nenhuma movimentação registrada.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashFlow;
