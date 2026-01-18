
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Droplets, AreaChart, FileText } from 'lucide-react';
import StationMap from '../components/map/StationMap';
import { toast } from 'sonner';
import { getMapClassification, ClassificationResult } from '../services/api';

// Convert API Station to Map Station format
interface MapStation {
    id: string;
    name: string;
    location: string;
    waterLevel: number;
    status: 'safe' | 'warning' | 'critical';
    lat: number;
    lng: number;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState<MapStation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch real data from backend
                const data: ClassificationResult[] = await getMapClassification();

                // Transform API data to component format
                const transformedStations: MapStation[] = data.map(station => ({
                    id: station.id,
                    name: station.name,
                    location: station.name,
                    waterLevel: station.baseline_level,
                    status: station.status === 'Safe' ? 'safe' :
                        station.status === 'Semi-Critical' ? 'warning' : 'critical',
                    lat: station.lat,
                    lng: station.lng
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
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const stats = {
        totalStations: stations.length,
        criticalCount: stations.filter(s => s.status === 'critical').length,
        warningCount: stations.filter(s => s.status === 'warning').length,
        safeCount: stations.filter(s => s.status === 'safe').length,
        avgLevel: stations.length > 0
            ? (stations.reduce((acc, s) => acc + s.waterLevel, 0) / stations.length).toFixed(1)
            : '0.0'
    };

    const handleDownloadReport = () => {
        toast.success("Redirecting to Reports...");
        navigate('/reports');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-textMuted">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (

        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-transparent">
            {/* FULL SCREEN MAP BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <StationMap stations={stations} />
            </div>

            {/* BENTO GRID OVERLAY - Adapted to New Theme */}
            <div className="absolute top-6 left-6 z-10 w-[380px] flex flex-col gap-4 pointer-events-none">
                {/* Header Card */}
                <div className="bg-white/60 backdrop-blur-xl p-5 pointer-events-auto border-l-4 border-l-primary rounded-2xl shadow-lg border border-white/40">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-textMain leading-tight">Live Command</h2>
                            <p className="text-xs text-textMuted font-medium uppercase tracking-wider">System Online</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        title="Stations"
                        value={stats.totalStations}
                        icon={<Activity size={16} />}
                        delay={0.1}
                    />
                    <StatCard
                        title="Avg Level"
                        value={`${stats.avgLevel}m`}
                        icon={<Droplets size={16} />}
                        delay={0.2}
                    />
                    <StatCard
                        title="Critical"
                        value={stats.criticalCount}
                        icon={<AlertTriangle size={16} />}
                        color="text-danger"
                        delay={0.3}
                        highlight="danger"
                    />
                    <StatCard
                        title="Warnings"
                        value={stats.warningCount}
                        icon={<AreaChart size={16} />}
                        color="text-warning"
                        delay={0.4}
                    />
                </div>

                {/* Legend Card - Grounded */}
                <div className="surface-card p-5 pointer-events-auto rounded-2xl">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Activity size={12} className="text-primary" />
                        Network Status
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-success shadow shadow-success/40"></span>
                                <span className="text-textMain font-medium">Safe Zone</span>
                            </div>
                            <span className="font-bold text-textMain">{stats.safeCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-warning shadow shadow-warning/40"></span>
                                <span className="text-textMain font-medium">Warning</span>
                            </div>
                            <span className="font-bold text-textMain">{stats.warningCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger"></span>
                                </span>
                                <span className="text-textMain font-medium">Critical</span>
                            </div>
                            <span className="font-bold text-textMain">{stats.criticalCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Right Tools - Grounded */}
            <div className="absolute bottom-6 right-6 z-10 flex gap-3">
                <button
                    onClick={handleDownloadReport}
                    className="surface-card px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-700 hover:text-primary active:scale-95 cursor-pointer border-primary/20 bg-slate-50/50"
                >
                    <FileText size={16} className="text-primary" />
                    Generate Report
                </button>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subValue?: string;
    subColor?: string;
    highlight?: 'danger';
    color?: string; // Added to support color override
    delay?: number; // Added to match previous usage
}

const StatCard = ({ title, value, icon, subValue, subColor, highlight, color }: StatCardProps) => (
    <div className={`p-4 rounded-xl border border-slate-200/60 bg-white shadow-sm flex flex-col justify-between min-h-[6rem] h-auto group transition-all hover:shadow-md ${highlight === 'danger' ? 'border-l-4 border-l-danger' : ''}`}>
        <div className={`flex items-center justify-between ${color || 'text-primary'}`}>
            <div className="p-1.5 rounded-lg glass-dark group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            {highlight === 'danger' && (
                <span className="flex h-2 w-2 rounded-full bg-danger">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-danger opacity-75"></span>
                </span>
            )}
        </div>
        <div>
            <h3 className={`text-2xl font-black mt-1 tracking-tight ${highlight === 'danger' ? 'text-danger' : 'text-slate-900'}`}>{value}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        </div>
    </div>
);

export default Dashboard;
