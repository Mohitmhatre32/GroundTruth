import React, { useState, useEffect } from 'react';
import { MockDataService, Station, RiskAnalysisResult } from '../services/mockDataService';
import RiskAnalysis from '../components/ui/RiskAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Sliders, RefreshCw, Zap, Info, MapPin } from 'lucide-react';

// Unified Component: Policy Guider + Recharge Output
const PolicyGuider = ({ stations }: { stations: Station[] }) => {
    const [selectedZone, setSelectedZone] = useState<string>(stations[0]?.id || '1');
    const [rainfall, setRainfall] = useState<number>(750);
    const [indExtraction, setIndExtraction] = useState<number>(10);
    const [harvesting, setHarvesting] = useState<number>(20);
    const [droughtProtocol, setDroughtProtocol] = useState<boolean>(false);

    // Result State
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Initial load
    useEffect(() => {
        if (stations.length > 0 && !selectedZone) setSelectedZone(stations[0].id);
        if (stations.length > 0) handleRun();
    }, [stations]);

    const handleRun = () => {
        setLoading(true);
        setResult(null); // Reset to trigger animation on new data

        setTimeout(() => {
            const station = stations.find(s => s.id === selectedZone);
            const baseRecharge = (rainfall * 0.45 * 0.3);
            const harvestingBonus = (harvesting * 0.5);
            const totalRecharge = baseRecharge + harvestingBonus;

            const baseExtraction = 120;
            const reductionFactor = (indExtraction / 100) + (droughtProtocol ? 0.2 : 0);
            const totalExtraction = baseExtraction * (1 - reductionFactor);

            const balance = totalRecharge - totalExtraction;
            const refillRate = (totalRecharge / totalExtraction) * 100;

            setResult({
                location: station?.location || "Unknown Zone",
                recharge: parseFloat(totalRecharge.toFixed(1)),
                extraction: parseFloat(totalExtraction.toFixed(1)),
                balance: parseFloat(balance.toFixed(1)),
                status: balance < 0 ? 'Stressed' : 'Sustainable',
                refillRate: parseFloat(refillRate.toFixed(1))
            });
            setLoading(false);
        }, 600);
    };

    const chartData = result ? [
        { name: 'Inflow (Recharge)', value: result.recharge, color: '#6FAF8F' },
        { name: 'Outflow (Extraction)', value: result.extraction, color: '#C96A6A' }
    ] : [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Sliders size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-textMain">Simulation Lab</h2>
                    <p className="text-sm text-textMuted">Adjust policies to see impact</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Inputs Column */}
                <div className="space-y-8">
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
                                {stations.map(s => <option key={s.id} value={s.id}>{s.location}</option>)}
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
                        <input type="range" min="200" max="2000" step="50" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))} className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-textMain flex items-center gap-1">
                                Reduce Industrial Extraction <Info size={14} className="text-textMuted" />
                            </label>
                            <span className="text-sm font-bold text-textMain">{indExtraction}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="5" value={indExtraction} onChange={(e) => setIndExtraction(Number(e.target.value))} className="w-full accent-[#027598] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <p className="text-xs text-textMuted mt-1">Impact: High</p>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-textMain flex items-center gap-1">
                                Rainwater Harvesting <Info size={14} className="text-textMuted" />
                            </label>
                            <span className="text-sm font-bold text-textMain">{harvesting}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="5" value={harvesting} onChange={(e) => setHarvesting(Number(e.target.value))} className="w-full accent-[#EAB308] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <p className="text-xs text-textMuted mt-1">Impact: Medium (Long term)</p>
                    </div>

                    {/* Toggle */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-textMain">Enforce Drought Protocol</h4>
                            <p className="text-xs text-textMuted mt-1">Emergency bans on all non-essential use</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={droughtProtocol} onChange={(e) => setDroughtProtocol(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full py-4 bg-[#027598] text-white rounded-xl font-bold hover:bg-[#026584] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-lg relative overflow-hidden"
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
                                        <h3 className="text-lg font-bold text-textMain">Zone Analysis: {result.location}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${result.status === 'Stressed' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                                Status: {result.status}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600">
                                                Refill Rate: {result.refillRate}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Net Balance</p>
                                        <span className={`text-3xl font-black ${result.balance < 0 ? 'text-danger' : 'text-success'}`}>
                                            {result.balance > 0 ? '+' : ''}{result.balance} MCM
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                                    {/* Left: Detailed Cards */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#6FAF8F]">
                                            <p className="text-sm text-textMuted mb-1">Estimated Recharge</p>
                                            <p className="text-2xl font-bold text-[#EAB308]">{result.recharge} MCM</p>
                                            <p className="text-xs text-textMuted mt-1">From {rainfall}mm rain + 22.0% infiltration</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#C96A6A]">
                                            <p className="text-sm text-textMuted mb-1">Projected Extraction</p>
                                            <p className="text-2xl font-bold text-[#C96A6A]">{result.extraction} MCM</p>
                                            <p className="text-xs text-textMuted mt-1">Based on current usage & policies</p>
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
                                                    {chartData.map((entry: any, index: number) => (
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
                            <p className="font-medium">Configure policies & run simulation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Simulation = () => {
    const [stations, setStations] = useState<any[]>([]);

    useEffect(() => {
        MockDataService.getStations().then(setStations);
    }, []);

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-textMain">Analytics & Simulation Hub</h1>
                <p className="text-textMuted">Advanced tools for groundwater assessment and planning.</p>
            </div>

            {/* Merged Policy Guider */}
            <PolicyGuider stations={stations} />

            {/* Feature 5: Risk Analysis (Below) */}
            <RiskAnalysis />
        </div>
    );
};

export default Simulation;
