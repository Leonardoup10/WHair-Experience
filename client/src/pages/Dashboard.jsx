import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Clock, Search, Filter, Scissors, Package, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [commissions, setCommissions] = useState([]);
    const [sales, setSales] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        period: 'month', // all, today, week, month, custom
        professional: 'all',
        type: 'all', // all, SERVICE, PRODUCT
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [commRes, salesRes, profRes] = await Promise.all([
                axios.get(import.meta.env.VITE_API_URL + '/dashboard/commissions'),
                axios.get(import.meta.env.VITE_API_URL + '/sales'),
                axios.get(import.meta.env.VITE_API_URL + '/professionals')
            ]);
            setCommissions(commRes.data);
            setSales(salesRes.data);
            setProfessionals(profRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    // Filter sales based on active filters
    const getFilteredSales = () => {
        let filtered = [...sales];

        // Period filter
        const now = new Date();
        if (filters.period === 'today') {
            filtered = filtered.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate.toDateString() === now.toDateString();
            });
        } else if (filters.period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(s => new Date(s.date) >= weekAgo);
        } else if (filters.period === 'month') {
            // Current Calendar Month
            filtered = filtered.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            });
        } else if (filters.period === 'custom' && filters.startDate && filters.endDate) {
            filtered = filtered.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= new Date(filters.startDate) && saleDate <= new Date(filters.endDate);
            });
        }

        // Professional filter
        if (filters.professional !== 'all') {
            filtered = filtered.filter(s => s.professional_id === Number(filters.professional));
        }

        // Type filter
        if (filters.type !== 'all') {
            filtered = filtered.filter(s => s.type === filters.type);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.Professional?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.type === 'SERVICE' ? 'serviço' : 'produto').includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredSales = getFilteredSales();

    // Calculate metrics
    const totalRevenue = filteredSales.reduce((acc, curr) => acc + (Number(curr.sale_price) || 0), 0);
    const serviceRevenue = filteredSales.filter(s => s.type === 'SERVICE').reduce((acc, curr) => acc + (Number(curr.sale_price) || 0), 0);
    const productRevenue = filteredSales.filter(s => s.type === 'PRODUCT').reduce((acc, curr) => acc + (Number(curr.sale_price) || 0), 0);
    const totalCommissions = filteredSales.reduce((acc, curr) => acc + (Number(curr.commission_amount) || 0), 0);

    const hasActiveFilters = filters.period !== 'all' || filters.professional !== 'all' || filters.type !== 'all';

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const paginatedSales = itemsPerPage === 'all'
        ? filteredSales
        : filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Chart Data Processing
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const getChartData = () => {
        const monthlyData = Array(12).fill(0).map((_, index) => ({
            name: new Date(0, index).toLocaleString('pt-PT', { month: 'short' }),
            total: 0,
            services: 0,
            products: 0
        }));

        sales.forEach(s => {
            const date = new Date(s.date);
            if (date.getFullYear() === Number(selectedYear)) {
                const month = date.getMonth();
                const amount = Number(s.sale_price) || 0;

                monthlyData[month].total += amount;
                if (s.type === 'SERVICE') {
                    monthlyData[month].services += amount;
                } else {
                    monthlyData[month].products += amount;
                }
            }
        });

        return monthlyData;
    };

    const chartData = getChartData();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Geral</h2>
                <p className="text-slate-500">Acompanhe o desempenho do W Hair Experience.</p>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-800">Filtros</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={() => setFilters({ period: 'all', professional: 'all', type: 'all', startDate: '', endDate: '' })}
                            className="ml-auto text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Limpar Filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Period Filter */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Período</label>
                        <select
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                            value={filters.period}
                            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                        >
                            <option value="all">Todos</option>
                            <option value="today">Hoje</option>
                            <option value="week">Últimos 7 dias</option>
                            <option value="month">Mês Atual</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>

                    {/* Professional Filter */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profissional</label>
                        <select
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                            value={filters.professional}
                            onChange={(e) => setFilters({ ...filters, professional: e.target.value })}
                        >
                            <option value="all">Todos</option>
                            {professionals.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo</label>
                        <select
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="all">Todos</option>
                            <option value="SERVICE">Serviços</option>
                            <option value="PRODUCT">Produtos</option>
                        </select>
                    </div>

                    {/* Custom Date Range (only visible when custom period is selected) */}
                    {filters.period === 'custom' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Início</label>
                                <input
                                    type="date"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Fim</label>
                                <input
                                    type="date"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards - Lateral Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-soft text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4 backdrop-blur-sm">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-slate-300 text-sm font-medium">Faturamento Total</p>
                        <h3 className="text-3xl font-bold mt-1">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalRevenue)}</h3>
                        <p className="text-xs text-slate-400 mt-2">{filteredSales.length} vendas</p>
                    </div>
                </div>

                {/* Service Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Scissors className="w-24 h-24 text-pink-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 mb-4">
                            <Scissors className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Serviços</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(serviceRevenue)}</h3>
                        <p className="text-xs text-slate-400 mt-2">{filteredSales.filter(s => s.type === 'SERVICE').length} vendas</p>
                    </div>
                </div>

                {/* Product Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <Package className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Produtos</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(productRevenue)}</h3>
                        <p className="text-xs text-slate-400 mt-2">{filteredSales.filter(s => s.type === 'PRODUCT').length} vendas</p>
                    </div>
                </div>
            </div>

            {/* Historical Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Evolução do Faturamento
                    </h3>
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-pink-500"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#db2777" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#db2777" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
                            <CartesianGrid vertical={false} stroke="#f1f5f9" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`€ ${value.toFixed(2)}`, '']}
                            />
                            <Area type="monotone" dataKey="total" name="Total" stroke="#1e293b" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                            <Area type="monotone" dataKey="services" name="Serviços" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorServices)" />
                            <Area type="monotone" dataKey="products" name="Produtos" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorProducts)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Full Sales History Table */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        Histórico de Lançamentos
                        {hasActiveFilters && <span className="text-sm font-normal text-pink-600">(Filtrado)</span>}
                    </h3>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Pagination Limit Selector */}
                        <select
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={25}>25 por página</option>
                            <option value={50}>50 por página</option>
                            <option value={100}>100 por página</option>
                            <option value="all">Mostrar Todos</option>
                        </select>

                        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm w-full md:w-auto">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar profissional..."
                                className="bg-transparent text-sm outline-none w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4">Data / Hora</th>
                                <th className="p-4">Profissional</th>
                                <th className="p-4 text-center">Tipo</th>
                                <th className="p-4 text-center">Pagamento</th>
                                <th className="p-4 text-right">Valor Venda</th>
                                <th className="p-4 text-right">Comissão</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedSales.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 text-slate-600 font-medium">
                                        {new Date(s.date).toLocaleDateString()} <span className="text-slate-400 text-xs ml-1">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                                {s.Professional?.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-900">{s.Professional?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${s.type === 'SERVICE'
                                            ? 'bg-pink-50 text-pink-700 border-pink-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {s.type === 'SERVICE' ? 'SERVIÇO' : 'PRODUTO'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${s.payment_method === 'Numerário' ? 'bg-green-50 text-green-700' :
                                            s.payment_method === 'Multibanco' ? 'bg-blue-50 text-blue-700' :
                                                s.payment_method === 'Teya' ? 'bg-purple-50 text-purple-700' :
                                                    s.payment_method === 'MBWAY' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-slate-50 text-slate-700'
                                            }`}>
                                            {s.payment_method || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-800">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(s.sale_price) || 0)}</td>
                                    <td className="p-4 text-right font-bold text-green-600">+ {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(s.commission_amount) || 0)}</td>
                                    <td className="p-4 text-center">
                                        <span className="text-xs font-semibold text-slate-400">Concluído</span>
                                    </td>
                                </tr>
                            ))}
                            {paginatedSales.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-400">
                                        Nenhum lançamento encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {itemsPerPage !== 'all' && totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">
                            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredSales.length)} de {filteredSales.length} resultados
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-slate-600 flex items-center">
                                {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
