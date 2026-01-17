import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { FileText, Download, Calendar, TrendingDown, AlertCircle, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { getHistory, HistoryRecord } from '../services/api';

interface ChartData {
    date: string;
    level: number;
}

const Reports = () => {
    const [history, setHistory] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRecords: 0,
        avgLevel: 0,
        minLevel: 0,
        maxLevel: 0,
        trend: 'stable' as 'rising' | 'falling' | 'stable'
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data: HistoryRecord[] = await getHistory();

                // Transform data
                const transformedData: ChartData[] = data.map(record => ({
                    date: record.ds,
                    level: record.y
                }));

                setHistory(transformedData);

                // Calculate statistics
                if (transformedData.length > 0) {
                    const levels = transformedData.map(d => d.level);
                    const avg = levels.reduce((sum, l) => sum + l, 0) / levels.length;
                    const min = Math.min(...levels);
                    const max = Math.max(...levels);

                    // Calculate trend (compare first 10% to last 10%)
                    const firstTenPercent = levels.slice(0, Math.floor(levels.length * 0.1));
                    const lastTenPercent = levels.slice(-Math.floor(levels.length * 0.1));
                    const firstAvg = firstTenPercent.reduce((sum, l) => sum + l, 0) / firstTenPercent.length;
                    const lastAvg = lastTenPercent.reduce((sum, l) => sum + l, 0) / lastTenPercent.length;

                    let trend: 'rising' | 'falling' | 'stable' = 'stable';
                    const diff = lastAvg - firstAvg;
                    if (diff > 1) trend = 'rising';
                    else if (diff < -1) trend = 'falling';

                    setStats({
                        totalRecords: transformedData.length,
                        avgLevel: avg,
                        minLevel: min,
                        maxLevel: max,
                        trend
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching history:', error);
                toast.error('Failed to load historical data');
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const reports = [
        { id: 1, name: 'Groundwater Status Report - Dec 2025', date: '2025-12-31', size: '2.4 MB' },
        { id: 2, name: 'Groundwater Status Report - Nov 2025', date: '2025-11-30', size: '2.3 MB' },
        { id: 3, name: 'Quarterly Assessment (Q3 2025)', date: '2025-10-15', size: '5.1 MB' },
        { id: 4, name: 'Annual Aquifer Audit 2024', date: '2025-01-10', size: '12.8 MB' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-textMuted">Loading reports data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-textMain">System Reports</h1>
                <p className="text-textMuted">Historical trends and downloadable assessments.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart2 className="text-blue-600" size={20} />
                        </div>
                        <p className="text-sm text-textMuted">Total Records</p>
                    </div>
                    <p className="text-3xl font-bold text-textMain">{stats.totalRecords.toLocaleString()}</p>
                    <p className="text-xs text-textMuted mt-1">Daily measurements</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingDown className="text-green-600" size={20} />
                        </div>
                        <p className="text-sm text-textMuted">Average Level</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">{stats.avgLevel.toFixed(2)} m</p>
                    <p className="text-xs text-textMuted mt-1">Across all stations</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertCircle className="text-amber-600" size={20} />
                        </div>
                        <p className="text-sm text-textMuted">Range</p>
                    </div>
                    <p className="text-xl font-bold text-textMain">
                        {stats.minLevel.toFixed(1)} - {stats.maxLevel.toFixed(1)} m
                    </p>
                    <p className="text-xs text-textMuted mt-1">Min to Max depth</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${stats.trend === 'rising' ? 'bg-success/20' :
                            stats.trend === 'falling' ? 'bg-danger/20' : 'bg-gray-100'
                            }`}>
                            <TrendingDown className={
                                stats.trend === 'rising' ? 'text-success' :
                                    stats.trend === 'falling' ? 'text-danger' : 'text-gray-600'
                            } size={20} />
                        </div>
                        <p className="text-sm text-textMuted">5-Year Trend</p>
                    </div>
                    <p className={`text-2xl font-bold ${stats.trend === 'rising' ? 'text-success' :
                        stats.trend === 'falling' ? 'text-danger' : 'text-textMain'
                        }`}>
                        {stats.trend === 'rising' ? '↗ Rising' :
                            stats.trend === 'falling' ? '↘ Falling' : '→ Stable'}
                    </p>
                    <p className="text-xs text-textMuted mt-1">Overall direction</p>
                </div>
            </div>

            {/* Global Trend Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
                            <Calendar className="text-primary" />
                            Global Groundwater Trend Analysis
                        </h2>
                        <p className="text-sm text-textMuted mt-1">
                            {history.length > 0 && `${history[0].date} to ${history[history.length - 1].date}`} •
                            Averaged across {' '}
                            <span className="font-bold text-primary">20 monitoring stations</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-textMuted">Data Points</p>
                        <p className="text-2xl font-black text-primary">{stats.totalRecords.toLocaleString()}</p>
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="text-center">
                            <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-textMuted">No historical data available</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
                                <defs>
                                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#027598" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#027598" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#E5E7EB"
                                    opacity={0.6}
                                />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6B7280"
                                    fontSize={10}
                                    tickFormatter={(tick) => tick.slice(0, 7)}
                                    minTickGap={80}
                                    angle={-45}
                                    textAnchor="end"
                                    height={70}
                                />
                                <YAxis
                                    label={{
                                        value: 'Water Level Depth (meters below ground)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { fontSize: 12, fill: '#374151', fontWeight: 500 }
                                    }}
                                    stroke="#6B7280"
                                    fontSize={11}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                    labelStyle={{ fontWeight: 600, color: '#111827' }}
                                    formatter={(value: any) => [`${value.toFixed(2)} m`, 'Water Level']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="level"
                                    stroke="#027598"
                                    strokeWidth={2.5}
                                    fill="url(#colorLevel)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#027598', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Generated Reports Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                    <FileText className="text-primary" />
                    Generated Reports
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-textMuted text-sm">
                                <th className="font-medium py-3">Report Name</th>
                                <th className="font-medium py-3">Date Generated</th>
                                <th className="font-medium py-3">Size</th>
                                <th className="font-medium py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reports.map((r) => (
                                <tr key={r.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 font-medium text-textMain flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded text-primary group-hover:bg-primary/10 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        {r.name}
                                    </td>
                                    <td className="py-4 text-sm text-textMuted">{r.date}</td>
                                    <td className="py-4 text-sm text-textMuted">{r.size}</td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => toast.info('Download feature coming soon!')}
                                            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-end gap-1 w-full transition-colors"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
