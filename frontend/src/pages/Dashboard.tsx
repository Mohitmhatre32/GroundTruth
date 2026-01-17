
import React, { useEffect, useState } from 'react';
import { MockDataService, Station } from '../services/mockDataService';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import StationMap from '../components/map/StationMap';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState<Station[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [criticalAlert, setCriticalAlert] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await MockDataService.getStations();
            setStations(data);
            setLoading(false);

            // Alert Logic (Feature 4)
            const critical = data.find(s => s.status === 'critical');
            if (critical) {
                setCriticalAlert(`⚠️ CRITICAL DEPLETION DETECTED: ${critical.location}`);
            } else {
                setCriticalAlert(null);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // 10s poll

        // Fetch global history once
        MockDataService.getHistory().then(setHistory);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-6 min-h-full pb-8">
            {/* Feature 4: Sticky Alert Banner */}
            {criticalAlert && (
                <div className="sticky top-0 z-50 bg-danger text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="animate-bounce" />
                    {criticalAlert}
                </div>
            )}

            {/* Row 1: Live Sensor Feed (Feature 1) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
                        <Activity size={24} className="text-primary" />
                        Live Sensor Feed
                    </h2>
                    <span className="text-xs text-textMuted bg-gray-100 px-2 py-1 rounded">Auto-updating every 10s</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stations.map(station => (
                        <div key={station.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/analytics/${station.id}`)}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-textMain text-sm truncate pr-2">{station.location}</h3>
                                <div className={`w-3 h-3 rounded-full ${station.status === 'safe' ? 'bg-[#1ABC9C]' : station.status === 'critical' ? 'bg-[#E74C3C]' : 'bg-warning'} animate-pulse`}></div>
                            </div>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-bold text-textMain">{station.waterLevel}</span>
                                <span className="text-xs text-textMuted">m</span>
                            </div>
                            <p className={`text-xs font-medium mt-1 ${station.status === 'safe' ? 'text-[#1ABC9C]' : station.status === 'critical' ? 'text-[#E74C3C]' : 'text-warning'}`}>
                                Status: {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2: Historical Trends (Feature 2) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-textMain mb-4">Historical Trends (5 Years)</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(tick) => tick.slice(0, 4)} minTickGap={50} />
                            <YAxis label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }} stroke="#9ca3af" reversed />
                            <Tooltip labelStyle={{ color: '#000' }} />
                            <Line type="monotone" dataKey="level" stroke="#027598" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 3: Navigation to Analysis Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section for Map */}
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-[300px] relative overflow-hidden group">
                    <StationMap stations={stations} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-[400] pointer-events-none">
                        <span className="text-white font-bold bg-white/20 backdrop-blur px-4 py-2 rounded-full">Interact with Map</span>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-rows-2 gap-4">
                    <div onClick={() => navigate('/simulation')} className="bg-gradient-to-r from-primary to-[#014f66] p-6 rounded-xl text-white cursor-pointer hover:shadow-lg transition-all flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                        <h3 className="text-xl font-bold mb-1">Recharge & Risk Analytics</h3>
                        <p className="text-blue-100 text-sm mb-4">Analyze zones and simulate supply-demand scenarios.</p>
                        <div className="flex items-center gap-2 font-semibold text-sm">
                            Open Lab <ArrowRight size={16} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-textMain">System Reports</h3>
                            <p className="text-sm text-textMuted">Download monthly summaries</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-100 text-textMain rounded-lg text-sm font-medium hover:bg-gray-200">View</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
