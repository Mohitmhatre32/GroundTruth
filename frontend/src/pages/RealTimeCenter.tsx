import { useEffect, useState } from 'react';

import { getLiveStatus } from '../services/api';
import { Activity, Droplet, Clock, MapPin, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';


interface LiveNode {
    station_id: string;
    location: string;
    water_level: number;
    last_updated: string;
    status: 'Critical' | 'Semi-Critical' | 'Safe';
}

const RealTimeCenter = () => {
    const [nodes, setNodes] = useState<LiveNode[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLiveStats = async () => {
        try {
            const response = await getLiveStatus();
            if (response.status === 'success') {
                // Map the data to our interface
                const mappedData: LiveNode[] = response.data.map((item: any) => ({
                    station_id: item.station_id,
                    location: item.location,
                    water_level: item.water_level,
                    last_updated: item.last_updated,
                    status: item.status as any
                }));
                // Sort by status gravity: Critical first, then Semi-Critical, then Safe
                const statusOrder = { 'Critical': 0, 'Semi-Critical': 1, 'Safe': 2 };
                mappedData.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
                setNodes(mappedData);
            }
        } catch (error) {
            console.error('Error fetching live status:', error);
            // Don't show toast every 10 seconds to avoid annoyance
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveStats();
        const interval = setInterval(fetchLiveStats, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Critical':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-700',
                    icon: <AlertTriangle className="text-red-500" size={20} />,
                    badge: 'bg-red-100 text-red-800'
                };
            case 'Semi-Critical':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    text: 'text-amber-700',
                    icon: <HelpCircle className="text-amber-500" size={20} />,
                    badge: 'bg-amber-100 text-amber-800'
                };
            case 'Safe':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-700',
                    icon: <CheckCircle className="text-green-500" size={20} />,
                    badge: 'bg-green-100 text-green-800'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-700',
                    icon: <Activity className="text-gray-500" size={20} />,
                    badge: 'bg-gray-100 text-gray-800'
                };
        }
    };

    if (loading && nodes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-textMuted text-lg">Initializing real-time stream...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
                        <Activity className="text-primary" />
                        Real-Time Monitoring Center
                    </h1>
                    <p className="text-textMuted">Live sensor telemetry from 20 distributed monitoring nodes.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    Live Stream Connected
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {nodes.map((node) => {
                    const styles = getStatusStyles(node.status);
                    const lastUpdatedDate = new Date(node.last_updated);
                    const formattedTime = lastUpdatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                    return (
                        <div
                            key={node.station_id}
                            className={`${styles.bg} ${styles.border} border-2 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden`}
                        >
                            {/* Status Ribbon */}
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg ${styles.badge}`}>
                                {node.status}
                            </div>

                            <div className="flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        {styles.icon}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-textMuted flex items-center justify-end gap-1">
                                            <Clock size={10} /> {formattedTime}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-bold text-textMain line-clamp-1 group-hover:text-primary transition-colors">
                                        {node.location}
                                    </h3>
                                    <p className="text-xs text-textMuted flex items-center gap-1">
                                        <MapPin size={10} /> {node.station_id}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-textMuted uppercase font-bold tracking-tighter">Current Level</p>
                                        <p className="text-2xl font-black text-textMain">
                                            {node.water_level.toFixed(2)}
                                            <span className="text-xs font-normal ml-1">m</span>
                                        </p>
                                    </div>
                                    <div className="p-2 bg-white/50 rounded-full group-hover:bg-white transition-colors">
                                        <Droplet size={18} className={styles.text} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {nodes.length === 0 && !loading && (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center">
                    <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-bold text-textMain">No Node Data Received</h3>
                    <p className="text-textMuted max-w-sm mx-auto mt-2">
                        Start the node simulator to begin receiving real-time groundwater telemetry data.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RealTimeCenter;
