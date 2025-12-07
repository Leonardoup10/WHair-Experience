import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import DailySummary from './pages/DailySummary';
import Sales from './pages/POS';
import Clients from './pages/Clients';
import ClientAnalytics from './pages/ClientAnalytics';
import Catalog from './pages/Catalog';
import Professionals from './pages/Professionals';
import HR from './pages/HR';
import Users from './pages/Users';
import Expenses from './pages/Expenses';
import Vault from './pages/Vault';
import CashFlow from './pages/CashFlow';
import Login from './pages/Login';

// Import icons
import { LayoutDashboard, Calendar, ShoppingBag, Users as UsersIcon, PieChart, Scissors, UserCircle, Briefcase, DollarSign, Lock, Settings, LogOut, TrendingUp } from 'lucide-react';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  if (!user) return <Navigate to="/login" />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: ShoppingBag, label: 'Movimentação Profissional', path: '/sales' },
    { icon: Calendar, label: 'Fechamento Diário', path: '/daily' },
    { icon: TrendingUp, label: 'Fluxo de Caixa', path: '/cash-flow' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: UsersIcon, label: 'Clientes', path: '/clients' },
    { icon: PieChart, label: 'Análise de Clientes', path: '/client-analytics' },
    { icon: Scissors, label: 'Catálogo', path: '/catalog' },
    { icon: UserCircle, label: 'Profissionais', path: '/professionals' },
    { icon: Briefcase, label: 'Recursos Humanos', path: '/hr' },
    { icon: DollarSign, label: 'Despesas', path: '/expenses' },
    { icon: Lock, label: 'Cofre', path: '/vault' },
  ];

  // Filter menu based on role
  const filteredMenu = user?.role === 'RECEPTION'
    ? menuItems.filter(item => ['/', '/daily', '/sales', '/clients', '/catalog'].includes(item.path))
    : menuItems;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full z-20 hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">W Hair</h1>
              <p className="text-xs text-slate-400 font-medium">Experience</p>
            </div>
          </div>

          <nav className="space-y-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20 font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                  {item.label}
                </Link>
              );
            })}

            {user?.role === 'ADMIN' && (
              <Link
                to="/users"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname === '/users'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20 font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Settings className={`w-5 h-5 ${location.pathname === '/users' ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                Gestão de Usuários
              </Link>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10 bg-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold border-2 border-slate-500">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/daily" element={<PrivateRoute><Layout><DailySummary /></Layout></PrivateRoute>} />
          <Route path="/sales" element={<PrivateRoute><Layout><Sales /></Layout></PrivateRoute>} />
          <Route path="/clients" element={<PrivateRoute><Layout><Clients /></Layout></PrivateRoute>} />
          <Route path="/client-analytics" element={<PrivateRoute><Layout><ClientAnalytics /></Layout></PrivateRoute>} />
          <Route path="/catalog" element={<PrivateRoute><Layout><Catalog /></Layout></PrivateRoute>} />
          <Route path="/professionals" element={<PrivateRoute><Layout><Professionals /></Layout></PrivateRoute>} />
          <Route path="/hr" element={<PrivateRoute><Layout><HR /></Layout></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Layout><Expenses /></Layout></PrivateRoute>} />
          <Route path="/cash-flow" element={<PrivateRoute><Layout><CashFlow /></Layout></PrivateRoute>} />
          <Route path="/vault" element={<PrivateRoute><Layout><Vault /></Layout></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['ADMIN']}><Layout><Users /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
