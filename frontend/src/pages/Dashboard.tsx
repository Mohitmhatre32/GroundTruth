
import React, { useEffect, useState } from 'react';
import { MockDataService, Station, Alert } from '../services/mockDataService';
import StationMap from '../components/map/StationMap';
import { AreaChart, Droplets, AlertTriangle, Activity } from 'lucide-react';

const Dashboard = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulate real-time data fetching
    useEffect(() => {
        const fetchData = async () => {
            const data = await MockDataService.getStations();
            setStations(data);
            setLoading(false);

            // Generate dummy alerts from critical stations
            const critical = data.filter(s => s.status === 'critical');
            const newAlerts = critical.map(s => ({
                id: `alert-${s.id}`,
                stationId: s.id,
                message: `CRITICAL LEVEL: ${s.name} dropped below safe limit! Current: ${s.waterLevel}m`,
                severity: 'critical' as const,
                timestamp: new Date().toISOString()
            }));
            setAlerts(newAlerts);
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const stats = {
        totalStations: stations.length,
        criticalCount: stations.filter(s => s.status === 'critical').length,
        avgLevel: (stations.reduce((acc, s) => acc + s.waterLevel, 0) / (stations.length || 1)).toFixed(1)
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col gap-4">
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

            {/* Live Ticker */}
            {alerts.length > 0 && (
                <div className="bg-danger/10 border border-danger/20 p-2 rounded-lg flex items-center overflow-hidden whitespace-nowrap">
                    <span className="font-bold text-danger text-xs uppercase px-2">LIVE ALERTS:</span>
                    <div className="animate-marquee inline-block">
                        {alerts.map(a => (
                            <span key={a.id} className="text-sm text-danger mr-8 font-medium">
                                ⚠️ {a.message} ({new Date(a.timestamp).toLocaleTimeString()})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Map Section */}
            <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 p-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <StationMap stations={stations} />
                )}

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 z-[400] text-xs">
                    <h4 className="font-semibold mb-2 text-textMain">Zone Classification</h4>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-success"></span>
                        <span>Safe ({'>'}20m)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-warning"></span>
                        <span>Semi-Critical (10-20m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-danger animate-pulse"></span>
                        <span>Critical ({'<'}10m)</span>
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
