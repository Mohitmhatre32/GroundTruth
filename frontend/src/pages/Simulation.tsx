import React, { useState, useEffect } from 'react';
import { MockDataService, SimulationParams } from '../services/mockDataService';
import RechargeCalculator from '../components/ui/RechargeCalculator';
import RiskAnalysis from '../components/ui/RiskAnalysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sliders, RefreshCw, Zap } from 'lucide-react';

// Internal component for the Policy Simulation (formerly Simulation Lab)
const SimulationLab = () => {
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

    const chartData = result?.years.map((y, i) => ({
        year: y,
        bau: result.businessAsUsual[i],
        projected: result.projected[i]
    })) || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="space-y-6 flex-1">
                    <div>
                        <label className="block text-sm font-bold text-textMain mb-2">Reduce Ind. Extraction</label>
                        <div className="flex items-center gap-4">
                            <input type="range" min="0" max="50" step="5" value={params.industrialExtractionReduction} onChange={(e) => setParams({ ...params, industrialExtractionReduction: Number(e.target.value) })} className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <span className="font-mono font-bold w-12 text-right">{params.industrialExtractionReduction}%</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-textMain mb-2">Rainwater Harvesting</label>
                        <div className="flex items-center gap-4">
                            <input type="range" min="0" max="100" step="10" value={params.rainwaterHarvestingIncrease} onChange={(e) => setParams({ ...params, rainwaterHarvestingIncrease: Number(e.target.value) })} className="w-full accent-secondary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <span className="font-mono font-bold w-12 text-right">{params.rainwaterHarvestingIncrease}%</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <button onClick={handleRun} disabled={loading} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                        {loading ? <RefreshCw className="animate-spin" /> : <Zap />} Run Policy Model
                    </button>
                </div>
            </div>
            <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
    );
}

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

            {/* Feature 3: Recharge */}
            <RechargeCalculator stations={stations} />

            {/* Feature 5: Risk Analysis */}
            <RiskAnalysis />

            {/* Original Simulation (Policy) - Keeping it as "Advanced Policy Simulation" */}
            <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-textMain mb-6">Long-term Policy Simulation</h2>
                <SimulationLab />
            </div>
        </div>
    );
};

export default Simulation;
