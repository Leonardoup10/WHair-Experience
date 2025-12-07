import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, DollarSign, Package, Menu, LogOut, UserCog, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const allMenuItems = [
        { path: '/pos', label: 'Movimentação Profissional', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'RECEPÇÃO'] },
        { path: '/daily', label: 'Fechamento Diário', icon: Calendar, roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'RECEPÇÃO'] },
        { path: '/cashflow', label: 'Fluxo de Caixa', icon: DollarSign, roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'RECEPÇÃO'] },
        { path: '/clients', label: 'Clientes', icon: UserCog, roles: ['ADMIN', 'MANAGER'] },
        { path: '/professionals', label: 'Profissionais', icon: Users, roles: ['ADMIN', 'MANAGER'] },
        { path: '/catalog', label: 'Catálogo', icon: Package, roles: ['ADMIN', 'MANAGER'] },
        { path: '/dashboard', label: 'Dashboard', icon: DollarSign, roles: ['ADMIN', 'MANAGER'] },
        { path: '/hr', label: 'Recursos Humanos', icon: Users, roles: ['ADMIN', 'MANAGER'] },
        { path: '/users', label: 'Gestão de Acesso', icon: UserCog, roles: ['ADMIN'] },
    ];

    // Filter menu by user role
    const menuItems = allMenuItems.filter(item =>
        item.roles.includes(user?.role)
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-glow overflow-hidden p-1">
                        <img src="/WHair.png" alt="W Hair Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-tight">W Hair<br />Experience</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25 translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-sm font-bold">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{user?.name}</p>
                                <p className="text-xs text-slate-400">{user?.role === 'ADMIN' ? 'Administrador' : 'Receção'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-pink-50/50 to-transparent pointer-events-none" />

                <header className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 z-10 sticky top-0">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {menuItems.find((i) => i.path === location.pathname)?.label || 'Bem-vindo'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8 relative z-0">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
