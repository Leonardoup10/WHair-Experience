import React, { useState, useEffect } from 'react';
import api from '../api';
import { Lock, ArrowUpCircle, ArrowDownCircle, History, AlertCircle } from 'lucide-react';

const Vault = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('DEPOSIT'); // DEPOSIT, WITHDRAW
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        category: 'Reserva',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/vault');
            setBalance(res.data.balance);
            setTransactions(res.data.transactions);
        } catch (error) {
            console.error('Error fetching vault data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post('/vault', {
                type: modalType,
                amount: formData.amount,
                category: formData.category,
                description: formData.description
            });
            alert('Operação realizada com sucesso!');
            setShowModal(false);
            setFormData({ amount: '', category: 'Reserva', description: '' });
            fetchData();
        } catch (error) {
            console.error('Error processing vault transaction:', error);
            alert('Erro ao processar operação.');
        } finally {
            setProcessing(false);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-slate-800" />
                    Cofre
                </h2>
                <p className="text-slate-500">Gestão de reservas e fundos separados do caixa diário.</p>
            </div>

            {/* Main Balance Card */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-400 font-medium mb-2">Saldo Atual no Cofre</p>
                    <h3 className="text-5xl font-bold tracking-tight">€ {Number(balance).toFixed(2)}</h3>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => openModal('DEPOSIT')}
                    className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <ArrowDownCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-slate-800">Depositar</h4>
                        <p className="text-sm text-slate-500">Adicionar fundos ao cofre</p>
                    </div>
                </button>

                <button
                    onClick={() => openModal('WITHDRAW')}
                    className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <ArrowUpCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-slate-800">Levantar</h4>
                        <p className="text-sm text-slate-500">Retirar fundos do cofre</p>
                    </div>
                </button>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-800">Histórico de Movimentações</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-500 text-sm">
                                        {new Date(t.date).toLocaleDateString()} <span className="text-xs">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${t.type === 'DEPOSIT'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {t.type === 'DEPOSIT' ? 'DEPÓSITO' : 'LEVANTAMENTO'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-700 font-medium">{t.category}</td>
                                    <td className="p-4 text-slate-500 text-sm">{t.description || '-'}</td>
                                    <td className={`p-4 text-right font-bold ${t.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'DEPOSIT' ? '+' : '-'} € {Number(t.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400">
                                        Nenhuma movimentação registrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                {modalType === 'DEPOSIT' ? 'Depositar no Cofre' : 'Levantar do Cofre'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <AlertCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleTransaction} className="p-6 space-y-4">
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
                                    <option value="Reserva">Reserva</option>
                                    <option value="IVA">IVA</option>
                                    <option value="Impostos">Impostos</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Reserva para IVA Trimestral"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50 mt-4 ${modalType === 'DEPOSIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {processing ? 'Processando...' : 'Confirmar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vault;
