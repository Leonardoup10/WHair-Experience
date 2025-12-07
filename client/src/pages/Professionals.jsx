import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Save, User, Percent, Edit2, Trash2, X, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Professionals = () => {
    const { user } = useAuth();
    const [professionals, setProfessionals] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        service_commission_rate: '',
        product_commission_rate: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const fetchProfessionals = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/professionals');
            setProfessionals(res.data);
        } catch (error) {
            console.error('Error fetching professionals:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert percentage to decimal (0-100 to 0-1)
            const dataToSend = {
                name: formData.name,
                service_commission_rate: formData.service_commission_rate / 100,
                product_commission_rate: formData.product_commission_rate / 100,
                updated_by: user?.id
            };

            if (editingId) {
                await axios.put(`http://localhost:3001/professionals/${editingId}`, dataToSend);
            } else {
                await axios.post(import.meta.env.VITE_API_URL + '/professionals', dataToSend);
            }

            setFormData({ name: '', service_commission_rate: '', product_commission_rate: '' });
            setEditingId(null);
            fetchProfessionals();
        } catch (error) {
            console.error('Error saving professional:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (professional) => {
        setFormData({
            name: professional.name,
            service_commission_rate: (professional.service_commission_rate * 100).toString(),
            product_commission_rate: (professional.product_commission_rate * 100).toString()
        });
        setEditingId(professional.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este profissional?')) {
            try {
                await axios.delete(`http://localhost:3001/professionals/${id}`);
                fetchProfessionals();
            } catch (error) {
                console.error('Error deleting professional:', error);
                alert('Erro ao deletar profissional');
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', service_commission_rate: '', product_commission_rate: '' });
        setEditingId(null);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Profissionais</h2>
                <p className="text-slate-500">Gerencie sua equipe e taxas de comissão.</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                        {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    {editingId ? 'Editar Profissional' : 'Cadastrar Novo Profissional'}
                    {editingId && (
                        <button
                            onClick={handleCancel}
                            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Walter Mesquita"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comissão Serviço (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
                                value={formData.service_commission_rate}
                                onChange={(e) => setFormData({ ...formData, service_commission_rate: e.target.value })}
                                placeholder="Ex: 50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comissão Produto (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
                                value={formData.product_commission_rate}
                                onChange={(e) => setFormData({ ...formData, product_commission_rate: e.target.value })}
                                placeholder="Ex: 10"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
                    </button>
                </form>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((p) => (
                    <div key={p.id} className={`bg-white p-6 rounded-2xl shadow-soft border transition-all group ${p.active ? 'border-slate-100' : 'border-slate-200 opacity-75'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-transform group-hover:scale-110 ${p.active ? 'bg-gradient-to-br from-pink-100 to-rose-200 text-pink-600' : 'bg-slate-100 text-slate-400'}`}>
                                {p.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                                    {!p.active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold">INATIVO</span>}
                                </div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Profissional #{p.id}</p>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await axios.put(`http://localhost:3001/professionals/${p.id}`, { ...p, active: !p.active });
                                        fetchProfessionals();
                                    } catch (error) {
                                        console.error('Error toggling status:', error);
                                    }
                                }}
                                className={`p-2 rounded-xl transition-colors ${p.active ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                                title={p.active ? 'Desativar' : 'Ativar'}
                            >
                                <Power className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Serviços</p>
                                <p className="text-xl font-bold text-slate-800">{(p.service_commission_rate * 100).toFixed(0)}%</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Produtos</p>
                                <p className="text-xl font-bold text-slate-800">{(p.product_commission_rate * 100).toFixed(0)}%</p>
                            </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(p)}
                                className="flex-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                            >
                                <Edit2 className="w-3 h-3" />
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(p.id)}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {professionals.length === 0 && (
                    <div className="col-span-full p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        Nenhum profissional cadastrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Professionals;
