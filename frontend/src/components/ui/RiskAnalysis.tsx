import React, { useState } from 'react';
import { AlertTriangle, Users, Sprout, TrendingDown, TrendingUp, Clock, Info } from 'lucide-react';
import { analyzeRisk } from '../../services/api';
import { toast } from 'sonner';

// Extended interface for comprehensive risk analysis
interface RiskResultExtended {
    // Supply
    supply_mcm: number;
    gross_recharge_mcm: number;
    evaporation_loss_mcm: number;

    // Demand
    demand_mcm: number;
    domestic_demand_mcm: number;
    industrial_demand_mcm: number;
    agricultural_demand_mcm: number;

    // Balance & Risk
    balance_mcm: number;
    demand_supply_ratio: number;
    risk_score: number;
    risk_label: string;
    status: string;
    status_color: string;

    // Scenario
    scenario: string;
    scenario_impact: string;

    // Future
    years_until_depletion: number | null;

    // Context
    population: number;
    area_sq_km: number;
    rainfall_mm: number;
    crop_area_sq_km: number;
}

const RiskAnalysis = () => {
    const [population, setPopulation] = useState<number>(2000000);
    const [cropArea, setCropArea] = useState<number>(300);
    const [rainfall, setRainfall] = useState<number>(800);
    const [area, setArea] = useState<number>(500);
    const [scenario, setScenario] = useState<string>('normal');
    const [result, setResult] = useState<RiskResultExtended | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const res = await analyzeRisk({
                rainfall: rainfall,
                area: area,
                population: population,
                crop_area: cropArea,
                scenario: scenario.toLowerCase()
            }) as unknown as RiskResultExtended;

            console.log('Risk analysis result:', res);
            setResult(res);
            toast.success('Analysis completed successfully!');
        } catch (error) {
            console.error('Risk analysis error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to analyze risk');
        } finally {
            setLoading(false);
        }
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-textMain flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-warning" size={24} />
                    Demand-Supply Analysis & Scenario Planning
                </h3>
                <p className="text-sm text-textMuted">
                    Compare water availability (Supply) vs consumption (Demand) and simulate future scenarios
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: Input Controls */}
                <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-textMain mb-3 flex items-center gap-2">
                            <Info size={16} className="text-primary" />
                            What-If Scenario Simulator
                        </h4>
                        <select
                            className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                        >
                            <option value="normal">🌤️ Normal Conditions (Baseline)</option>
                            <option value="drought">☀️ Drought Scenario (40% less rain)</option>
                            <option value="flood">🌊 Flood Scenario (40% more rain)</option>
                            <option value="climate_change">🌡️ Climate Change (Higher temps)</option>
                            <option value="over_extraction">🏭 Over-Extraction (Industrial boom)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textMain mb-2">Rainfall (mm/year)</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                value={rainfall}
                                onChange={(e) => setRainfall(Number(e.target.value))}
                                min="200"
                                max="2000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMain mb-2">Area (km²)</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                value={area}
                                onChange={(e) => setArea(Number(e.target.value))}
                                min="100"
                                max="2000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-2 flex items-center gap-2">
                            <Users size={16} />
                            Population (People)
                        </label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            value={population}
                            onChange={(e) => setPopulation(Number(e.target.value))}
                            step="10000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-textMain mb-2 flex items-center gap-2">
                            <Sprout size={16} />
                            Crop Area (km²)
                        </label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            value={cropArea}
                            onChange={(e) => setCropArea(Number(e.target.value))}
                        />
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={loading}
                        className="w-full py-3 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-semibold shadow-md shadow-danger/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={18} />
                                Run Analysis
                            </>
                        )}
                    </button>
                </div>

                {/* RIGHT: Results Display */}
                <div className="flex flex-col">
                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-200">
                            <AlertTriangle size={56} className="text-gray-300 mb-4" />
                            <p className="text-textMuted text-center font-medium">
                                Configure parameters and run analysis to see results
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Scenario Impact Banner */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-blue-800">
                                    📊 {result.scenario_impact}
                                </p>
                            </div>

                            {/* Risk Score Card */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                                <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Overall Risk Score</p>
                                <div className="flex items-center justify-center gap-4 mb-3">
                                    <h2 className={`text-6xl font-black ${getRiskText(result.risk_score)}`}>
                                        {result.risk_score.toFixed(0)}
                                    </h2>
                                    <div className="text-left">
                                        <p className={`text-sm font-bold ${getRiskText(result.risk_score)}`}>
                                            {result.risk_label}
                                        </p>
                                        <p className="text-xs text-textMuted">out of 100</p>
                                    </div>
                                </div>

                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${getRiskColor(result.risk_score)}`}
                                        style={{ width: `${Math.min(result.risk_score, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bank Account Model */}
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                                <h4 className="font-bold text-textMain mb-3 flex items-center gap-2">
                                    💰 Bank Account Model
                                </h4>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp size={16} className="text-success" />
                                            <span className="text-xs font-semibold text-success uppercase">Income (Supply)</span>
                                        </div>
                                        <p className="text-2xl font-black text-success">{result.supply_mcm.toFixed(1)}</p>
                                        <p className="text-xs text-textMuted mt-1">MCM/year</p>
                                    </div>

                                    <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingDown size={16} className="text-danger" />
                                            <span className="text-xs font-semibold text-danger uppercase">Expenses (Demand)</span>
                                        </div>
                                        <p className="text-2xl font-black text-danger">{result.demand_mcm.toFixed(1)}</p>
                                        <p className="text-xs text-textMuted mt-1">MCM/year</p>
                                    </div>
                                </div>

                                <div className={`rounded-lg p-3 ${result.balance_mcm >= 0 ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'}`}>
                                    <p className="text-xs font-semibold uppercase mb-1">
                                        {result.balance_mcm >= 0 ? '✅ Savings (Surplus)' : '⚠️ Deficit'}
                                    </p>
                                    <p className={`text-3xl font-black ${result.balance_mcm >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {result.balance_mcm >= 0 ? '+' : ''}{result.balance_mcm.toFixed(1)} MCM
                                    </p>
                                    <p className="text-xs text-textMuted mt-1">
                                        Status: {result.status}
                                    </p>
                                </div>
                            </div>

                            {/* Demand Breakdown */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-textMain mb-3">Water Usage Breakdown</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-textMuted">🏠 Domestic</span>
                                        <span className="text-sm font-bold">{result.domestic_demand_mcm?.toFixed(1) || 0} MCM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-textMuted">🏭 Industrial</span>
                                        <span className="text-sm font-bold">{result.industrial_demand_mcm?.toFixed(1) || 0} MCM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-textMuted">🌾 Agricultural</span>
                                        <span className="text-sm font-bold">{result.agricultural_demand_mcm?.toFixed(1) || 0} MCM</span>
                                    </div>
                                </div>
                            </div>

                            {/* Future Projection */}
                            {result.years_until_depletion && (
                                <div className="bg-danger/10 border-2 border-danger/30 rounded-xl p-4 flex items-start gap-3">
                                    <Clock size={20} className="text-danger flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-danger text-sm mb-1">
                                            ⏰ Critical Warning
                                        </p>
                                        <p className="text-xs text-textMain">
                                            At current extraction rates, groundwater reserves may deplete in approximately{' '}
                                            <span className="font-black text-danger">{result.years_until_depletion} years</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskAnalysis;
