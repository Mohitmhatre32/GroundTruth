import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Radio, Clock, MapPin } from 'lucide-react';
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
            accent: 'border-l-success',
            icon: 'text-success',
            dot: 'bg-success',
            progress: 'bg-success'
        },
        warning: {
            accent: 'border-l-warning',
            icon: 'text-warning',
            dot: 'bg-warning',
            progress: 'bg-warning'
        },
        critical: {
            accent: 'border-l-danger',
            icon: 'text-danger',
            dot: 'bg-danger',
            progress: 'bg-danger'
        }
    };

    const config = statusConfig[station.status];
    const TrendIcon = station.trend === 'up' ? TrendingUp : station.trend === 'down' ? TrendingDown : Activity;

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: "easeOut"
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            className={`group cursor-pointer rounded-2xl transition-all duration-300 ${isSelected ? 'ring-2 ring-primary ring-offset-4' : ''}`}
        >
            <div className={`relative surface-card border-l-4 ${config.accent} p-5 flex flex-col h-full overflow-hidden`}>

                {/* Subtle Industrial Background Hint - Reduced "Whitishness" */}
                <div className="absolute inset-0 bg-slate-50/30 -z-10 group-hover:bg-slate-50/50 transition-colors" />

                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg glass-dark text-slate-600">
                            <MapPin size={16} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-[150px]">
                                {station.name}
                            </h3>
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                                ID: {station.id.substring(0, 8)}
                            </p>
                        </div>
                    </div>

                    <motion.div
                        className={`w-2.5 h-2.5 rounded-full ${config.dot} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                        animate={station.status === 'critical' ? {
                            scale: [1, 1.4, 1],
                            boxShadow: ["0 0 0px var(--danger)", "0 0 12px var(--danger)", "0 0 0px var(--danger)"]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>

                {/* Main Metric */}
                <div className="flex-1 py-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            {station.waterLevel.toFixed(1)}
                        </span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">m</span>
                    </div>

                    {/* Water Graphic Progress - Less AI, More Clean */}
                    <div className="mt-4 mb-2 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Level Depth</span>
                            <span>{Math.round(Math.min((station.waterLevel / 100) * 100, 100))}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((station.waterLevel / 100) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                                className={`h-full ${config.progress}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md glass-dark ${station.trend === 'up' ? 'text-success' :
                        station.trend === 'down' ? 'text-danger' : 'text-slate-500'
                        }`}>
                        <TrendIcon size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{station.trend || 'stable'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-medium tracking-tight">
                            {station.lastUpdated || 'LIVE'}
                        </span>
                    </div>
                </div>

                {/* Spotlight Cursor Effect - Refined */}
                {isHovered && (
                    <div
                        className="absolute inset-0 pointer-events-none z-10 transition-opacity opacity-40"
                        style={{
                            background: `radial-gradient(120px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(2, 117, 152, 0.08), transparent 80%)`
                        }}
                    />
                )}
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
