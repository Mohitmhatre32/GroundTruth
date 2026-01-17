
import React, { useState } from 'react';
import { MockDataService, SimulationParams } from '../services/mockDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sliders, RefreshCw, Zap } from 'lucide-react';

const Simulation = () => {
    const [params, setParams] = useState<SimulationParams>({
        industrialExtractionReduction: 10,
        rainwaterHarvestingIncrease: 20,
        droughtProtocol: false
    });

    const [result, setResult] = useState<{ years: number[], businessAsUsual: number[], projected: number[] } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRun = async () => {
        setLoading(true);
        const res = await MockDataService.runSimulation(params);
        setResult(res);
        setLoading(false);
    };

    // Convert result to chart format
    const chartData = result?.years.map((y, i) => ({
        year: y,
        bau: result.businessAsUsual[i],
        projected: result.projected[i]
    })) || [];

    return (
        <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Sliders size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-textMain">Simulation Lab</h2>
                        <p className="text-xs text-textMuted">Adjust policies to see impact</p>
                    </div>
                </div>

                <div className="space-y-8 flex-1">
                    <div>
                        <Label tooltip="Reduces heavy industrial pumping. High economic cost.">Reduce Industrial Extraction</Label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range" min="0" max="50" step="5"
                                value={params.industrialExtractionReduction}
                                onChange={(e) => setParams({ ...params, industrialExtractionReduction: Number(e.target.value) })}
                                className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="font-mono font-bold w-12 text-right">{params.industrialExtractionReduction}%</span>
                        </div>
                        <p className="text-xs text-textMuted mt-1">Impact: High</p>
                    </div>

                    <div>
                        <Label tooltip="Mandates rainwater units. Medium cost.">Rainwater Harvesting</Label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range" min="0" max="100" step="10"
                                value={params.rainwaterHarvestingIncrease}
                                onChange={(e) => setParams({ ...params, rainwaterHarvestingIncrease: Number(e.target.value) })}
                                className="w-full accent-secondary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="font-mono font-bold w-12 text-right">{params.rainwaterHarvestingIncrease}%</span>
                        </div>
                        <p className="text-xs text-textMuted mt-1">Impact: Medium (Long term)</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <Label>Enforce Drought Protocol</Label>
                            <p className="text-xs text-textMuted">Emergency bans on all non-essential use</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={params.droughtProtocol} onChange={(e) => setParams({ ...params, droughtProtocol: e.target.checked })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Zap />}
                        Run Simulation
                    </button>
                </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative min-h-[400px]">
                    {!result ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-textMuted/50">
                            <Sliders size={48} className="mb-4 opacity-20" />
                            <p>Run a simulation to see the forecast</p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="font-bold text-textMain text-lg">Projected Groundwater Depth (5 Years)</h3>
                                <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-semibold">
                                    Water Saved: {((result.businessAsUsual[4] - result.projected[4]).toFixed(2))}m
                                </div>
                            </div>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="year" stroke="#9ca3af" />
                                        <YAxis label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }} stroke="#9ca3af" reversed />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" name="Business As Usual" dataKey="bau" stroke="#C96A6A" strokeWidth={3} dot={true} />
                                        <Line type="monotone" name="With Policy Changes" dataKey="projected" stroke="#6FAF8F" strokeWidth={3} dot={true} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Impact Summary Cards - could add details here */}
            </div>
        </div>
    );
};

const Label = ({ children, tooltip }: any) => (
    <label className="block text-sm font-bold text-textMain mb-2 flex items-center gap-1">
        {children}
        {tooltip && <span className="text-xs text-textMuted font-normal">ⓘ</span>}
    </label>
);

export default Simulation;
