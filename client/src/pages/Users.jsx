import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, UserPlus, Trash2, Edit, Shield, Check, X, Lock } from 'lucide-react';

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'matrix'
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'RECEPCAO'
    });
    const [editingId, setEditingId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const dataToUpdate = { ...formData };
                if (!dataToUpdate.password) delete dataToUpdate.password;
                await api.put(`/users/${editingId}`, dataToUpdate);
            } else {
                await api.post('/users', formData);
            }
            fetchUsers();
            resetForm();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Erro ao salvar usuário');
        }
    };

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role
        });
        setEditingId(user.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'RECEPTION' });
        setEditingId(null);
        setShowForm(false);
        setShowPassword(false);
    };

    // Permissions Data
    const permissions = [
        { feature: 'Movimentação Profissional (POS)', admin: true, manager: true, recepcao: true },
        { feature: 'Fluxo de Caixa', admin: true, manager: true, recepcao: true },
        { feature: 'Fechamento Diário', admin: true, manager: true, recepcao: true },
        { feature: 'Dashboard Completo', admin: true, manager: true, recepcao: false },
        { feature: 'Análise de Clientes', admin: true, manager: true, recepcao: false },
        { feature: 'Gestão de Profissionais', admin: true, manager: true, recepcao: false },
        { feature: 'Catálogo (Serviços/Produtos)', admin: true, manager: true, recepcao: false },
        { feature: 'Gestão de Usuários', admin: true, manager: false, recepcao: false },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-slate-600" />
                        Gestão de Acesso
                    </h2>
                    <p className="text-slate-500">Gerencie usuários e suas permissões.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Usuários
                    </button>
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'matrix' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Matriz de Permissões
                    </button>
                </div>
            </div>

            {activeTab === 'list' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-slate-800">
                                    {editingId ? 'Editar Usuário' : 'Novo Usuário'}
                                </h3>
                                {editingId && (
                                    <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600">
                                        Cancelar
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Senha {editingId && '(Deixe em branco para manter)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!editingId}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? 'Ocultar' : 'Mostrar'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nível de Acesso</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="RECEPTION">Recepção</option>
                                        <option value="MANAGER">Gerente</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition-transform active:scale-[0.98] shadow-lg"
                                >
                                    {editingId ? 'Atualizar' : 'Criar Usuário'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4 text-left">Usuário</th>
                                            <th className="p-4 text-left">Email</th>
                                            <th className="p-4 text-center">Acesso</th>
                                            <th className="p-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-bold text-slate-700">{u.name}</td>
                                                <td className="p-4 text-slate-600">{u.email}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                        u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(u)}
                                                            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        {currentUser?.id !== u.id && (
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'matrix' && (
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                    <div className="p-8 text-center border-b border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800">Matriz de Permissões</h3>
                        <p className="text-slate-500 mt-2">Visualize o que cada nível de acesso pode fazer no sistema.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4 text-left w-1/3">Funcionalidade</th>
                                    <th className="p-4 text-center w-1/5 text-purple-600">Admin</th>
                                    <th className="p-4 text-center w-1/5 text-blue-600">Manager</th>
                                    <th className="p-4 text-center w-1/5 text-green-600">Recepcao</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {permissions.map((p, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{p.feature}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center">
                                                {p.admin ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-300" />}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center">
                                                {p.manager ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-300" />}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center">
                                                {p.recepcao ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-300" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
                        <p className="flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" />
                            As permissões são definidas globalmente pelo sistema. Para alterações, contate o suporte técnico.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
