import React, { useState } from 'react';
import { MockDataService, Station, ZoneAnalysisResult } from '../../services/mockDataService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { RefreshCw } from 'lucide-react';

interface Props {
    stations: Station[];
}

const RechargeCalculator: React.FC<Props> = ({ stations }) => {
    const [selectedZone, setSelectedZone] = useState<string>(stations[0]?.id || '1');
    const [rainfall, setRainfall] = useState<number>(1200);
    const [extraction, setExtraction] = useState<number>(100);
    const [result, setResult] = useState<ZoneAnalysisResult | null>(null);

    const handleAnalyze = async () => {
        const res = await MockDataService.analyzeZone(selectedZone, rainfall, extraction);
        setResult(res);
    };

    const chartData = result ? [
        { name: 'Recharge', value: result.estimated_recharge_mcm, color: '#027598' }, // Blue
        { name: 'Extraction', value: result.projected_extraction_mcm, color: '#C96A6A' } // Red
    ] : [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-textMain mb-4">Zone-Specific Recharge Analytics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Select Zone</label>
                        <select
                            className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                        >
                            {stations.map(s => <option key={s.id} value={s.id}>{s.location}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Rainfall (mm): {rainfall}</label>
                        <input type="range" min="200" max="2000" step="50" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))} className="w-full accent-primary" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Extraction Policy (%): {extraction}%</label>
                        <input type="range" min="50" max="150" step="5" value={extraction} onChange={(e) => setExtraction(Number(e.target.value))} className="w-full accent-danger" />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        className="w-full py-2 bg-textMain text-white rounded-lg hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} /> Analyze Zone
                    </button>
                </div>

                {/* Results */}
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[250px] relative">
                    {!result ? (
                        <div className="text-textMuted text-sm">Select parameters to analyze</div>
                    ) : (
                        <div className="w-full h-full">
                            <div className="text-center mb-2">
                                <span className={`text-xl font-bold ${result.status === 'Stressed' ? 'text-danger' : 'text-success'}`}>
                                    Net Balance: {result.net_balance_mcm} MCM ({result.status})
                                </span>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={chartData} margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" fontSize={12} width={80} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RechargeCalculator;
