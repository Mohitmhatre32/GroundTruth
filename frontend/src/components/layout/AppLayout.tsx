import { ReactNode, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, FlaskConical, AlertTriangle, Bell, Search, User, FileText, Activity, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../AnimatedBackground';

const AppLayout = () => {
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-transparent font-sans text-textMain overflow-hidden relative">
            {/* Animated Background */}
            <AnimatedBackground />
            <motion.aside
                className="hidden md:flex bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex-col shadow-sm z-10"
                initial={{ width: '75px' }}
                animate={{ width: sidebarOpen ? '256px' : '75px' }}
                onMouseEnter={() => setSidebarOpen(true)}
                onMouseLeave={() => setSidebarOpen(false)}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-100/50">
                    <motion.h1
                        className="text-2xl font-bold text-primary tracking-tight overflow-hidden whitespace-nowrap"
                        animate={{
                            opacity: sidebarOpen ? 1 : 0,
                            display: sidebarOpen ? 'block' : 'none'
                        }}
                    >
                        GroundTruth
                    </motion.h1>
                    {!sidebarOpen && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            G
                        </div>
                    )}
                    <motion.p
                        className="text-xs text-textMuted mt-1"
                        animate={{
                            opacity: sidebarOpen ? 1 : 0,
                            display: sidebarOpen ? 'block' : 'none'
                        }}
                    >
                        Groundwater Resource Eval
                    </motion.p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Command Center" isOpen={sidebarOpen} />
                    <NavItem to="/real-time" icon={<Activity size={20} />} label="Real Time Center" isOpen={sidebarOpen} />
                    <NavItem to="/simulation" icon={<FlaskConical size={20} />} label="Simulation Lab" isOpen={sidebarOpen} />

                    {sidebarOpen && (
                        <div className="pt-4 pb-2">
                            <p className="px-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Analytics</p>
                        </div>
                    )}

                    <NavItem to="/analytics" icon={<LineChart size={20} />} label="Analytics & Forecasting" isOpen={sidebarOpen} />
                    <NavItem to="/policy" icon={<Shield size={20} />} label="Policy & Regulation" isOpen={sidebarOpen} />

                    {sidebarOpen && (
                        <div className="pt-4 pb-2">
                            <p className="px-3 text-xs font-semibold text-textMuted uppercase tracking-wider">System</p>
                        </div>
                    )}

                    <NavItem to="/reports" icon={<FileText size={20} />} label="Reports" isOpen={sidebarOpen} />
                    <NavItem to="/alerts" icon={<AlertTriangle size={20} />} label="Alerts" isOpen={sidebarOpen} />
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-100/50 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {user?.name ? user.name.charAt(0) : 'U'}
                        </div>
                        <motion.div
                            className="flex-1 min-w-0"
                            animate={{
                                opacity: sidebarOpen ? 1 : 0,
                                display: sidebarOpen ? 'block' : 'none'
                            }}
                        >
                            <p className="text-sm font-medium text-textMain truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-textMuted truncate">{user?.role || 'Official'}</p>
                        </motion.div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                        <User size={16} className="shrink-0" />
                        <motion.span
                            animate={{
                                opacity: sidebarOpen ? 1 : 0,
                                display: sidebarOpen ? 'inline-block' : 'none'
                            }}
                        >
                            Log Out
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
                            className="fixed inset-0 bg-white dark:bg-neutral-900 z-[100] flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-primary tracking-tight">GroundTruth</h1>
                                <button onClick={() => setMobileSidebarOpen(false)} className="p-2">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Command Center" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
                                <NavItem to="/real-time" icon={<Activity size={20} />} label="Real Time Center" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
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
                                <NavItem to="/alerts" icon={<AlertTriangle size={20} />} label="Alerts" isOpen={true} onClick={() => setMobileSidebarOpen(false)} />
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
                {/* Top Header */}
                <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm z-10">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setMobileSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

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

const NavItem = ({ to, icon, label, isOpen, onClick }: { to: string, icon: ReactNode, label: string, isOpen: boolean, onClick?: () => void }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-textMuted hover:bg-gray-50 hover:text-textMain'
                }`
            }
        >
            <span className="shrink-0">{icon}</span>
            <motion.span
                animate={{
                    opacity: isOpen ? 1 : 0,
                    display: isOpen ? 'inline-block' : 'none'
                }}
                className="whitespace-pre group-hover:translate-x-1 transition-transform duration-150"
            >
                {label}
            </motion.span>
        </NavLink>
    );
};

export default AppLayout;
