import React, { useState } from 'react';
import { MockDataService, RiskAnalysisResult } from '../../services/mockDataService';
import { AlertTriangle, Users, Sprout } from 'lucide-react';

const RiskAnalysis = () => {
    const [population, setPopulation] = useState<number>(50000);
    const [cropArea, setCropArea] = useState<number>(300);
    const [scenario, setScenario] = useState<string>('Normal');
    const [result, setResult] = useState<RiskAnalysisResult | null>(null);

    const handleSimulate = async () => {
        const res = await MockDataService.analyzeRisk(population, cropArea, scenario);
        setResult(res);
    };

    const getRiskColor = (score: number) => {
        if (score < 40) return 'bg-success';
        if (score < 70) return 'bg-warning';
        return 'bg-danger';
    };

    const getRiskText = (score: number) => {
        if (score < 40) return 'text-success';
        if (score < 70) return 'text-warning';
        return 'text-danger';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                <AlertTriangle className="text-warning" size={20} />
                Demand-Supply Risk Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Scenario</label>
                        <select
                            className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-primary outline-none"
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                        >
                            <option>Normal</option>
                            <option>Drought</option>
                            <option>Climate Change</option>
                        </select>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-textMain mb-1">Population</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                            <input
                                type="number"
                                className="w-full pl-9 p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                value={population}
                                onChange={(e) => setPopulation(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-textMain mb-1">Crop Area (sq km)</label>
                        <div className="relative">
                            <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                            <input
                                type="number"
                                className="w-full pl-9 p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                value={cropArea}
                                onChange={(e) => setCropArea(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        className="w-full py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium shadow-md shadow-danger/20"
                    >
                        Simulate Risk
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                    {!result ? (
                        <div className="text-center text-textMuted">
                            <AlertTriangle size={48} className="mx-auto mb-2 opacity-20" />
                            <p>Run simulation to view risk</p>
                        </div>
                    ) : (
                        <div className="w-full text-center">
                            <p className="text-sm font-medium text-textMuted uppercase tracking-wider mb-2">Risk Score</p>
                            <h2 className={`text-5xl font-black mb-1 ${getRiskText(result.risk_score)}`}>{result.risk_score}</h2>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-6 ${getRiskColor(result.risk_score)}`}>
                                {result.risk_label}
                            </span>

                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
                                <div
                                    className={`h-full transition-all duration-1000 ${getRiskColor(result.risk_score)}`}
                                    style={{ width: `${result.risk_score}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-4">
                                <div>
                                    <p className="text-textMuted">Supply</p>
                                    <p className="font-bold text-success">{result.supply_mcm} MCM</p>
                                </div>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <div>
                                    <p className="text-textMuted">Demand</p>
                                    <p className="font-bold text-danger">{result.demand_mcm} MCM</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskAnalysis;
