import React, { useState, useEffect } from 'react';
import RiskAnalysis from '../components/ui/RiskAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Sliders, RefreshCw, Zap, Info, MapPin } from 'lucide-react';
import { getZones, analyzeZone, Station, SimulationResult } from '../services/api';
import { toast } from 'sonner';

// Unified Component: Policy Guider + Recharge Output
const PolicyGuider = ({ stations }: { stations: Station[] }) => {
    const [selectedZone, setSelectedZone] = useState<string>(stations[0]?.id || '');
    const [rainfall, setRainfall] = useState<number>(750);
    const [extractionPercent, setExtractionPercent] = useState<number>(100);

    // Result State
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Initial load
    useEffect(() => {
        if (stations.length > 0 && !selectedZone) setSelectedZone(stations[0].id);
    }, [stations, selectedZone]);

    const handleRun = async () => {
        if (!selectedZone) {
            toast.error('Please select a zone');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            console.log('Running simulation with:', {
                station_id: selectedZone,
                rainfall,
                extraction_percent: extractionPercent
            });

            // Call real API
            const simulationResult: SimulationResult = await analyzeZone({
                station_id: selectedZone,
                rainfall: rainfall,
                extraction_percent: extractionPercent
            });

            console.log('Simulation result:', simulationResult);

            setResult(simulationResult);
            toast.success('Simulation completed successfully');
        } catch (error) {
            console.error('Simulation error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to run simulation');
        } finally {
            setLoading(false);
        }
    };


    const chartData = result ? [
        { name: 'Recharge', value: result.estimated_recharge_mcm, color: '#6FAF8F' },
        { name: 'Extraction', value: result.projected_extraction_mcm, color: '#C96A6A' }
    ] : [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Sliders size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-textMain">Water Budget Simulation</h2>
                    <p className="text-sm text-textMuted">Simulate recharge & extraction scenarios</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Inputs Column */}
                <div className="space-y-6">
                    {/* Zone Select */}
                    <div>
                        <label className="block text-sm font-bold text-textMain mb-2">Select Zone / Station</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium appearance-none"
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                            >
                                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Sliders */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-textMain flex items-center gap-1">
                                Annual Rainfall (mm) <Info size={14} className="text-textMuted" />
                            </label>
                            <span className="text-sm font-bold text-textMain">{rainfall}mm</span>
                        </div>
                        <input
                            type="range"
                            min="200"
                            max="2000"
                            step="50"
                            value={rainfall}
                            onChange={(e) => setRainfall(Number(e.target.value))}
                            className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-textMain flex items-center gap-1">
                                Extraction Level <Info size={14} className="text-textMuted" />
                            </label>
                            <span className="text-sm font-bold text-textMain">{extractionPercent}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            step="10"
                            value={extractionPercent}
                            onChange={(e) => setExtractionPercent(Number(e.target.value))}
                            className="w-full accent-[#027598] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-textMuted mt-1">100% = Current avg extraction</p>
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading || !selectedZone}
                        className="w-full py-4 bg-[#027598] text-white rounded-xl font-bold hover:bg-[#026584] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-lg relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Zap className="fill-current" />}
                        {loading ? 'Simulating...' : 'Run Simulation'}
                    </button>
                </div>

                {/* Output Column with Slide Animation */}
                <div className="relative">
                    <div className={`transition-all duration-700 ease-in-out transform ${result ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                        {result && (
                            <div className="h-full flex flex-col">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-textMain">Zone: {result.zone_name || 'Unknown'}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${result.status === 'Deficit' || result.status === 'Critical' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                                Status: {result.status || 'Unknown'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600">
                                                Refill: {result.percent_refilled?.toFixed(1) || '0.0'}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Net Balance</p>
                                        <span className={`text-3xl font-black ${(result.net_balance_mcm || 0) < 0 ? 'text-danger' : 'text-success'}`}>
                                            {(result.net_balance_mcm || 0) > 0 ? '+' : ''}{result.net_balance_mcm?.toFixed(1) || '0.0'} MCM
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                                    {/* Left: Detailed Cards */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#6FAF8F]">
                                            <p className="text-sm text-textMuted mb-1">Estimated Recharge</p>
                                            <p className="text-2xl font-bold text-[#6FAF8F]">{result.estimated_recharge_mcm?.toFixed(1) || '0.0'} MCM</p>
                                            <p className="text-xs text-textMuted mt-1">From {result.rainfall_input_mm || 0}mm rain • {result.soil_infiltration || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#C96A6A]">
                                            <p className="text-sm text-textMuted mb-1">Projected Extraction</p>
                                            <p className="text-2xl font-bold text-[#C96A6A]">{result.projected_extraction_mcm?.toFixed(1) || '0.0'} MCM</p>
                                            <p className="text-xs text-textMuted mt-1">Area: {result.area_sq_km || 0} km² </p>
                                        </div>
                                    </div>


                                    {/* Right: Chart */}
                                    <div className="h-full min-h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: 'transparent' }} />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Placeholder when no result */}
                    {!result && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-textMuted bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                <Sliders size={32} className="text-gray-300" />
                            </div>
                            <p className="font-medium">Configure rainfall & extraction, then run</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Simulation = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const data = await getZones();
                setStations(data);
            } catch (error) {
                console.error('Error fetching stations:', error);
                toast.error('Failed to load stations');
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-textMuted">Loading simulation tools...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-textMain">Analytics & Simulation Hub</h1>
                <p className="text-textMuted">Advanced tools for groundwater assessment and planning.</p>
            </div>

            {/* Merged Policy Guider */}
            {stations.length > 0 && <PolicyGuider stations={stations} />}

            {/* Feature 5: Risk Analysis (Below) */}
            <RiskAnalysis />
        </div>
    );
};

export default Simulation;

