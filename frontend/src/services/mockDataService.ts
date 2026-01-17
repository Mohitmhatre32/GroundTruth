
export interface Station {
    id: string;
    name: string;
    district: string;
    lat: number;
    lng: number;
    waterLevel: number; // in meters (Depth)
    trend: 'rising' | 'falling' | 'stable';
    status: 'safe' | 'warning' | 'critical';
    lastUpdate: string;
    totalDepth: number; // Total aquifer depth
}

export interface Alert {
    id: string;
    stationId: string;
    message: string;
    severity: 'warning' | 'critical';
    timestamp: string;
}

export interface SimulationParams {
    industrialExtractionReduction: number; // 0-50%
    rainwaterHarvestingIncrease: number; // 0-100%
    droughtProtocol: boolean;
}

const STATIONS_DATA: Station[] = [
    { id: '1', name: 'Ludhiana Central', district: 'Ludhiana', lat: 30.9010, lng: 75.8573, waterLevel: 28.5, trend: 'falling', status: 'critical', lastUpdate: new Date().toISOString(), totalDepth: 100 },
    { id: '2', name: 'Amritsar North', district: 'Amritsar', lat: 31.6340, lng: 74.8723, waterLevel: 12.0, trend: 'stable', status: 'warning', lastUpdate: new Date().toISOString(), totalDepth: 80 },
    { id: '3', name: 'Patiala Rural', district: 'Patiala', lat: 30.3398, lng: 76.3869, waterLevel: 8.5, trend: 'rising', status: 'safe', lastUpdate: new Date().toISOString(), totalDepth: 90 },
    { id: '4', name: 'Jalandhar City', district: 'Jalandhar', lat: 31.3260, lng: 75.5762, waterLevel: 22.1, trend: 'falling', status: 'critical', lastUpdate: new Date().toISOString(), totalDepth: 110 },
    { id: '5', name: 'Bathinda Industrial', district: 'Bathinda', lat: 30.2110, lng: 74.9455, waterLevel: 18.2, trend: 'stable', status: 'warning', lastUpdate: new Date().toISOString(), totalDepth: 120 },
    { id: '6', name: 'Mohali Tech Park', district: 'Mohali', lat: 30.7046, lng: 76.7179, waterLevel: 25.0, trend: 'falling', status: 'critical', lastUpdate: new Date().toISOString(), totalDepth: 100 },
];

export const MockDataService = {
    getStations: (): Promise<Station[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...STATIONS_DATA]), 500);
        });
    },

    getHistory: (stationId: string): Promise<{ date: string; level: number; forecast: boolean }[]> => {
        // Generate 6 months of data
        const data = [];
        const today = new Date();
        for (let i = 180; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            // Fake trend based on station ID logic
            const base = stationId === '1' ? 25 : 10;
            const random = Math.sin(i / 30) * 2 + (Math.random() * 0.5);
            data.push({
                date: d.toISOString().split('T')[0],
                level: base + (i / 50) + random, // Increasing depth means water level dropping
                forecast: false
            });
        }
        // Forecast 30 days
        for (let i = 1; i <= 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            const lastVal = data[data.length - 1].level;
            data.push({
                date: d.toISOString().split('T')[0],
                level: lastVal + 0.05 + (Math.random() * 0.2), // Continued drop
                forecast: true
            });
        }
        return Promise.resolve(data);
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
