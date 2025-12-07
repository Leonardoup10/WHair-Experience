import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Star, MapPin, Calendar, Search, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ClientAnalytics = () => {
    const [sales, setSales] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [searchTerm, setSearchTerm] = useState('');
    const [chartMetric, setChartMetric] = useState('volume'); // 'volume' or 'revenue'
    const [selectedOrigin, setSelectedOrigin] = useState(null); // New state for chart interaction

    // Processed Data
    const [clientStats, setClientStats] = useState([]);
    const [originData, setOriginData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (sales.length > 0) {
            processData();
        }
    }, [sales, selectedProfessional, selectedMonth, searchTerm, chartMetric, selectedOrigin]);

    const fetchData = async () => {
        try {
            const [salesRes, profRes] = await Promise.all([
                axios.get(import.meta.env.VITE_API_URL + '/sales'),
                axios.get(import.meta.env.VITE_API_URL + '/professionals')
            ]);
            setSales(salesRes.data);
            setProfessionals(profRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived State: Active Professionals in Selected Month
    const [activeProfessionals, setActiveProfessionals] = useState([]);

    useEffect(() => {
        if (sales.length > 0 && selectedMonth) {
            const [year, month] = selectedMonth.split('-').map(Number);

            // 1. Find sales in this month
            const salesInMonth = sales.filter(s => {
                const d = new Date(s.date);
                return d.getFullYear() === year && (d.getMonth() + 1) === month;
            });

            // 2. Extract unique professional IDs
            const activeIds = new Set(salesInMonth.map(s => s.professional_id));

            // 3. Filter professionals list
            const activeProfs = professionals.filter(p => activeIds.has(p.id));
            setActiveProfessionals(activeProfs);

            // 4. Reset selection if current selected professional is not active in this month
            if (selectedProfessional && !activeIds.has(Number(selectedProfessional))) {
                setSelectedProfessional('');
            }
        } else {
            setActiveProfessionals([]);
        }
    }, [sales, selectedMonth, professionals]);

    const processData = () => {
        // 1. Filter Sales
        const [year, month] = selectedMonth.split('-').map(Number);

        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            const saleYear = saleDate.getFullYear();
            const saleMonth = saleDate.getMonth() + 1;

            const isSameMonth = saleYear === year && saleMonth === month;
            const isSameProf = !selectedProfessional || s.professional_id === Number(selectedProfessional);

            return isSameMonth && isSameProf;
        });

        // 2. Aggregate Origins (for Chart)
        const originsMap = {};
        filteredSales.forEach(s => {
            const origin = s.client_origin || 'Desconhecido';
            if (!originsMap[origin]) {
                originsMap[origin] = { volume: 0, revenue: 0 };
            }
            originsMap[origin].volume += 1;
            originsMap[origin].revenue += Number(s.sale_price);
        });

        const originChartData = Object.entries(originsMap)
            .map(([name, stats]) => ({
                name,
                volume: stats.volume,
                revenue: stats.revenue
            }))
            .sort((a, b) => chartMetric === 'volume' ? b.volume - a.volume : b.revenue - a.revenue);

        setOriginData(originChartData);

        // 3. Aggregate Clients (for List)
        const clientMap = {};
        filteredSales.forEach(s => {
            const name = s.client_name || 'Cliente Não Identificado';
            if (name === 'Cliente Não Identificado') return;

            if (!clientMap[name]) {
                clientMap[name] = {
                    name: name,
                    totalSpent: 0,
                    visits: 0,
                    lastVisit: s.date,
                    origins: {}
                };
            }

            const client = clientMap[name];
            client.totalSpent += Number(s.sale_price);
            client.visits += 1;
            if (new Date(s.date) > new Date(client.lastVisit)) {
                client.lastVisit = s.date;
            }
            const origin = s.client_origin || 'Desconhecido';
            client.origins[origin] = (client.origins[origin] || 0) + 1;
        });

        const clientList = Object.values(clientMap).map(c => {
            const topOrigin = Object.entries(c.origins).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Desconhecido';
            return { ...c, topOrigin };
        });

        // Filter by Search Term AND Selected Origin
        const finalClients = clientList.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOrigin = selectedOrigin ? c.topOrigin === selectedOrigin : true;
            return matchesSearch && matchesOrigin;
        }).sort((a, b) => b.totalSpent - a.totalSpent);

        setClientStats(finalClients);
    };

    const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Análise de Clientes
                </h2>
                <p className="text-slate-500">Insights sobre fidelidade e origem dos clientes.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mês de Referência</label>
                        <input
                            type="month"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profissional</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                            value={selectedProfessional}
                            onChange={(e) => setSelectedProfessional(e.target.value)}
                        >
                            <option value="">Todos ({activeProfessionals.length} ativos)</option>
                            {activeProfessionals.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Buscar Cliente</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Nome do cliente..."
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Origin Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-purple-500" />
                            {chartMetric === 'volume' ? 'Volume por Origem' : 'Faturamento por Origem'}
                        </h3>
                        <div className="flex items-center gap-4">
                            {selectedOrigin && (
                                <button
                                    onClick={() => setSelectedOrigin(null)}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md"
                                >
                                    Limpar Filtro: {selectedOrigin}
                                </button>
                            )}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setChartMetric('volume')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartMetric === 'volume' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Volume
                                </button>
                                <button
                                    onClick={() => setChartMetric('revenue')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartMetric === 'revenue' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Faturamento
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={originData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value) => chartMetric === 'revenue' ? `€ ${value.toFixed(2)}` : value}
                                />
                                <Bar
                                    dataKey={chartMetric}
                                    radius={[0, 4, 4, 0]}
                                    barSize={32}
                                    onClick={(data) => {
                                        const clickedOrigin = data.name;
                                        setSelectedOrigin(clickedOrigin === selectedOrigin ? null : clickedOrigin);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {originData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={selectedOrigin === entry.name ? '#7c3aed' : (selectedOrigin ? '#e2e8f0' : COLORS[index % COLORS.length])}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        * Clique nas barras para filtrar a lista de clientes abaixo
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-soft text-white flex flex-col justify-between">
                        <div>
                            <p className="text-purple-100 font-medium mb-1">Total de Clientes Atendidos</p>
                            <h3 className="text-4xl font-bold">{clientStats.length}</h3>
                        </div>
                        <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <p className="text-sm text-purple-100">
                                No período selecionado ({new Date(selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-center items-center text-center">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
                            <Star className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Top Origem</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {originData.length > 0 ? originData[0].name : '-'}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                            {originData.length > 0 ? (
                                chartMetric === 'volume'
                                    ? `${originData[0].volume} clientes`
                                    : `€ ${originData[0].revenue.toFixed(2)}`
                            ) : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Client List Table */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Detalhamento de Clientes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4 text-center">Visitas</th>
                                <th className="p-4 text-center">Total Gasto</th>
                                <th className="p-4 text-center">Última Visita</th>
                                <th className="p-4 text-center">Origem Principal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {clientStats.slice(0, 20).map((client, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">{client.name}</td>
                                    <td className="p-4 text-center text-slate-600">{client.visits}</td>
                                    <td className="p-4 text-center font-bold text-green-600">€ {client.totalSpent.toFixed(2)}</td>
                                    <td className="p-4 text-center text-slate-500 text-sm">
                                        {new Date(client.lastVisit).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
                                            {client.topOrigin}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {clientStats.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">
                                        Nenhum cliente encontrado para os filtros selecionados.
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

export default ClientAnalytics;
