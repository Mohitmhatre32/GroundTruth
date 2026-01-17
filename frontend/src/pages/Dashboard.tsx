
import React, { useEffect, useState } from 'react';
import { MockDataService, Station, Alert } from '../services/mockDataService';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Droplets, AreaChart, FileText } from 'lucide-react';
import StationMap from '../components/map/StationMap';
import { toast } from 'sonner';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await MockDataService.getStations();
            setStations(data);
            setLoading(false);

            // Alert Logic
            const critical = data.filter(s => s.status === 'critical');
            if (critical.length > 0) {
                setCriticalAlert(`⚠️ CRITICAL DEPLETION DETECTED: ${critical.length} Zones Affected`);

                // Generate alerts for ticker
                const newAlerts = critical.map(s => ({
                    id: `alert-${s.id}`,
                    stationId: s.id,
                    message: `CRITICAL LEVEL: ${s.location} dropped below safe limit! Current: ${s.waterLevel}m`,
                    severity: 'critical' as const,
                    timestamp: new Date().toISOString()
                }));
                setAlerts(newAlerts);
            } else {
                setCriticalAlert(null);
                setAlerts([]);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const stats = {
        totalStations: stations.length,
        criticalCount: stations.filter(s => s.status === 'critical').length,
        avgLevel: (stations.reduce((acc, s) => acc + s.waterLevel, 0) / (stations.length || 1)).toFixed(1)
    };

    const handleDownloadReport = () => {
        toast.success("Redirecting to Reports...");
        navigate('/reports');
    };

    return (
        <div className="flex flex-col gap-6 min-h-full pb-8">
            {/* Sticky Alert & Ticker */}
            {criticalAlert && (
                <div className="sticky top-0 z-50 flex flex-col gap-2">
                    <div className="bg-danger text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="animate-bounce" />
                            {criticalAlert}
                        </div>
                    </div>
                    {alerts.length > 0 && (
                        <div className="bg-danger/10 border border-danger/20 p-2 rounded-lg flex items-center overflow-hidden whitespace-nowrap">
                            <span className="font-bold text-danger text-xs uppercase px-2">LIVE:</span>
                            <div className="animate-marquee inline-block">
                                {alerts.map(a => (
                                    <span key={a.id} className="text-sm text-danger mr-8 font-medium">
                                        {a.message} ({new Date(a.timestamp).toLocaleTimeString()})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                    subValue="-0.5m vs last year"
                    subColor="text-danger"
                />
                <StatCard
                    title="Critical Zones"
                    value={stats.criticalCount.toString()}
                    icon={<AlertTriangle className="text-danger" />}
                    highlight="danger"
                />
                <StatCard
                    title="Est. Recharge"
                    value="45%"
                    icon={<AreaChart className="text-success" />}
                    subValue="On track"
                    subColor="text-success"
                />
            </div>

            {/* Main Content: Map Only */}
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

const StatCard = ({ title, value, icon, subValue, subColor, highlight }: any) => (
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
