import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, DollarSign, CreditCard, User, TrendingUp, Wallet, Clock } from 'lucide-react';

const DailySummary = () => {
    const [sales, setSales] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, transRes] = await Promise.all([
                api.get('/sales'),
                api.get('/transactions')
            ]);
            setSales(salesRes.data);
            setTransactions(transRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter for Today
    const today = new Date();
    const isToday = (dateString) => {
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const todaySales = sales.filter(s => isToday(s.date));
    const todayTransactions = transactions.filter(t => isToday(t.date));

    // Metrics
    const totalRevenue = todaySales.reduce((acc, curr) => acc + Number(curr.sale_price), 0);
    const totalServices = todaySales.filter(s => s.type === 'SERVICE').length;
    const totalProducts = todaySales.filter(s => s.type === 'PRODUCT').length;

    // Payment Methods Breakdown
    const paymentMethods = todaySales.reduce((acc, curr) => {
        const method = curr.payment_method || 'Não especificado';
        acc[method] = (acc[method] || 0) + Number(curr.sale_price);
        return acc;
    }, {});

    // Professional Breakdown (Updated with Commission and Tips)
    const professionalPerformance = todaySales.reduce((acc, curr) => {
        const name = curr.Professional?.name || 'Desconhecido';
        if (!acc[name]) acc[name] = { total: 0, services: 0, products: 0, commission: 0, tips: 0, count: 0 };

        const amount = Number(curr.sale_price);
        acc[name].total += amount;

        if (curr.type === 'SERVICE') {
            acc[name].services += amount;
        } else {
            acc[name].products += amount;
        }

        acc[name].commission += Number(curr.commission_amount);
        acc[name].tips += Number(curr.tip_amount || 0);
        acc[name].count += 1;
        return acc;
    }, {});

    // Cash Flow Calculation
    const salesInCash = todaySales
        .filter(s => s.payment_method === 'Numerário')
        .reduce((acc, curr) => acc + Number(curr.sale_price), 0);

    const transactionsIn = todayTransactions
        .filter(t => t.type === 'IN')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const transactionsOut = todayTransactions
        .filter(t =>
            t.type === 'OUT' &&
            t.payment_method === 'Numerário' &&
            !['Pagamento Comissão', 'Adiantamento'].includes(t.category)
        )
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expectedCashInDrawer = transactionsIn - transactionsOut;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-pink-600" />
                    Fechamento Diário
                </h2>
                <p className="text-slate-500">Resumo das operações de hoje ({today.toLocaleDateString()}).</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-soft text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Faturamento Total</span>
                    </div>
                    <h3 className="text-3xl font-bold">€ {totalRevenue.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 mt-2">{todaySales.length} vendas realizadas</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Caixa (Numerário)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">€ {expectedCashInDrawer.toFixed(2)}</h3>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-slate-400">
                        <span className="flex justify-between"><span>Vendas Numerário:</span> <span>+ {salesInCash.toFixed(2)}</span></span>
                        <span className="flex justify-between"><span>Outras Entradas:</span> <span>+ {(transactionsIn - salesInCash).toFixed(2)}</span></span>
                        <span className="flex justify-between"><span>Saídas:</span> <span>- {transactionsOut.toFixed(2)}</span></span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Cartão / Outros</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">
                        € {(totalRevenue - salesInCash).toFixed(2)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2">Total recebido em meios digitais</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Operacional</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-bold text-slate-800">{totalServices}</span>
                            <span className="text-xs text-slate-400 ml-1">Serviços</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-slate-800">{totalProducts}</span>
                            <span className="text-xs text-slate-400 ml-1">Produtos</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-slate-400" />
                            Por Forma de Pagamento
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {Object.entries(paymentMethods).map(([method, amount]) => (
                                <div key={method} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                        <span className="font-medium text-slate-700">{method}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-slate-400">
                                            {((amount / totalRevenue) * 100).toFixed(1)}%
                                        </span>
                                        <span className="font-bold text-slate-800 w-24 text-right">
                                            € {amount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(paymentMethods).length === 0 && (
                                <p className="text-center text-slate-400 py-4">Nenhuma venda hoje.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Professional Performance */}
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-slate-400" />
                            Desempenho por Profissional
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {Object.entries(professionalPerformance).map(([name, data]) => (
                                <div key={name} className="flex flex-col gap-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-700 block">{name}</span>
                                                <span className="text-xs text-slate-400">{data.count} atendimentos</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-800 block">€ {data.total.toFixed(2)}</span>
                                            <span className="text-xs text-green-600 font-bold">
                                                Comissão: € {data.commission.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detailed Breakdown */}
                                    <div className="flex gap-4 pl-11 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                                            <span>Serviços: <strong>€ {data.services.toFixed(2)}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                            <span>Produtos: <strong>€ {data.products.toFixed(2)}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(professionalPerformance).length === 0 && (
                                <p className="text-center text-slate-400 py-4">Nenhum atendimento hoje.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySummary;
