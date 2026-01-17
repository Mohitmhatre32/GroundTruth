import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, MapPin, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { getMapClassification, ClassificationResult } from '../services/api';

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
                const data: ClassificationResult[] = await getMapClassification();

                // Generate alerts from station data
                const generatedAlerts: Alert[] = data.map(station => {
                    let type: Alert['type'] = 'info';
                    let message = '';

                    if (station.status === 'Critical') {
                        type = 'critical';
                        message = `CRITICAL: Water level at ${station.baseline_level.toFixed(1)}m - Immediate attention required!`;
                    } else if (station.status === 'Semi-Critical') {
                        type = 'warning';
                        message = `WARNING: Water level at ${station.baseline_level.toFixed(1)}m - Monitoring recommended`;
                    } else {
                        type = 'success';
                        message = `Water level stable at ${station.baseline_level.toFixed(1)}m - Normal operation`;
                    }

                    return {
                        id: station.id,
                        stationName: station.name,
                        type,
                        message,
                        waterLevel: station.baseline_level,
                        timestamp: new Date().toLocaleString(),
                        location: `${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}`
                    };
                });

                setAlerts(generatedAlerts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching alerts:', error);
                toast.error('Failed to load alerts');
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
            gradient: 'from-red-500/10 via-rose-500/5 to-transparent',
            border: 'border-red-200/50',
            bg: 'bg-gradient-to-br from-red-50 to-rose-50/30',
            iconColor: 'text-danger'
        },
        warning: {
            icon: AlertCircle,
            gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
            border: 'border-amber-200/50',
            bg: 'bg-gradient-to-br from-amber-50 to-yellow-50/30',
            iconColor: 'text-warning'
        },
        info: {
            icon: Info,
            gradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
            border: 'border-blue-200/50',
            bg: 'bg-gradient-to-br from-blue-50 to-cyan-50/30',
            iconColor: 'text-primary'
        },
        success: {
            icon: CheckCircle,
            gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
            border: 'border-emerald-200/50',
            bg: 'bg-gradient-to-br from-emerald-50 to-green-50/30',
            iconColor: 'text-success'
        }
    };

    const alertConfig = config[alert.type];
    const Icon = alertConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${alertConfig.bg} border ${alertConfig.border} rounded-xl p-6 shadow-sm hover:shadow-md transition-all`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${alertConfig.bg} border ${alertConfig.border}`}>
                    <Icon className={`w-6 h-6 ${alertConfig.iconColor}`} />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {alert.stationName}
                            </h3>
                            <p className={`text-sm mt-1 ${alert.type === 'critical' ? 'text-danger font-semibold' :
                                alert.type === 'warning' ? 'text-warning font-semibold' :
                                    'text-textMuted'
                                }`}>
                                {alert.message}
                            </p>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${alert.type === 'critical' ? 'bg-danger/20 text-danger' :
                            alert.type === 'warning' ? 'bg-warning/20 text-warning' :
                                alert.type === 'success' ? 'bg-success/20 text-success' :
                                    'bg-primary/20 text-primary'
                            }`}>
                            {alert.type}
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-textMuted mt-3">
                        <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            <span>{alert.waterLevel.toFixed(1)}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{alert.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">{alert.location}</span>
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
