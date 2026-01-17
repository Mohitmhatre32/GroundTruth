
export interface Station {
    id: string;
    name: string;
    location: string; // New field
    district: string;
    lat: number;
    lng: number;
    waterLevel: number; // in meters (Depth)
    trend: 'rising' | 'falling' | 'stable';
    status: 'safe' | 'warning' | 'critical';
    lastUpdate: string;
    totalDepth: number;
    // For Risk Analysis mocking
    population: number;
    cropArea: number;
}

export interface ZoneAnalysisResult {
    zone_name: string;
    area_sq_km: number;
    estimated_recharge_mcm: number;
    projected_extraction_mcm: number;
    net_balance_mcm: number;
    status: string;
}

export interface RiskAnalysisResult {
    supply_mcm: number;
    demand_mcm: number;
    risk_score: number;
    risk_label: 'Low' | 'Medium' | 'High';
}

export interface SimulationParams {
    industrialExtractionReduction: number; // 0-50%
    rainwaterHarvestingIncrease: number; // 0-100%
    droughtProtocol: boolean;
}

const STATIONS_DATA: Station[] = [
    { id: '1', name: 'Ludhiana Central', location: 'Ludhiana Central - Ind. Zone', district: 'Ludhiana', lat: 30.9010, lng: 75.8573, waterLevel: 35.21, trend: 'falling', status: 'critical', lastUpdate: new Date().toISOString(), totalDepth: 100, population: 150000, cropArea: 120 },
    { id: '2', name: 'Amritsar North', location: 'Amritsar North - Agri Zone', district: 'Amritsar', lat: 31.6340, lng: 74.8723, waterLevel: 12.0, trend: 'stable', status: 'warning', lastUpdate: new Date().toISOString(), totalDepth: 80, population: 80000, cropArea: 450 },
    { id: '3', name: 'Patiala Rural', location: 'Patiala Rural - Green Zone', district: 'Patiala', lat: 30.3398, lng: 76.3869, waterLevel: 8.5, trend: 'rising', status: 'safe', lastUpdate: new Date().toISOString(), totalDepth: 90, population: 45000, cropArea: 600 },
    { id: '4', name: 'Jalandhar City', location: 'Jalandhar City - Urban', district: 'Jalandhar', lat: 31.3260, lng: 75.5762, waterLevel: 22.1, trend: 'falling', status: 'critical', lastUpdate: new Date().toISOString(), totalDepth: 110, population: 200000, cropArea: 50 },
    { id: '5', name: 'Bathinda Industrial', location: 'Bathinda Industrial', district: 'Bathinda', lat: 30.2110, lng: 74.9455, waterLevel: 18.2, trend: 'stable', status: 'warning', lastUpdate: new Date().toISOString(), totalDepth: 120, population: 90000, cropArea: 150 },
    { id: '6', name: 'Mohali Tech Park', location: 'Mohali Tech Park', district: 'Mohali', lat: 30.7046, lng: 76.7179, waterLevel: 25.0, trend: 'falling', status: 'critical', lastUpdate: new Date().toISOString(), totalDepth: 100, population: 120000, cropArea: 10 },
];

export const MockDataService = {
    getStations: (): Promise<Station[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...STATIONS_DATA]), 500);
        });
    },

    getHistory: (stationId?: string): Promise<{ date: string; level: number; forecast: boolean }[]> => {
        // Generate 5 years of data for Feature 2
        const data = [];
        const today = new Date();
        // 5 years * 12 months = 60 points approx
        for (let i = 60; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(d.getMonth() - i);
            // Seasonal wave pattern
            const base = 25;
            // Seasonal fluctuation: Higher in monsoon (lower depth), lower in summer (higher depth)
            // Math.sin for seasonality
            const seasonal = Math.sin(i / 2) * 5;
            const trend = i * 0.1; // Gentle depletion over 5 years (reverse logic since i is decreasing)

            data.push({
                date: d.toISOString().split('T')[0].slice(0, 7), // YYYY-MM
                level: base + seasonal - trend + (Math.random()),
                forecast: false
            });
        }
        return Promise.resolve(data);
    },

    analyzeZone: (stationId: string, rainfall: number, extractionPercent: number): Promise<ZoneAnalysisResult> => {
        return new Promise((resolve) => {
            const recharge = (rainfall * 0.450 * 0.3); // Dummy Area 450, 30% infiltration
            const extraction = 120 * (extractionPercent / 100);
            const balance = recharge - extraction;

            resolve({
                zone_name: STATIONS_DATA.find(s => s.id === stationId)?.location || 'Unknown Zone',
                area_sq_km: 450,
                estimated_recharge_mcm: parseFloat(recharge.toFixed(1)),
                projected_extraction_mcm: parseFloat(extraction.toFixed(1)),
                net_balance_mcm: parseFloat(balance.toFixed(1)),
                status: balance < 0 ? 'Stressed' : 'Sustainable'
            });
        });
    },

    analyzeRisk: (population: number, cropArea: number, scenario: string): Promise<RiskAnalysisResult> => {
        return new Promise((resolve) => {
            // Logic: 
            // Demand = (Pop * 0.0001) + (Crop * 0.1)
            // Supply = Based on Scenario

            const demand = (population * 0.00005) + (cropArea * 0.15);
            let supply = 50; // Normal
            if (scenario === 'Drought') supply = 30;
            if (scenario === 'Climate Change') supply = 35;

            const ratio = demand / supply;
            let riskScore = Math.min(100, (ratio * 50));

            resolve({
                supply_mcm: parseFloat(supply.toFixed(1)),
                demand_mcm: parseFloat(demand.toFixed(1)),
                risk_score: parseFloat(riskScore.toFixed(1)),
                risk_label: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low'
            });
        });
    },

    // Simulate simulation lab logic
    runSimulation: (params: SimulationParams): Promise<{ years: number[]; businessAsUsual: number[]; projected: number[] }> => {
        return new Promise((resolve) => {
            const years = [2024, 2025, 2026, 2027, 2028];
            const businessAsUsual = [28.5, 30.2, 32.1, 34.5, 36.8]; // Depleting (depth increasing)

            // Calculate impact
            // Rainwater harvesting reduces depletion rate
            // Industrial ban reduces extraction immediately

            const impactFactor = (params.rainwaterHarvestingIncrease * 0.05) + (params.industrialExtractionReduction * 0.08) + (params.droughtProtocol ? 2 : 0);

            const projected = businessAsUsual.map((val, idx) => {
                if (idx === 0) return val;
                const reduction = idx * impactFactor;
                return val - reduction;
            });

            setTimeout(() => resolve({ years, businessAsUsual, projected }), 800);
        });
    }
};
