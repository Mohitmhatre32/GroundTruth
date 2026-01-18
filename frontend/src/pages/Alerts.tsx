import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, MapPin, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { getAlerts, AlertRecord } from '../services/api';

interface Alert {
    id: string;
    stationName: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    message: string;
    waterLevel: number;
    timestamp: string;
    location: string;
}

const Alerts = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data: AlertRecord[] = await getAlerts();

                // Map backend alerts to frontend local state
                const mappedAlerts: Alert[] = data.map(record => {
                    const typeLower = record.type.toLowerCase();
                    let type: Alert['type'] = 'info';

                    if (typeLower === 'critical') type = 'critical';
                    else if (typeLower === 'warning') type = 'warning';
                    else if (typeLower === 'success') type = 'success';

                    return {
                        id: record.alert_id,
                        stationName: record.location,
                        type,
                        message: record.message,
                        waterLevel: record.water_level,
                        timestamp: new Date(record.timestamp).toLocaleString(),
                        location: record.location
                    };
                });

                setAlerts(mappedAlerts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching alerts:', error);
                toast.error('Failed to load real alerts');
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(alert => alert.type === filter);

    const criticalCount = alerts.filter(a => a.type === 'critical').length;
    const warningCount = alerts.filter(a => a.type === 'warning').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <motion.div
                        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-textMuted font-medium">Loading alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 min-h-full pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        System Alerts
                    </h1>
                    <p className="text-textMuted">
                        Real-time monitoring alerts from all stations
                    </p>
                </div>

                <div className="flex gap-3">
                    {criticalCount > 0 && (
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-4 py-2 rounded-full bg-danger/10 text-danger border border-danger/20 font-semibold text-sm"
                        >
                            {criticalCount} Critical
                        </motion.div>
                    )}
                    {warningCount > 0 && (
                        <div className="px-4 py-2 rounded-full bg-warning/10 text-warning border border-warning/20 font-semibold text-sm">
                            {warningCount} Warnings
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex gap-3">
                <FilterButton
                    label="All"
                    count={alerts.length}
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                />
                <FilterButton
                    label="Critical"
                    count={criticalCount}
                    active={filter === 'critical'}
                    onClick={() => setFilter('critical')}
                    color="danger"
                />
                <FilterButton
                    label="Warning"
                    count={warningCount}
                    active={filter === 'warning'}
                    onClick={() => setFilter('warning')}
                    color="warning"
                />
                <FilterButton
                    label="Normal"
                    count={alerts.filter(a => a.type === 'success').length}
                    active={filter === 'info'}
                    onClick={() => setFilter('info')}
                    color="success"
                />
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Info className="w-12 h-12 text-textMuted mx-auto mb-3" />
                        <p className="text-textMuted">No alerts found for this filter</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert, index) => (
                        <AlertCard key={alert.id} alert={alert} index={index} />
                    ))
                )}
            </div>
        </div>
    );
};

// Alert Card Component
const AlertCard = ({ alert, index }: { alert: Alert; index: number }) => {
    const config = {
        critical: {
            icon: AlertTriangle,
            accent: 'border-l-danger',
            iconBg: 'bg-danger/10 text-danger',
            subText: 'text-danger'
        },
        warning: {
            icon: AlertCircle,
            accent: 'border-l-warning',
            iconBg: 'bg-warning/10 text-warning',
            subText: 'text-warning'
        },
        info: {
            icon: Info,
            accent: 'border-l-primary',
            iconBg: 'bg-primary/10 text-primary',
            subText: 'text-primary'
        },
        success: {
            icon: CheckCircle,
            accent: 'border-l-success',
            iconBg: 'bg-success/10 text-success',
            subText: 'text-success'
        }
    };

    const alertConfig = config[alert.type];
    const Icon = alertConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`surface-card border-l-4 ${alertConfig.accent} p-4 md:p-6 group`}
        >
            <div className="flex flex-col md:flex-row items-start gap-5">
                {/* Fixed Icon Container - Sharp & Industrial */}
                <div className={`flex-shrink-0 p-3 rounded-xl ${alertConfig.iconBg} border border-white/40 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                {alert.stationName}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                {alert.id.substring(0, 6)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={12} />
                                {alert.timestamp}
                            </span>
                            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${alertConfig.iconBg}`}>
                                {alert.type}
                            </div>
                        </div>
                    </div>

                    <p className={`text-sm leading-relaxed ${alertConfig.subText} font-medium opacity-90`}>
                        {alert.message}
                    </p>

                    {/* Metadata Row - Grounded Style */}
                    <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="p-1.5 rounded-lg glass-dark">
                                <Droplets size={14} className="text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Level</span>
                                <span className="text-xs font-black text-slate-700">{alert.waterLevel.toFixed(1)}m</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="p-1.5 rounded-lg glass-dark">
                                <MapPin size={14} className="text-slate-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Coordinates</span>
                                <span className="text-xs font-mono text-slate-700">{alert.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Filter Button Component
const FilterButton = ({
    label,
    count,
    active,
    onClick,
    color = 'primary'
}: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    color?: 'primary' | 'danger' | 'warning' | 'success';
}) => {
    const colorConfig = {
        primary: 'bg-primary text-white',
        danger: 'bg-danger text-white',
        warning: 'bg-warning text-white',
        success: 'bg-success text-white'
    };

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${active
                ? `${colorConfig[color]} shadow-md`
                : 'bg-white text-textMuted border border-gray-200 hover:border-gray-300'
                }`}
        >
            {label} ({count})
        </button>
    );
};

export default Alerts;
