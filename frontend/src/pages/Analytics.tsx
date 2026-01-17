
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MockDataService } from '../services/mockDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Download, Droplet } from 'lucide-react';
import { toast } from 'sonner';

const Analytics = () => {
    const { stationId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [stationName, setStationName] = useState('Loading...');

    useEffect(() => {
        if (!stationId) return;

        // Simulate fetching station details
        MockDataService.getStations().then(stations => {
            const s = stations.find(st => st.id === stationId);
            if (s) setStationName(s.name);
        });

        // Fetch history
        MockDataService.getHistory(stationId).then(history => {
            setData(history);
        });
    }, [stationId]);

    const handleDownload = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Water Level (m),Forecast\n"
            + data.map(e => `${e.date},${e.level.toFixed(2)},${e.forecast ? 'Yes' : 'No'}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `station_${stationId}_data.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Report downloaded successfully");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-textMuted transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-textMain">{stationName}</h1>
                        <p className="text-sm text-textMuted">Station ID: {stationId} • District: Ludhiana</p>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium"
                >
                    <Download size={16} />
                    Export Data
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-textMain mb-4 flex items-center gap-2">
                        <Droplet size={18} className="text-primary" />
                        Water Level Trend (Depth)
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="#9ca3af" fontSize={12} minTickGap={30} />
                                <YAxis stroke="#9ca3af" fontSize={12} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="level"
                                    stroke="#027598"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Historical"
                                    data={data.filter(d => !d.forecast)}
                                />
                                {/* Forecast Line */}
                                <Line
                                    type="monotone"
                                    dataKey="level"
                                    stroke="#dbb432"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="AI Forecast (30 Days)"
                                    data={data.filter(d => d.forecast || d.date === data.find((x: any) => x.forecast)?.date)} // Link connect
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stats & Recharge */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-textMain mb-4">Aquifer Health</h3>
                        <div className="flex justify-center py-4">
                            <div className="relative w-40 h-20 overflow-hidden bg-gray-100 rounded-t-full">
                                <div className="absolute bottom-0 left-0 right-0 h-full bg-success/20 origin-bottom transform rotate-45 rounded-t-full" style={{ transform: 'rotate(120deg)' }}></div>
                                <div className="absolute inset-0 flex items-end justify-center pb-2">
                                    <span className="text-2xl font-bold text-textMain">32%</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-textMuted mt-2">Recharge Rate (Low)</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-textMain mb-4">Seasonal Variance</h3>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Mon', val: 12 }, { name: 'Tue', val: 19 }, { name: 'Wed', val: 15 },
                                    { name: 'Thu', val: 22 }, { name: 'Fri', val: 25 }, { name: 'Sat', val: 18 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Bar dataKey="val" fill="#027598" radius={[4, 4, 0, 0]} opacity={0.6} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
