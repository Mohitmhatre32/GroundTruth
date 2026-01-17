import { ReactNode } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, FlaskConical, Settings, Bell, Search, User, FileText, Activity } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
    const { logout, user } = useAuth();

    return (
        <div className="flex h-screen bg-transparent font-sans text-textMain overflow-hidden">
            {/* Sidebar with Glass Effect */}
            <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-gray-100/50">
                    <h1 className="text-2xl font-bold text-primary tracking-tight">GroundTruth</h1>
                    <p className="text-xs text-textMuted mt-1">Groundwater Resource Eval</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Command Center" />
                    <NavItem to="/real-time" icon={<Activity size={20} />} label="Real Time Center" />
                    <NavItem to="/simulation" icon={<FlaskConical size={20} />} label="Simulation Lab" />
                    <div className="pt-4 pb-2">
                        <p className="px-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Analytics</p>
                    </div>
                    {/* Updated analytics link */}
                    <NavItem to="/analytics" icon={<LineChart size={20} />} label="Analytics & Forecasting" />

                    <div className="pt-4 pb-2">
                        <p className="px-3 text-xs font-semibold text-textMuted uppercase tracking-wider">System</p>
                    </div>
                    <NavItem to="/reports" icon={<FileText size={20} />} label="Reports" />
                    <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>


                <div className="p-4 border-t border-gray-100/50 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user?.name ? user.name.charAt(0) : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-textMain truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-textMuted truncate">{user?.role || 'Official'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                        <User size={16} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                {/* Top Header with Glass Effect */}
                <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                            <input
                                type="text"
                                placeholder="Search Station, District, or Alert..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-gray-100 text-textMuted hover:text-primary transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label }: { to: string, icon: ReactNode, label: string }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-textMuted hover:bg-gray-50 hover:text-textMain'
                }`
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
};

export default AppLayout;
