import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, Droplet, TrendingUp, Activity, BarChart3, Brain, MapPin, ChevronDown, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getHistory, getZones, simulateScenario, HistoryRecord, Station, ScenarioResult } from '../services/api';

interface ChartDataPoint {
    date: string;
    level?: number;
}

const Analytics = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStationId, setSelectedStationId] = useState<string>('');
    const [selectedStationName, setSelectedStationName] = useState<string>('');
    const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
    const [forecastData, setForecastData] = useState<ScenarioResult | null>(null);
    const [loading, setLoading] = useState(true);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Scenario controls
    const [rainfallChange, setRainfallChange] = useState<number>(0);
    const [extractionChange, setExtractionChange] = useState<number>(0);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [showForecast, setShowForecast] = useState(false);

    // Load stations on mount
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const stationList: Station[] = await getZones();
                console.log('Loaded stations:', stationList);
                setStations(stationList);

                // Select first station by default
                if (stationList.length > 0) {
                    setSelectedStationId(stationList[0].id);
                    setSelectedStationName(stationList[0].name);
                }
            } catch (error) {
                console.error('Error fetching stations:', error);
                toast.error('Failed to load stations');
            }
        };

        fetchStations();
    }, []);

    // Load historical data  when component mounts
    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                console.log('Fetching historical data...');
                const history: HistoryRecord[] = await getHistory();
                console.log('History data received:', history.length, 'records');

                // Transform data
                const transformedData: ChartDataPoint[] = history.map(record => ({
                    date: record.ds,
                    level: record.y
                }));

                console.log('Transformed data:', transformedData);
                setHistoricalData(transformedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching historical data:', error);
                toast.error('Failed to load historical data');
                setLoading(false);
            }
        };

        fetchHistoricalData();
    }, []);

    const runForecast = async () => {
        if (!selectedStationId) {
            toast.error('Please select a station first');
            return;
        }

        setForecastLoading(true);
        try {
            console.log('Running forecast for station:', selectedStationId);
            const result: ScenarioResult = await simulateScenario({
                station_id: selectedStationId,
                rainfall_change_pct: rainfallChange,
                extraction_change_pct: extractionChange
            });

            console.log('Forecast result:', result);
            setForecastData(result);
            setShowForecast(true);
            toast.success('Forecast generated successfully!');
        } catch (error) {
            console.error('Forecast error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate forecast');
        } finally {
            setForecastLoading(false);
        }
    };

    const handleDownload = () => {
        if (!forecastData) {
            toast.error('No forecast data available');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,Month,Historical,ARIMA Forecast,LSTM Forecast\n";

        // Historical data (last 12 months)
        historicalData.slice(-12).forEach(d => {
            csvContent += `${d.date},${d.level?.toFixed(2) || ''},,\n`;
        });

        // Forecast data
        forecastData.labels.forEach((label, i) => {
            csvContent += `${label},,${forecastData.arima_data[i].toFixed(2)},${forecastData.lstm_data[i].toFixed(2)}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedStationId}_forecast.csv`);
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
                    <p className="text-textMuted">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    const latestLevel = historicalData.length > 0 ? historicalData[historicalData.length - 1].level : 0;
    const averageLevel = historicalData.length > 0
        ? historicalData.reduce((sum, d) => sum + (d.level || 0), 0) / historicalData.length
        : 0;

    // Prepare data for charts
    const historicalChartData = historicalData.slice(-12);

    const arimaChartData = forecastData ? forecastData.labels.map((label, i) => ({
        date: label,
        forecast: forecastData.arima_data[i]
    })) : [];

    const lstmChartData = forecastData ? forecastData.labels.map((label, i) => ({
        date: label,
        forecast: forecastData.lstm_data[i]
    })) : [];

    // Calculate trend indicators
    const getArimaTrend = () => {
        if (!forecastData || forecastData.arima_data.length < 2) return null;
        const first = forecastData.arima_data[0];
        const last = forecastData.arima_data[forecastData.arima_data.length - 1];
        const change = ((last - first) / first) * 100;
        return { value: change, direction: change >= 0 ? 'up' : 'down' };
    };

    const getLstmTrend = () => {
        if (!forecastData || forecastData.lstm_data.length < 2) return null;
        const first = forecastData.lstm_data[0];
        const last = forecastData.lstm_data[forecastData.lstm_data.length - 1];
        const change = ((last - first) / first) * 100;
        return { value: change, direction: change >= 0 ? 'up' : 'down' };
    };

    const arimaTrend = getArimaTrend();
    const lstmTrend = getLstmTrend();

    // Filter stations based on search
    const filteredStations = stations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
                            <Droplet className="text-primary" />
                            Analytics & Forecasting
                        </h1>
                        <p className="text-textMuted">Dual-model AI predictions with ARIMA & LSTM</p>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={!forecastData}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={16} />
                    Export Data
                </button>
            </div>

            {/* Station Selector */}
            <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-xl border-2 border-primary/30 p-6 relative z-30">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-lg">
                        <MapPin className="text-white" size={24} />
                    </div>
                    <div className="flex-1 relative">
                        <label className="block text-sm font-semibold text-textMain mb-2">
                            Select Monitoring Station ({stations.length} available)
                        </label>

                        {/* Custom Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(!isDropdownOpen);
                                    if (!isDropdownOpen) setSearchQuery(""); // Clear search on open
                                }}
                                className="w-full px-4 py-3 bg-white border-2 border-primary/30 rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors group"
                            >
                                <span className="font-medium text-lg text-slate-800">
                                    {selectedStationName || 'Select a station...'}
                                </span>
                                <div className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                    <ChevronDown className="text-primary" size={20} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-primary/20 shadow-xl max-h-[350px] overflow-hidden z-50 flex flex-col"
                                    >
                                        {/* Search Input */}
                                        <div className="p-3 border-b border-primary/10 bg-slate-50 sticky top-0 z-10">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Search stations..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 bg-white"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>

                                        <div className="overflow-y-auto custom-scrollbar p-2">
                                            {filteredStations.length === 0 ? (
                                                <div className="px-4 py-3 text-slate-500 text-center text-sm">
                                                    No stations found
                                                </div>
                                            ) : (
                                                filteredStations.map(station => (
                                                    <button
                                                        key={station.id}
                                                        onClick={() => {
                                                            setSelectedStationId(station.id);
                                                            setSelectedStationName(station.name);
                                                            setIsDropdownOpen(false);
                                                            // Reset forecast
                                                            setShowForecast(false);
                                                            setForecastData(null);
                                                        }}
                                                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors rounded-lg mb-1 ${selectedStationId === station.id ? 'bg-primary/5 text-primary font-bold' : 'text-slate-700'
                                                            }`}
                                                    >
                                                        <span>{station.name}</span>
                                                        {selectedStationId === station.id && (
                                                            <Check size={16} className="text-primary" />
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <p className="text-xs text-textMuted mt-2">
                            Forecast will be generated for: <span className="font-bold text-primary">{selectedStationName}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Scenario Simulator */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
                            <TrendingUp className="text-primary" size={20} />
                            Forecasting Simulator
                        </h3>
                        <p className="text-sm text-textMuted mt-1">
                            Configure scenario parameters for {selectedStationName}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                            Rainfall Change (%)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                step="5"
                                value={rainfallChange}
                                onChange={(e) => setRainfallChange(Number(e.target.value))}
                                className="flex-1 accent-primary"
                            />
                            <span className={`text-sm font-bold w-16 text-right ${rainfallChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                {rainfallChange > 0 ? '+' : ''}{rainfallChange}%
                            </span>
                        </div>
                        <p className="text-xs text-textMuted mt-1">
                            {rainfallChange > 0 ? '☁️ More rain' : rainfallChange < 0 ? '☀️ Less rain' : '→ Normal'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                            Extraction Change (%)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                step="5"
                                value={extractionChange}
                                onChange={(e) => setExtractionChange(Number(e.target.value))}
                                className="flex-1 accent-danger"
                            />
                            <span className={`text-sm font-bold w-16 text-right ${extractionChange <= 0 ? 'text-success' : 'text-danger'}`}>
                                {extractionChange > 0 ? '+' : ''}{extractionChange}%
                            </span>
                        </div>
                        <p className="text-xs text-textMuted mt-1">
                            {extractionChange > 0 ? '🏭 More extraction' : extractionChange < 0 ? '💧 Conservation' : '→ Normal'}
                        </p>
                    </div>

                    <button
                        onClick={runForecast}
                        disabled={forecastLoading || !selectedStationId}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {forecastLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Activity size={18} />
                                Run Forecast
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Historical Data Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-textMain mb-4">📊 Historical Water Levels (Past 12 Months - All Stations Average)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={historicalChartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                        <defs>
                            <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#027598" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#027598" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} opacity={0.6} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-45} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="level" stroke="#027598" strokeWidth={2} fill="url(#colorHistorical)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Forecast Results */}
            {showForecast && forecastData && (
                <>
                    {/* Model Comparison Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ARIMA Model */}
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <BarChart3 className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-900">ARIMA Model</h3>
                                        <p className="text-sm text-blue-700">Statistical Baseline Forecast</p>
                                    </div>
                                </div>
                                {arimaTrend && (
                                    <div className={`px-3 py-1.5 rounded-lg ${arimaTrend.direction === 'up' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                        <p className="text-xs font-semibold">12-Month Trend</p>
                                        <p className="text-lg font-black">
                                            {arimaTrend.direction === 'up' ? '↗' : '↘'} {Math.abs(arimaTrend.value).toFixed(1)}%
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/80 rounded-lg p-4 mb-4">
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={arimaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#BFDBFE" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#1E40AF' }} angle={-45} textAnchor="end" height={50} />
                                        <YAxis tick={{ fontSize: 10, fill: '#1E40AF' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', borderRadius: '8px' }} />
                                        <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: '#3B82F6' }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="text-blue-800"><span className="font-bold">Model Type:</span> AutoRegressive Integrated Moving Average</p>
                                <p className="text-blue-800"><span className="font-bold">Method:</span> Time-series statistical analysis</p>
                                <p className="text-blue-800"><span className="font-bold">Best For:</span> Stable, predictable patterns</p>
                            </div>
                        </div>

                        {/* LSTM Model */}
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Brain className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-purple-900">LSTM Model</h3>
                                        <p className="text-sm text-purple-700">AI Scenario Projection</p>
                                    </div>
                                </div>
                                {lstmTrend && (
                                    <div className={`px-3 py-1.5 rounded-lg ${lstmTrend.direction === 'up' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                        <p className="text-xs font-semibold">12-Month Trend</p>
                                        <p className="text-lg font-black">
                                            {lstmTrend.direction === 'up' ? '↗' : '↘'} {Math.abs(lstmTrend.value).toFixed(1)}%
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/80 rounded-lg p-4 mb-4">
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={lstmChartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#DDD6FE" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B21A8' }} angle={-45} textAnchor="end" height={50} />
                                        <YAxis tick={{ fontSize: 10, fill: '#6B21A8' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid #9333EA', borderRadius: '8px' }} />
                                        <Line type="monotone" dataKey="forecast" stroke="#9333EA" strokeWidth={2.5} dot={{ r: 3, fill: '#9333EA' }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="text-purple-800"><span className="font-bold">Model Type:</span> Long Short-Term Memory Neural Network</p>
                                <p className="text-purple-800"><span className="font-bold">Method:</span> Deep learning with scenario factors</p>
                                <p className="text-purple-800"><span className="font-bold">Best For:</span> Complex patterns & what-if scenarios</p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Insights */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <Activity className="text-amber-600" size={20} />
                            Model Comparison Insights for {selectedStationName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/70 rounded-lg p-4">
                                <p className="text-xs font-semibold text-amber-700 mb-1">ARIMA End Value</p>
                                <p className="text-2xl font-black text-blue-600">
                                    {forecastData.arima_data[forecastData.arima_data.length - 1].toFixed(2)}m
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <p className="text-xs font-semibold text-amber-700 mb-1">LSTM End Value</p>
                                <p className="text-2xl font-black text-purple-600">
                                    {forecastData.lstm_data[forecastData.lstm_data.length - 1].toFixed(2)}m
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <p className="text-xs font-semibold text-amber-700 mb-1">Difference</p>
                                <p className="text-2xl font-black text-amber-800">
                                    {Math.abs(
                                        forecastData.lstm_data[forecastData.lstm_data.length - 1] -
                                        forecastData.arima_data[forecastData.arima_data.length - 1]
                                    ).toFixed(2)}m
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-amber-800 mt-4">
                            <span className="font-bold">💡 Interpretation:</span> {' '}
                            {Math.abs(lstmTrend?.value || 0) > Math.abs(arimaTrend?.value || 0)
                                ? 'LSTM shows more dramatic change due to scenario impacts. Your policy adjustments have significant effect!'
                                : 'Both models show similar trends, indicating stable conditions with your current scenario settings.'}
                        </p>
                    </div>
                </>
            )}

            {/* Data Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <p className="text-sm text-textMuted mb-1">Total Records</p>
                    <p className="text-3xl font-bold text-textMain">{historicalData.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <p className="text-sm text-textMuted mb-1">Latest Level</p>
                    <p className="text-3xl font-bold text-primary">{latestLevel?.toFixed(2) || 'N/A'} m</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <p className="text-sm text-textMuted mb-1">Average Level</p>
                    <p className="text-3xl font-bold text-textMain">{averageLevel.toFixed(2)} m</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
