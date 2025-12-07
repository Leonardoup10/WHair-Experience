import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Calendar, Star, TrendingUp } from 'lucide-react';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/sales');
            const sales = res.data;

            // Process sales to extract unique clients
            const clientMap = {};

            sales.forEach(sale => {
                const name = sale.client_name || 'Cliente Não Identificado';
                if (name === 'Cliente Não Identificado') return;

                if (!clientMap[name]) {
                    clientMap[name] = {
                        name,
                        totalSpent: 0,
                        visits: 0,
                        lastVisit: sale.date,
                        origins: {},
                        professionals: {}
                    };
                }

                const client = clientMap[name];
                client.totalSpent += Number(sale.sale_price);
                client.visits += 1;

                if (new Date(sale.date) > new Date(client.lastVisit)) {
                    client.lastVisit = sale.date;
                }

                // Count origins
                const origin = sale.client_origin || 'Desconhecido';
                client.origins[origin] = (client.origins[origin] || 0) + 1;

                // Count professionals
                const profName = sale.Professional?.name || 'Desconhecido';
                client.professionals[profName] = (client.professionals[profName] || 0) + 1;
            });

            const clientList = Object.values(clientMap).map(c => {
                // Find top origin
                const topOrigin = Object.entries(c.origins).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Desconhecido';
                // Find favorite professional
                const favProf = Object.entries(c.professionals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Desconhecido';

                return {
                    ...c,
                    topOrigin,
                    favProf
                };
            });

            // Sort by last visit (most recent first)
            clientList.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));

            setClients(clientList);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-slate-800" />
                        Clientes
                    </h2>
                    <p className="text-slate-500">Lista de clientes baseada no histórico de vendas.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Última Visita</th>
                                <th className="p-4 text-center">Visitas</th>
                                <th className="p-4 text-right">Total Gasto</th>
                                <th className="p-4">Origem Principal</th>
                                <th className="p-4">Profissional Favorito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredClients.map((client, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">{client.name}</td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(client.lastVisit).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                                            {client.visits}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-800">
                                        € {client.totalSpent.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-400" />
                                            {client.topOrigin}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            {client.favProf}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">
                                        Nenhum cliente encontrado.
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

export default Clients;
