import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { FileText, Download, Calendar, TrendingDown, AlertCircle, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { getHistory, HistoryRecord, getZones, Station, exportOverallReport, exportCustomReport } from '../services/api';

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

    // Custom Report State
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [downloading, setDownloading] = useState({ overall: false, custom: false });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyData, stationsData] = await Promise.all([
                    getHistory(),
                    getZones()
                ]);

                // Transform history data
                const transformedData: ChartData[] = historyData.map(record => ({
                    date: record.ds,
                    level: record.y
                }));

                setHistory(transformedData);
                setStations(stationsData);

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
                console.error('Error fetching data:', error);
                toast.error('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownloadOverall = async (type: 'csv' | 'pdf') => {
        try {
            setDownloading(prev => ({ ...prev, overall: true }));
            const blob = await exportOverallReport(type);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = type === 'csv' ? 'GroundTruth_Full_History.csv' : 'Executive_Summary_Report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success(`Overall ${type.toUpperCase()} report downloaded`);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download report');
        } finally {
            setDownloading(prev => ({ ...prev, overall: false }));
        }
    };

    const handleDownloadCustom = async (type: 'csv' | 'pdf') => {
        if (!selectedStation || !dateRange.start || !dateRange.end) {
            toast.error('Please select station and date range');
            return;
        }

        try {
            setDownloading(prev => ({ ...prev, custom: true }));
            const blob = await exportCustomReport(type, {
                station_id: selectedStation,
                start: dateRange.start,
                end: dateRange.end
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = type === 'csv' ? `Station_${selectedStation}_Data.csv` : `Station_${selectedStation}_Analysis.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success(`Custom ${type.toUpperCase()} report downloaded`);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download report');
        } finally {
            setDownloading(prev => ({ ...prev, custom: false }));
        }
    };

    // const reports = [
    //     { id: 1, name: 'Groundwater Status Report - Dec 2025', date: '2025-12-31', size: '2.4 MB' },
    //     { id: 2, name: 'Groundwater Status Report - Nov 2025', date: '2025-11-30', size: '2.3 MB' },
    //     { id: 3, name: 'Quarterly Assessment (Q3 2025)', date: '2025-10-15', size: '5.1 MB' },
    //     { id: 4, name: 'Annual Aquifer Audit 2024', date: '2025-01-10', size: '12.8 MB' },
    // ];

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

            {/* Download Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Overall Reports */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-textMain">Overall System Report</h2>
                            <p className="text-sm text-textMuted">Complete history of all monitoring stations</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleDownloadOverall('csv')}
                            disabled={downloading.overall}
                            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-white group-hover:text-primary">
                                    <FileText size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-textMain">Full History (CSV)</p>
                                    <p className="text-xs text-textMuted">Raw data for analysis</p>
                                </div>
                            </div>
                            <Download size={20} className="text-gray-400 group-hover:text-primary" />
                        </button>

                        <button
                            onClick={() => handleDownloadOverall('pdf')}
                            disabled={downloading.overall}
                            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-white group-hover:text-primary">
                                    <FileText size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-textMain">Executive Summary (PDF)</p>
                                    <p className="text-xs text-textMuted">Formatted insights & charts</p>
                                </div>
                            </div>
                            <Download size={20} className="text-gray-400 group-hover:text-primary" />
                        </button>
                    </div>
                </div>

                {/* Custom Reports */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                            <Download className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-textMain">Custom Data Export</h2>
                            <p className="text-sm text-textMuted">Generate specific station reports</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1">Select Station</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                            >
                                <option value="">-- Choose a Station --</option>
                                {stations.map(station => (
                                    <option key={station.id} value={station.id}>
                                        {station.name} ({station.id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-textMain mb-1">From Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMain mb-1">To Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => handleDownloadCustom('csv')}
                                disabled={downloading.custom || !selectedStation || !dateRange.start || !dateRange.end}
                                className="flex-1 bg-white border border-gray-300 text-textMain py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <FileText size={18} />
                                CSV
                            </button>
                            <button
                                onClick={() => handleDownloadCustom('pdf')}
                                disabled={downloading.custom || !selectedStation || !dateRange.start || !dateRange.end}
                                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Reports;
