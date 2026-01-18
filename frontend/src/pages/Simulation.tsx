import React, { useState, useEffect } from 'react';
import RiskAnalysis from '../components/ui/RiskAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Sliders, RefreshCw, Zap, MapPin, ChevronDown, Check, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getZones, analyzeZone, Station, SimulationResult } from '../services/api';
import { toast } from 'sonner';

const Simulation = () => {
    // Station State
    const [stations, setStations] = useState<Station[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    // Simulation State
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [selectedZoneName, setSelectedZoneName] = useState<string>('');
    const [rainfall, setRainfall] = useState<number>(750);
    const [extractionPercent, setExtractionPercent] = useState<number>(100);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [simLoading, setSimLoading] = useState(false);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Initial load
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const data = await getZones();
                setStations(data);
                if (data.length > 0) {
                    setSelectedZone(data[0].id);
                    setSelectedZoneName(data[0].name);
                }
            } catch (error) {
                console.error('Error fetching stations:', error);
                toast.error('Failed to load stations');
            } finally {
                setPageLoading(false);
            }
        };

        fetchStations();
    }, []);

    const handleRun = async () => {
        if (!selectedZone) {
            toast.error('Please select a zone');
            return;
        }

        setSimLoading(true);
        setResult(null);

        try {
            // Call real API
            const simulationResult: SimulationResult = await analyzeZone({
                station_id: selectedZone,
                rainfall: rainfall,
                extraction_percent: extractionPercent
            });

            setResult(simulationResult);
            toast.success('Simulation completed successfully');
        } catch (error) {
            console.error('Simulation error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to run simulation');
        } finally {
            setSimLoading(false);
        }
    };

    const chartData = result ? [
        { name: 'Recharge', value: result.estimated_recharge_mcm, color: '#6FAF8F' },
        { name: 'Extraction', value: result.projected_extraction_mcm, color: '#C96A6A' }
    ] : [];

    // Filter stations based on search
    const filteredStations = stations.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (pageLoading) {
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
        <div className="space-y-6 pb-10 h-[calc(100vh-100px)]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-textMain">Analytics & Simulation Hub</h1>
                <p className="text-textMuted">Advanced tools for groundwater assessment and planning.</p>
            </div>

            {/* SPLIT VIEW LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
                {/* LEFT: CONTROLS */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 flex-1 flex flex-col">
                        <div className="space-y-8 flex-1">
                            {/* Zone Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Target Zone</label>

                                <div className="relative">
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform z-10" size={18} />
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(!isDropdownOpen);
                                                if (!isDropdownOpen) setSearchQuery("");
                                            }}
                                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-white/40 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-textMain flex items-center justify-between transition-all shadow-sm cursor-pointer group hover:bg-white/80"
                                        >
                                            <span className="truncate">{selectedZoneName || 'Select a zone...'}</span>
                                            <ChevronDown className={`transition-transform duration-300 text-primary ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-primary/20 shadow-2xl max-h-[350px] overflow-hidden z-[100] flex flex-col"
                                            >
                                                {/* Search Input */}
                                                <div className="p-3 border-b border-primary/10 bg-slate-50 sticky top-0 z-10">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="Search zones..."
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
                                                            No zones found
                                                        </div>
                                                    ) : (
                                                        filteredStations.map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => {
                                                                    setSelectedZone(s.id);
                                                                    setSelectedZoneName(s.name);
                                                                    setIsDropdownOpen(false);
                                                                    setResult(null); // Clear previous results
                                                                }}
                                                                className={`w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors rounded-lg mb-1 ${selectedZone === s.id ? 'bg-primary/5 text-primary font-bold' : 'text-slate-700'
                                                                    }`}
                                                            >
                                                                <span className="truncate">{s.name}</span>
                                                                {selectedZone === s.id && (
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
                            </div>

                            {/* Rain Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
                                        Annual Rainfall
                                    </label>
                                    <span className="text-lg font-bold text-primary tabular-nums">{rainfall}<span className="text-sm text-textMuted font-normal ml-1">mm</span></span>
                                </div>
                                <input
                                    type="range"
                                    min="200"
                                    max="2000"
                                    step="50"
                                    value={rainfall}
                                    onChange={(e) => setRainfall(Number(e.target.value))}
                                    className="w-full h-3 bg-gray-200/50 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                                />
                            </div>

                            {/* Extraction Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
                                        Extraction Load
                                    </label>
                                    <span className={`text-lg font-bold tabular-nums ${extractionPercent > 100 ? 'text-danger' : 'text-primary'}`}>
                                        {extractionPercent}<span className="text-sm text-textMuted font-normal ml-1">%</span>
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    step="10"
                                    value={extractionPercent}
                                    onChange={(e) => setExtractionPercent(Number(e.target.value))}
                                    className={`w-full h-3 bg-gray-200/50 rounded-lg appearance-none cursor-pointer hover:opacity-90 transition-all ${extractionPercent > 100 ? 'accent-danger' : 'accent-primary'}`}
                                />
                                <p className="text-xs text-textMuted mt-1 text-center">100% = Current avg extraction</p>
                            </div>
                        </div>

                        <button
                            onClick={handleRun}
                            disabled={simLoading || !selectedZone}
                            className="w-full py-4 mt-6 bg-gradient-to-r from-primary to-[#026584] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {simLoading ? <RefreshCw className="animate-spin" /> : <Zap className="fill-white/20" />}
                            {simLoading ? 'Simulating...' : 'Run Simulation'}
                        </button>
                    </div>
                </div>

                {/* RIGHT: RESULTS */}
                <div className="lg:col-span-8 h-full">
                    <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 h-full flex flex-col relative overflow-hidden">
                        {!result ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center mb-6 border border-white/20">
                                    <Sliders size={40} className="text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-textMain mb-2">Ready to Simulate</h3>
                                <p className="text-textMuted max-w-sm">
                                    Select a zone and adjust the parameters to generate a predictive hydro-spatial model.
                                </p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Result Header */}
                                <div className="flex justify-between items-start border-b border-gray-200/50 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-textMain">Zone: {result.zone_name || 'Unknown'}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${result.status === 'Deficit' || result.status === 'Critical' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                                Status: {result.status || 'Unknown'}
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

                                {/* Content Grid - Grounded */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                                    <div className="space-y-4 flex flex-col justify-center">
                                        <div className="surface-card p-5 border-l-4 border-l-success">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center sm:text-left">Estimated Recharge</p>
                                            <div className="flex items-baseline justify-center sm:justify-start gap-1">
                                                <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{result.estimated_recharge_mcm?.toFixed(1) || '0.0'}</p>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">mcm</span>
                                            </div>
                                            <p className="text-[10px] text-success font-bold mt-2 uppercase tracking-tighter text-center sm:text-left">Based on {result.rainfall_input_mm || 0}mm rain cycle</p>
                                        </div>
                                        <div className="surface-card p-5 border-l-4 border-l-danger">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center sm:text-left">Projected Extraction</p>
                                            <div className="flex items-baseline justify-center sm:justify-start gap-1">
                                                <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{result.projected_extraction_mcm?.toFixed(1) || '0.0'}</p>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">mcm</span>
                                            </div>
                                            <p className="text-[10px] text-danger font-bold mt-2 uppercase tracking-tighter text-center sm:text-left">Coverage: {result.area_sq_km || 0} km² surface</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-h-[250px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                />
                                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
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
                </div>
            </div>

            {/* Feature 5: Risk Analysis (Below) */}
            <RiskAnalysis />
        </div>
    );
};

export default Simulation;
