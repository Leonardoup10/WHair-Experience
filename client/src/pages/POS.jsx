import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingBag, CheckCircle, Scissors, Package, User, CreditCard, DollarSign, Users, Plus, X } from 'lucide-react';

const POS = () => {
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        professional_id: '',
        type: 'SERVICE', // SERVICE or PRODUCT
        item_id: '',
        sale_price: '',
        client_name: '',
        client_origin: 'Passante',
        payment_method: 'Numerário',
        tip_amount: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profRes, servRes, prodRes] = await Promise.all([
                api.get('/professionals'),
                api.get('/services'),
                api.get('/products')
            ]);
            setProfessionals(profRes.data);
            setServices(servRes.data);
            setProducts(prodRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleItemSelect = (item) => {
        setFormData({
            ...formData,
            item_id: item.id,
            sale_price: item.price // Set default price, but allow override
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await api.post('/sales', {
                professional_id: formData.professional_id,
                type: formData.type,
                item_id: formData.item_id,
                sale_price: formData.sale_price,
                client_name: formData.client_name,
                client_origin: formData.client_origin,
                payment_method: formData.payment_method,
                tip_amount: formData.tip_amount
            });
            setSuccess(true);
            // Reset form but keep professional selected for convenience
            setFormData({
                ...formData,
                item_id: '',
                sale_price: '',
                client_name: '',
                client_origin: 'Passante',
                payment_method: 'Numerário',
                tip_amount: ''
            });
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error registering sale:', error);
            alert('Erro ao registrar venda');
        } finally {
            setLoading(false);
        }
    };

    const currentItems = formData.type === 'SERVICE' ? services : products;



    const [showServiceModal, setShowServiceModal] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '' });

    const handleCreateService = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/services', newService);
            setServices([res.data, ...services]);
            setFormData({
                ...formData,
                item_id: res.data.id,
                sale_price: res.data.price
            });
            setShowServiceModal(false);
            setNewService({ name: '', price: '' });
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Erro ao criar serviço');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Service Creation Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-xl">Novo Serviço</h3>
                            <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateService} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Serviço</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    placeholder="Ex: Corte Degradê"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preço (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-pink-600 text-white p-3 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
                            >
                                Salvar e Selecionar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-pink-500" />
                        Movimentação Profissional
                    </h2>
                    <p className="text-slate-300 mt-2 text-lg">Registo de serviços prestados e produtos vendidos.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* 1. Professional Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4" /> 1. Selecione o Profissional
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {professionals.filter(p => p.active).map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setFormData({ ...formData, professional_id: p.id })}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 text-center ${Number(formData.professional_id) === p.id
                                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md scale-[1.02]'
                                        : 'border-slate-100 hover:border-pink-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${Number(formData.professional_id) === p.id ? 'bg-pink-200 text-pink-700' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                        {p.name.charAt(0)}
                                    </div>
                                    <span className="font-medium">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Client & Payment Info */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4" /> 2. Dados do Cliente e Pagamento
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Cliente</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    placeholder="Ex: Maria Silva"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Origem</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    value={formData.client_origin}
                                    onChange={(e) => setFormData({ ...formData, client_origin: e.target.value })}
                                >
                                    <option value="Passante">Passante</option>
                                    <option value="Indicação">Indicação</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Google">Google</option>
                                    <option value="Cliente Antigo">Cliente Antigo</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Pagamento</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    value={formData.payment_method}
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                >
                                    <option value="Numerário">Numerário</option>
                                    <option value="Multibanco">Multibanco</option>
                                    <option value="Teya">Teya</option>
                                    <option value="MBWAY">MBWAY</option>
                                    <option value="Transferência">Transferência</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Gorjeta (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    placeholder="0.00"
                                    value={formData.tip_amount}
                                    onChange={(e) => setFormData({ ...formData, tip_amount: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Type Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Package className="w-4 h-4" /> 3. Tipo de Registo
                        </label>
                        <div className="grid grid-cols-2 gap-6">
                            <button
                                type="button"
                                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${formData.type === 'SERVICE'
                                    ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                    : 'border-slate-100 hover:border-pink-200 hover:bg-slate-50 text-slate-500'
                                    }`}
                                onClick={() => setFormData({ ...formData, type: 'SERVICE', item_id: '', sale_price: '' })}
                            >
                                <Scissors className="w-5 h-5" />
                                <span className="font-bold">Serviço</span>
                            </button>

                            <button
                                type="button"
                                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${formData.type === 'PRODUCT'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-500'
                                    }`}
                                onClick={() => setFormData({ ...formData, type: 'PRODUCT', item_id: '', sale_price: '' })}
                            >
                                <Package className="w-5 h-5" />
                                <span className="font-bold">Produto</span>
                            </button>
                        </div>
                    </div>

                    {/* 4. Item Selection & Price Override */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> 4. Selecione o Item e Confirme o Valor
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto p-1">
                            {/* Create New Item Card */}
                            {formData.type === 'SERVICE' && (
                                <div
                                    onClick={() => setShowServiceModal(true)}
                                    className="cursor-pointer p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-pink-600 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-pink-200 flex items-center justify-center transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Novo Serviço</span>
                                </div>
                            )}

                            {currentItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemSelect(item)}
                                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex justify-between items-center ${Number(formData.item_id) === item.id
                                        ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500'
                                        : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="font-medium text-slate-700">{item.name}</span>
                                    <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                                        € {Number(item.price).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Price Override Input */}
                        {formData.item_id && (
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-4 animate-fade-in">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor Final da Venda (€)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-all font-bold text-lg text-slate-800"
                                                value={formData.sale_price}
                                                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">
                                            * Você pode alterar este valor se necessário.
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <button
                                            type="submit"
                                            disabled={loading || !formData.professional_id || !formData.item_id}
                                            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 h-[52px]"
                                        >
                                            {loading ? 'Processando...' : (
                                                <>
                                                    <CheckCircle className="w-6 h-6" />
                                                    Confirmar Venda
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {success && (
                        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in z-50">
                            <div className="bg-white/20 p-1 rounded-full">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold">Sucesso!</p>
                                <p className="text-sm text-green-50">Venda registrada corretamente.</p>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default POS;
