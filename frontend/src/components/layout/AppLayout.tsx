import { ReactNode, useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, FlaskConical, AlertTriangle, User, FileText, Activity, Shield, Menu, X, Droplets, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../AnimatedBackground';

const AppLayout = () => {
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [hasCriticalAlert, setHasCriticalAlert] = useState(false);

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const alerts = await import('../../services/api').then(m => m.getAlerts());
                const critical = alerts.some(a => a.type.toLowerCase() === 'critical');
                setHasCriticalAlert(critical);
            } catch (error) {
                console.error('Failed to fetch alerts in layout:', error);
            }
        };
        checkAlerts();
        const interval = setInterval(checkAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-transparent font-sans text-textMain overflow-hidden relative">
            {/* Animated Background */}
            <AnimatedBackground />
            <motion.aside
                className="hidden md:flex bg-[#0a1f29] flex-col z-20 border-r border-slate-800 shadow-2xl"
                initial={{ width: '75px' }}
                animate={{ width: sidebarOpen ? '260px' : '75px' }}
                onMouseEnter={() => setSidebarOpen(true)}
                onMouseLeave={() => setSidebarOpen(false)}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {/* Logo Section - Dark Mode */}
                <div className="p-6 border-b border-white/5">
                    <motion.div
                        className="flex items-center gap-3"
                        animate={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
                    >
                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                            <Droplets size={20} strokeWidth={2.5} />
                        </div>
                        <motion.h1
                            className="text-x font-black text-white tracking-widest uppercase overflow-hidden whitespace-nowrap"
                            animate={{
                                opacity: sidebarOpen ? 1 : 0,
                                display: sidebarOpen ? 'block' : 'none'
                            }}
                        >
                            GroundTruth
                        </motion.h1>
                    </motion.div>
                </div>

                {/* Navigation - Dark Mode Styling */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden pt-8">
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Command Center" isOpen={sidebarOpen} />
                    <NavItem to="/real-time" icon={<Activity size={18} />} label="Live Station Feed" isOpen={sidebarOpen} />
                    <NavItem to="/vegetation" icon={<Leaf size={18} />} label="Vegetation Analysis" isOpen={sidebarOpen} />
                    <NavItem to="/simulation" icon={<FlaskConical size={18} />} label="Simulation Lab" isOpen={sidebarOpen} />

                    {sidebarOpen && (
                        <div className="pt-6 pb-2">
                            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Analytics</p>
                        </div>
                    )}

                    <NavItem to="/analytics" icon={<LineChart size={18} />} label="Forecasting" isOpen={sidebarOpen} />
                    <NavItem to="/policy" icon={<Shield size={18} />} label="Regulations" isOpen={sidebarOpen} />

                    {sidebarOpen && (
                        <div className="pt-6 pb-2">
                            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Intelligence</p>
                        </div>
                    )}

                    <NavItem to="/reports" icon={<FileText size={18} />} label="Archived Reports" isOpen={sidebarOpen} />
                    <NavItem
                        to="/alerts"
                        icon={<AlertTriangle size={18} />}
                        label="System Alerts"
                        isOpen={sidebarOpen}
                        isBlinking={hasCriticalAlert}
                    />
                </nav>

                {/* User Section - Dark Mode Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg shadow-primary/20">
                            {user?.name ? user.name.charAt(0) : 'U'}
                        </div>
                        <motion.div
                            className="flex-1 min-w-0"
                            animate={{
                                opacity: sidebarOpen ? 1 : 0,
                                display: sidebarOpen ? 'block' : 'none'
                            }}
                        >
                            <p className="text-xs font-black text-white truncate uppercase tracking-tight">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">{user?.role || 'Super Admin'}</p>
                        </motion.div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all group"
                    >
                        <User size={14} className="shrink-0 group-hover:scale-110 transition-transform" />
                        <motion.span
                            animate={{
                                opacity: sidebarOpen ? 1 : 0,
                                display: sidebarOpen ? 'inline-block' : 'none'
                            }}
                        >
                            Sign Out
                        </motion.span>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <AnimatePresence>
                    {mobileSidebarOpen && (
                        <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[100] flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-primary tracking-tight">GroundTruth</h1>
                                <button onClick={() => setMobileSidebarOpen(false)} className="p-2">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Command Center" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
                                <NavItem to="/real-time" icon={<Activity size={20} />} label="Live Station Feed" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
                                <NavItem to="/vegetation" icon={<Leaf size={20} />} label="Vegetation Analysis" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
                                <NavItem to="/simulation" icon={<FlaskConical size={20} />} label="Simulation Lab" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />

                                <div className="pt-4 pb-2">
                                    <p className="px-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Analytics</p>
                                </div>

                                <NavItem to="/analytics" icon={<LineChart size={20} />} label="Analytics & Forecasting" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
                                <NavItem to="/policy" icon={<Shield size={20} />} label="Policy & Regulation" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />

                                <div className="pt-4 pb-2">
                                    <p className="px-3 text-xs font-semibold text-textMuted uppercase tracking-wider">System</p>
                                </div>

                                <NavItem to="/reports" icon={<FileText size={20} />} label="Reports" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
                                <NavItem
                                    to="/alerts"
                                    icon={<AlertTriangle size={20} />}
                                    label="Alerts"
                                    isOpen={true}
                                    onClick={() => setMobileSidebarOpen(false)}
                                    isBlinking={hasCriticalAlert}
                                />
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                {/* Top Header - Sharp & Solid */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setMobileSidebarOpen(true)}
                    >
                        <Menu size={20} className="text-slate-600" />
                    </button>

                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <h1 className="text-xl font-bold text-primary tracking-tight">GroundTruth</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Bell icon removed */}
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

const NavItem = ({ to, icon, label, isOpen, onClick, isBlinking }: { to: string, icon: ReactNode, label: string, isOpen: boolean, onClick?: () => void, isBlinking?: boolean }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 group ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : isBlinking
                        ? 'bg-danger/20 text-danger animate-pulse shadow-lg shadow-danger/20'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`
            }
        >
            <span className={`shrink-0 transition-transform group-hover:scale-110 ${isBlinking ? 'animate-bounce' : ''}`}>{icon}</span>
            <motion.span
                animate={{
                    opacity: isOpen ? 1 : 0,
                    display: isOpen ? 'inline-block' : 'none'
                }}
                className="whitespace-pre transition-all"
            >
                {label}
            </motion.span>
        </NavLink>
    );
};

export default AppLayout;
