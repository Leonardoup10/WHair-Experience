import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, Plus, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

const Expenses = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('payable'); // payable, history
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Despesa Operacional',
        due_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/transactions');
            setTransactions(res.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await axios.post(import.meta.env.VITE_API_URL + '/transactions', {
                type: 'OUT',
                description: formData.description,
                amount: formData.amount,
                category: formData.category,
                status: 'PENDING',
                due_date: formData.due_date,
                payment_method: null // Not paid yet
            });
            alert('Despesa registrada com sucesso!');
            setShowModal(false);
            setFormData({
                description: '',
                amount: '',
                category: 'Despesa Operacional',
                due_date: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (error) {
            console.error('Error creating expense:', error);
            alert('Erro ao registrar despesa.');
        } finally {
            setProcessing(false);
        }
    };

    const handlePayExpense = async (id, amount) => {
        if (!window.confirm(`Confirmar pagamento de € ${amount}?`)) return;

        try {
            await axios.put(`http://localhost:3001/transactions/${id}`, {
                status: 'COMPLETED',
                payment_method: 'Numerário', // Default to Cash for now, could be a modal
                date: new Date() // Set payment date to now
            });
            alert('Pagamento registrado!');
            fetchData();
        } catch (error) {
            console.error('Error paying expense:', error);
            alert('Erro ao registrar pagamento.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
        try {
            await axios.delete(`http://localhost:3001/transactions/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Filter Logic
    const pendingExpenses = transactions.filter(t => t.type === 'OUT' && t.status === 'PENDING');
    const historyExpenses = transactions.filter(t => t.type === 'OUT' && t.status === 'COMPLETED');

    const totalPayable = pendingExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalPaidMonth = historyExpenses
        .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Painel de Despesas</h2>
                    <p className="text-slate-500">Gerencie contas a pagar e histórico de saídas.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-pink-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nova Despesa
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">A Pagar (Total)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">€ {totalPayable.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 mt-2">{pendingExpenses.length} contas pendentes</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Pago este Mês</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">€ {totalPaidMonth.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 mt-2">Total de saídas confirmadas</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('payable')}
                    className={`pb-4 px-2 font-bold text-sm transition-colors relative ${activeTab === 'payable' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Contas a Pagar
                    {activeTab === 'payable' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-2 font-bold text-sm transition-colors relative ${activeTab === 'history' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Histórico de Pagamentos
                    {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600 rounded-t-full"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Vencimento / Data</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(activeTab === 'payable' ? pendingExpenses : historyExpenses).map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-700">{t.description}</td>
                                    <td className="p-4 text-slate-500 text-sm">{t.category}</td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        {t.due_date
                                            ? new Date(t.due_date).toLocaleDateString()
                                            : new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-800">€ {Number(t.amount).toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${t.status === 'PENDING'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {t.status === 'PENDING' ? 'PENDENTE' : 'PAGO'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {t.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handlePayExpense(t.id, t.amount)}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="Marcar como Pago"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(activeTab === 'payable' ? pendingExpenses : historyExpenses).length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">
                                        Nenhuma despesa encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Nova Despesa</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <AlertCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Conta de Luz"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Despesa Operacional">Despesa Operacional</option>
                                    <option value="Fornecedores">Fornecedores</option>
                                    <option value="Impostos">Impostos</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                    value={formData.due_date}
                                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 mt-4"
                            >
                                {processing ? 'Registrando...' : 'Salvar Despesa'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
