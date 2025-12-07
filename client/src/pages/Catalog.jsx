import React, { useState, useEffect } from 'react';
import api from '../api';
import { Package, Scissors, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Catalog = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('services'); // services | products
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ name: '', price: '', stock: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchItems();
        handleCancel(); // Reset form when switching tabs
    }, [activeTab]);

    const fetchItems = async () => {
        try {
            const endpoint = activeTab === 'services' ? 'services' : 'products';
            const res = await api.get(`/${endpoint}`);
            setItems(res.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = activeTab === 'services' ? 'services' : 'products';
            const dataToSend = { ...formData, updated_by: user?.id };

            if (editingId) {
                await api.put(`/${endpoint}/${editingId}`, dataToSend);
            } else {
                await api.post(`/${endpoint}`, dataToSend);
            }

            handleCancel();
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            price: item.price,
            stock: item.stock || ''
        });
        setEditingId(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este item?')) {
            try {
                const endpoint = activeTab === 'services' ? 'services' : 'products';
                await api.delete(`/${endpoint}/${id}`);
                fetchItems();
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Erro ao deletar item');
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', price: '', stock: '' });
        setEditingId(null);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Catálogo</h2>
                <p className="text-slate-500">Gerencie seus serviços e produtos.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Form */}
                <div className="w-full md:w-1/3">
                    <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 sticky top-24">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
                            <div className={`p-2 rounded-lg ${activeTab === 'services' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                            {editingId ? 'Editar Item' : 'Novo Item'}
                            {editingId && (
                                <button
                                    onClick={handleCancel}
                                    className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </h3>

                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            <button
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'services' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                onClick={() => setActiveTab('services')}
                            >
                                Serviço
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                onClick={() => setActiveTab('products')}
                            >
                                Produto
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    placeholder={activeTab === 'services' ? 'Ex: Corte Masculino' : 'Ex: Shampoo Reparador'}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            {activeTab === 'products' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estoque Inicial</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white p-3 rounded-xl font-bold transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${activeTab === 'services'
                                    ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-500/20'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                    }`}
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="w-full md:w-2/3">
                    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">
                                Lista de {activeTab === 'services' ? 'Serviços' : 'Produtos'}
                            </h3>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="bg-transparent text-sm outline-none w-32"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {filteredItems.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === 'services' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'
                                            }`}>
                                            {activeTab === 'services' ? <Scissors className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-400">ID: #{item.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">€ {Number(item.price).toFixed(2)}</p>
                                            {activeTab === 'products' && (
                                                <p className="text-xs text-slate-500">{item.stock} un.</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                                    <Package className="w-12 h-12 opacity-20" />
                                    <p>Nenhum item encontrado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Catalog;
