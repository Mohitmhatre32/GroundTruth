
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
        <div className="flex flex-col gap-6 min-h-full pb-8">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Stations"
                    value={stats.totalStations.toString()}
                    icon={<Activity className="text-primary" />}
                />
                <StatCard
                    title="Avg Water Level"
                    value={`${stats.avgLevel}m`}
                    icon={<Droplets className="text-primary" />}
                    subValue={`${stats.safeCount} safe zones`}
                    subColor="text-success"
                />
                <StatCard
                    title="Critical Zones"
                    value={stats.criticalCount.toString()}
                    icon={<AlertTriangle className="text-danger" />}
                    highlight="danger"
                />
                <StatCard
                    title="Warning Zones"
                    value={stats.warningCount.toString()}
                    icon={<AreaChart className="text-warning" />}
                    subValue={stats.warningCount > 0 ? "Needs attention" : "All clear"}
                    subColor={stats.warningCount > 0 ? "text-warning" : "text-success"}
                />
            </div>

            {/* Main Content: Map */}
            <div className="h-[600px] bg-white p-1 rounded-xl shadow-sm border border-gray-100 relative flex flex-col">
                <div className="absolute top-4 right-4 z-[400]">
                    <button
                        onClick={handleDownloadReport}
                        className="bg-white p-2 rounded-lg shadow-md border border-gray-200 text-textMuted hover:text-primary transition-colors flex items-center gap-2"
                        title="View System Reports"
                    >
                        <FileText size={18} />
                        <span className="text-xs font-semibold">Reports</span>
                    </button>
                </div>
                <StationMap stations={stations} />
                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 z-[400] text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-success"></span>
                        <span>Safe</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-warning"></span>
                        <span>Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-danger animate-pulse"></span>
                        <span>Critical</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subValue?: string;
    subColor?: string;
    highlight?: 'danger';
}

const StatCard = ({ title, value, icon, subValue, subColor, highlight }: StatCardProps) => (
    <div className={`p-4 rounded-xl shadow-sm border border-gray-100 bg-white flex items-start justify-between ${highlight === 'danger' ? 'ring-1 ring-danger/30 bg-danger/5' : ''}`}>
        <div>
            <p className="text-xs font-medium text-textMuted uppercase tracking-wider">{title}</p>
            <h3 className={`text-2xl font-bold mt-1 ${highlight === 'danger' ? 'text-danger' : 'text-textMain'}`}>{value}</h3>
            {subValue && (
                <p className={`text-xs mt-1 font-medium ${subColor || 'text-textMuted'}`}>{subValue}</p>
            )}
        </div>
        <div className={`p-2 rounded-lg ${highlight === 'danger' ? 'bg-danger/10' : 'bg-background'}`}>
            {icon}
        </div>
    </div>
);

export default Dashboard;

