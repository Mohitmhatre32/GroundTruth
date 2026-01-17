
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Download, Droplet } from 'lucide-react';
import { toast } from 'sonner';
import { getHistory, getZones, HistoryRecord, Station } from '../services/api';

interface ChartDataPoint {
    date: string;
    level: number;
    forecast: boolean;
}

const Analytics = () => {
    const { stationId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [stationName, setStationName] = useState('Loading...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!stationId) return;

        const fetchData = async () => {
            try {
                // Fetch station details
                const stations: Station[] = await getZones();
                const station = stations.find(st => st.id === stationId);
                if (station) {
                    setStationName(station.name);
                }

                // Fetch historical data
                const history: HistoryRecord[] = await getHistory();

                // Transform API data (ds, y) to chart format (date, level)
                const transformedData: ChartDataPoint[] = history.map(record => ({
                    date: record.ds,
                    level: record.y,
                    forecast: false
                }));

                setData(transformedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                toast.error('Failed to load analytics data');
                setLoading(false);
            }
        };

        fetchData();
    }, [stationId]);

    const handleDownload = () => {
        if (data.length === 0) {
            toast.error('No data available to download');
            return;
        }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-textMuted">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-textMuted transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-textMain">{stationName}</h1>
                        <p className="text-sm text-textMuted">Station ID: {stationId} • Historical Trend Analysis</p>
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
                        Water Level Trend (Historical Data)
                    </h3>
                    <div className="h-[350px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(d) => {
                                            const date = new Date(d);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        minTickGap={30}
                                    />
                                    <YAxis stroke="#9ca3af" fontSize={12} label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="level"
                                        stroke="#027598"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Historical Data"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-textMuted">
                                No historical data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats & Seasonal Variance */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-textMain mb-4">Data Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-textMuted">Total Records:</span>
                                <span className="text-sm font-semibold text-textMain">{data.length}</span>
                            </div>
                            {data.length > 0 && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-textMuted">Latest Level:</span>
                                        <span className="text-sm font-semibold text-textMain">
                                            {data[data.length - 1].level.toFixed(2)}m
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-textMuted">Average Level:</span>
                                        <span className="text-sm font-semibold text-textMain">
                                            {(data.reduce((sum, d) => sum + d.level, 0) / data.length).toFixed(2)}m
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-textMain mb-4">Seasonal Variance</h3>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Jan', val: 12 }, { name: 'Feb', val: 19 }, { name: 'Mar', val: 15 },
                                    { name: 'Apr', val: 22 }, { name: 'May', val: 25 }, { name: 'Jun', val: 18 }
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

