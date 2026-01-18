import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Radio, Waves, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getMapClassification, ClassificationResult } from '../services/api';

interface Station {
    id: string;
    name: string;
    waterLevel: number;
    status: 'safe' | 'warning' | 'critical';
    lat: number;
    lng: number;
    trend?: 'up' | 'down' | 'stable';
    lastUpdated?: string;
}

const RealTimeCenter = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: ClassificationResult[] = await getMapClassification();

                const transformedStations: Station[] = data.map(station => ({
                    id: station.id,
                    name: station.name,
                    waterLevel: station.baseline_level,
                    status: station.status === 'Safe' ? 'safe' :
                        station.status === 'Semi-Critical' ? 'warning' : 'critical',
                    lat: station.lat,
                    lng: station.lng,
                    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
                    lastUpdated: new Date().toLocaleTimeString()
                }));

                setStations(transformedStations);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching stations:', error);
                toast.error('Failed to load station data');
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15s
        return () => clearInterval(interval);
    }, []);

    const criticalCount = stations.filter(s => s.status === 'critical').length;
    const warningCount = stations.filter(s => s.status === 'warning').length;
    const safeCount = stations.filter(s => s.status === 'safe').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <motion.div
                        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-textMuted font-medium">Loading real-time data...</p>
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
                        Real-Time Monitoring Center
                    </h1>
                    <p className="text-textMuted flex items-center gap-2">
                        <Radio className="w-4 h-4 text-success animate-pulse" />
                        Live updates every 15 seconds
                    </p>
                </div>

                <div className="flex gap-3">
                    <StatusBadge label="Critical" count={criticalCount} color="danger" />
                    <StatusBadge label="Warning" count={warningCount} color="warning" />
                    <StatusBadge label="Safe" count={safeCount} color="success" />
                </div>
            </motion.div>

            {/* Station Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stations.map((station, index) => (
                    <StationCard
                        key={station.id}
                        station={station}
                        index={index}
                        isSelected={selectedStation === station.id}
                        onClick={() => setSelectedStation(station.id === selectedStation ? null : station.id)}
                    />
                ))}
            </div>
        </div>
    );
};

// Enhanced Station Card Component
const StationCard = ({
    station,
    index,
    isSelected,
    onClick
}: {
    station: Station;
    index: number;
    isSelected: boolean;
    onClick: () => void;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const statusConfig = {
        safe: {
            gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
            border: 'border-emerald-200/50',
            glow: 'shadow-emerald-500/20',
            icon: 'text-success',
            bg: 'bg-gradient-to-br from-emerald-50 to-green-50/30'
        },
        warning: {
            gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
            border: 'border-amber-200/50',
            glow: 'shadow-amber-500/20',
            icon: 'text-warning',
            bg: 'bg-gradient-to-br from-amber-50 to-yellow-50/30'
        },
        critical: {
            gradient: 'from-red-500/10 via-rose-500/5 to-transparent',
            border: 'border-red-200/50',
            glow: 'shadow-red-500/20',
            icon: 'text-danger',
            bg: 'bg-gradient-to-br from-red-50 to-rose-50/30'
        }
    };

    const config = statusConfig[station.status];
    const TrendIcon = station.trend === 'up' ? TrendingUp : station.trend === 'down' ? TrendingDown : Activity;

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: [0.22, 1, 0.36, 1]
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : ''
                }`}
        >
            {/* Spotlight Effect */}
            {isHovered && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
                    }}
                />
            )}

            {/* Card Background with Gradient */}
            <div className={`relative ${config.bg} backdrop-blur-xl border ${config.border} rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-2xl ${config.glow} hover:-translate-y-1`}>

                {/* Status Indicator Dot */}
                <div className="absolute top-4 right-4">
                    <motion.div
                        className={`w-3 h-3 rounded-full ${station.status === 'critical' ? 'bg-danger' : station.status === 'warning' ? 'bg-warning' : 'bg-success'}`}
                        animate={{
                            scale: station.status === 'critical' ? [1, 1.3, 1] : 1,
                            opacity: station.status === 'critical' ? [1, 0.5, 1] : 1
                        }}
                        transition={{
                            duration: 2,
                            repeat: station.status === 'critical' ? Infinity : 0
                        }}
                    />
                </div>

                {/* Station Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-slate-900 text-lg truncate">
                                {station.name}
                            </h3>
                        </div>
                        <p className="text-xs text-textMuted">
                            ID: {station.id.substring(0, 8)}...
                        </p>
                    </div>
                </div>

                {/* Water Level Display */}
                <div className="mb-4">
                    <div className="flex items-end gap-2 mb-2">
                        <Waves className={`w-5 h-5 ${config.icon}`} />
                        <span className="text-3xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            {station.waterLevel.toFixed(1)}
                        </span>
                        <span className="text-sm text-textMuted mb-1">meters</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((station.waterLevel / 100) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                            className={`absolute inset-y-0 left-0 rounded-full ${station.status === 'critical' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                                station.status === 'warning' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                    'bg-gradient-to-r from-emerald-500 to-green-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                        <TrendIcon className={`w-4 h-4 ${station.trend === 'up' ? 'text-success' :
                            station.trend === 'down' ? 'text-danger' :
                                'text-textMuted'
                            }`} />
                        <span className="text-xs font-medium text-textMuted capitalize">
                            {station.trend || 'stable'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-textMuted" />
                        <span className="text-xs text-textMuted">
                            {station.lastUpdated || 'Live'}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`mt-4 px-3 py-1.5 rounded-full text-xs font-bold text-center uppercase tracking-wider ${station.status === 'critical' ? 'bg-danger/10 text-danger' :
                    station.status === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                    }`}>
                    {station.status}
                </div>
            </div>
        </motion.div>
    );
};

// Status Badge Component
const StatusBadge = ({ label, count, color }: { label: string; count: number; color: 'success' | 'warning' | 'danger' }) => {
    const colorConfig = {
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        danger: 'bg-danger/10 text-danger border-danger/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-4 py-2 rounded-full border ${colorConfig[color]} flex items-center gap-2 font-semibold text-sm`}
        >
            <span>{label}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/50 text-xs">
                {count}
            </span>
        </motion.div>
    );
};

export default RealTimeCenter;
