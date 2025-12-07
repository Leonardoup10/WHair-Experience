import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, DollarSign, CheckCircle, Calculator, Wallet, Trash2 } from 'lucide-react';

const HR = () => {
    const { user } = useAuth();
    const [professionals, setProfessionals] = useState([]);
    const [sales, setSales] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('Transferência');
    const [paymentAmount, setPaymentAmount] = useState('');

    // Filters
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedFortnight, setSelectedFortnight] = useState('1'); // '1' or '2'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profRes, salesRes, transRes] = await Promise.all([
                axios.get(import.meta.env.VITE_API_URL + '/professionals'),
                axios.get(import.meta.env.VITE_API_URL + '/sales'),
                axios.get(import.meta.env.VITE_API_URL + '/transactions')
            ]);
            setProfessionals(profRes.data.filter(p => p.active));
            setSales(salesRes.data);
            setTransactions(transRes.data);
            // if (profRes.data.length > 0) {
            //     setSelectedProfessional(profRes.data[0].id);
            // }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const getFilteredData = () => {
        if (!selectedMonth) return { sales: [], totalCommission: 0, totalTips: 0, totalToPay: 0 };

        const [year, month] = selectedMonth.split('-').map(Number);

        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            const saleYear = saleDate.getFullYear();
            const saleMonth = saleDate.getMonth() + 1; // 0-indexed
            const saleDay = saleDate.getDate();

            const isSameMonth = saleYear === year && saleMonth === month;
            const isSameProf = !selectedProfessional || s.professional_id === Number(selectedProfessional);

            let isSameFortnight = false;
            if (selectedFortnight === '1') {
                isSameFortnight = saleDay <= 15;
            } else {
                isSameFortnight = saleDay > 15;
            }

            return isSameMonth && isSameProf && isSameFortnight;
        });

        const filteredTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            const transYear = transDate.getFullYear();
            const transMonth = transDate.getMonth() + 1;

            // Check if transaction is linked to professional
            const isSameProf = !selectedProfessional || t.professional_id === Number(selectedProfessional);

            // Check if transaction is within the selected month (payments usually cover the whole month or specific fortnight, 
            // but for simplicity we filter by month matching the selected period)
            const isSameMonth = transYear === year && transMonth === month;

            return t.type === 'OUT' && isSameProf && isSameMonth && (t.category === 'Pagamento Comissão' || t.category === 'Adiantamento');
        });

        const totalCommission = filteredSales.reduce((acc, curr) => acc + (Number(curr.commission_amount) || 0), 0);
        const totalTips = filteredSales.reduce((acc, curr) => acc + (Number(curr.tip_amount) || 0), 0);

        const totalPaid = filteredTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const totalToPay = (totalCommission + totalTips) - totalPaid;

        return {
            sales: filteredSales,
            transactions: filteredTransactions,
            totalCommission,
            totalTips,
            totalPaid,
            totalToPay // Allow negative values to indicate overpayment/debt
        };
    };

    // Update payment amount when total changes
    useEffect(() => {
        const { totalToPay } = getFilteredData();
        if (totalToPay > 0) {
            setPaymentAmount(totalToPay.toFixed(2));
        } else {
            setPaymentAmount('');
        }
    }, [sales, transactions, selectedProfessional, selectedMonth, selectedFortnight]);

    const handlePayment = async () => {
        if (!selectedProfessional || !paymentAmount) return;

        setProcessing(true);
        try {
            await axios.post(import.meta.env.VITE_API_URL + '/transactions', {
                type: 'OUT',
                description: `Pagamento Comissão - ${new Date(selectedMonth).toLocaleString('default', { month: 'long' })}`,
                amount: parseFloat(paymentAmount),
                category: 'Pagamento Comissão',
                payment_method: paymentMethod,
                professional_id: selectedProfessional,
                date: new Date(),
                status: 'COMPLETED'
            });
            alert('Pagamento registrado com sucesso!');
            fetchData();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Erro ao processar pagamento.');
        } finally {
            setProcessing(false);
        }
    };

    const handleAdvance = async () => {
        if (!selectedProfessional || !paymentAmount) return;

        setProcessing(true);
        try {
            await axios.post(import.meta.env.VITE_API_URL + '/transactions', {
                type: 'OUT',
                description: `Adiantamento - ${new Date().toLocaleDateString()}`,
                amount: parseFloat(paymentAmount),
                category: 'Adiantamento',
                payment_method: paymentMethod,
                professional_id: selectedProfessional,
                date: new Date(),
                status: 'COMPLETED'
            });
            alert('Adiantamento registrado com sucesso!');
            fetchData();
        } catch (error) {
            console.error('Error processing advance:', error);
            alert('Erro ao processar adiantamento.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;

        setProcessing(true);
        try {
            await axios.delete(`http://localhost:3001/transactions/${id}`, {
                params: { user_id: user?.id }
            });
            alert('Lançamento excluído com sucesso!');
            fetchData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Erro ao excluir lançamento.');
        } finally {
            setProcessing(false);
        }
    };

    const {
        sales: filteredSales,
        transactions: filteredTransactions,
        totalCommission,
        totalTips,
        totalPaid,
        totalToPay
    } = getFilteredData();

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-6 h-6 text-pink-600" />
                    Recursos Humanos
                </h2>
                <p className="text-slate-500">Gestão de pagamentos e comissões.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profissional</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            value={selectedProfessional}
                            onChange={(e) => setSelectedProfessional(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {professionals.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mês de Referência</label>
                        <input
                            type="month"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Período</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setSelectedFortnight('1')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedFortnight === '1' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                1ª Quinzena
                            </button>
                            <button
                                onClick={() => setSelectedFortnight('2')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedFortnight === '2' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                2ª Quinzena
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Total Comissões</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">€ {totalCommission.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 mt-2">{filteredSales.length} serviços/vendas realizados</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Gorjetas / Extras</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">€ {totalTips.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 mt-2">Registradas no período</p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-soft text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-300">A Pagar</span>
                    </div>
                    <h3 className="text-3xl font-bold">€ {totalToPay.toFixed(2)}</h3>
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Valor a Pagar / Adiantar</label>
                        <div className="relative mb-4">
                            <span className="absolute left-3 top-2 text-slate-400">€</span>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 pl-8 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-pink-500"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                        </div>

                        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Forma de Pagamento</label>
                        <select
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-pink-500 mb-4"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="Transferência">Transferência Bancária</option>
                            <option value="Numerário">Numerário (Caixa)</option>
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAdvance}
                                disabled={processing || !selectedProfessional}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-bold text-sm transition-colors"
                            >
                                Adiantar
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={totalToPay === 0 || processing || !selectedProfessional}
                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-bold text-sm transition-colors"
                            >
                                Pagar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments History */}
            {filteredTransactions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-slate-400" />
                            Pagamentos e Adiantamentos Realizados
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Descrição</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-slate-600">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium">
                                            {t.description}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full border ${t.category === 'Adiantamento'
                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                : 'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-800 flex items-center justify-end gap-4">
                                            <span>€ {Number(t.amount).toFixed(2)}</span>
                                            <button
                                                onClick={() => handleDeleteTransaction(t.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir lançamento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed List */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        Detalhamento do Período
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Valor Venda</th>
                                <th className="p-4 text-right">Comissão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSales.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-600">
                                        {new Date(s.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${s.type === 'SERVICE'
                                            ? 'bg-pink-50 text-pink-700 border-pink-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {s.type === 'SERVICE' ? 'SERVIÇO' : 'PRODUTO'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-medium text-slate-600">
                                        € {Number(s.sale_price).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right font-bold text-green-600">
                                        € {Number(s.commission_amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        Nenhum registro encontrado para este período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HR;
