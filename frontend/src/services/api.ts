// GroundTruth Frontend API Client
// Auto-generated from backend analysis

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Station Types
export interface Station {
    id: string;
    name: string;
    lat: number;
    lng: number;
    base_level_mbgl: number;
    status_hint: string;
    area_sq_km: number;
    infiltration_factor: number;
}

// Monitoring Types
export interface ReadingInput {
    station_id: string;
    water_level: number;
    status: string;
    timestamp: string;
}

export interface ReadingResponse {
    status: string;
    data: Record<string, unknown>;
}

// Forecasting Types
export interface HistoryRecord {
    ds: string;  // date in YYYY-MM-DD format
    y: number;   // water_level (averaged across stations)
}

// Analysis Types
export interface SimulationInput {
    station_id: string;
    rainfall: number;
    extraction_percent: number;
}

export interface SimulationResult {
    zone_name: string;
    area_sq_km: number;
    soil_infiltration: string;
    rainfall_input_mm: number;
    estimated_recharge_mcm: number;
    projected_extraction_mcm: number;
    net_balance_mcm: number;
    percent_refilled: number;
    status: string;
}

// Risk Assessment Types
export interface RiskInput {
    rainfall: number;
    area: number;
    population: number;
    crop_area: number;
    scenario: string;
}

export interface RiskResult {
    // Supply breakdown
    supply_mcm: number;
    gross_recharge_mcm?: number;
    evaporation_loss_mcm?: number;

    // Demand breakdown
    demand_mcm: number;
    domestic_demand_mcm?: number;
    industrial_demand_mcm?: number;
    agricultural_demand_mcm?: number;

    // Balance & Risk
    balance_mcm?: number;
    demand_supply_ratio?: number;
    risk_score: number;
    risk_label: string;
    status?: string;
    status_color?: string;

    // Scenario impact
    scenario?: string;
    scenario_impact?: string;

    // Future projection
    years_until_depletion?: number | null;

    // Context
    population?: number;
    area_sq_km?: number;
    rainfall_mm?: number;
    crop_area_sq_km?: number;
}

// Policy Types
export interface ClassificationResult {
    id: string;
    name: string;
    lat: number;
    lng: number;
    baseline_level: number;
    status: "Safe" | "Semi-Critical" | "Critical";
    color: string;
    policy_recommendation: string;
}

// Alert Types
export interface AlertRecord {
    alert_id: string;
    station_id: string;
    location: string;
    water_level: number;
    message: string;
    timestamp: string;
    type: string;
    is_read: boolean;
}

// Research/Forecasting Types
export interface ScenarioInput {
    station_id: string;
    rainfall_change_pct: number;
    extraction_change_pct: number;
}

export interface ScenarioResult {
    labels: string[];
    arima_data: number[];
    lstm_data: number[];
    history_labels: string[];
    history_data: number[];
}

export interface ExportDataResponse {
    csv_content?: string;
    error?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * MONITORING MODULE
 * Handles real-time sensor data updates
 */

export const updateReading = async (data: ReadingInput): Promise<ReadingResponse> => {
    const response = await fetch(`${API_BASE_URL}/update_reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update reading: ${response.statusText}`);
    }

    return response.json();
};

export const getLiveStatus = async (): Promise<{ status: string; data: any[] }> => {
    const response = await fetch(`${API_BASE_URL}/live_status`);

    if (!response.ok) {
        throw new Error(`Failed to fetch live status: ${response.statusText}`);
    }

    return response.json();
};


/**
 * FORECASTING MODULE
 * Provides historical trend data for dashboard visualization
 */

export const getHistory = async (): Promise<HistoryRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/history`);

    if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    return response.json();
};

/**
 * ANALYSIS MODULE
 * Water budget simulation and zone analysis
 */

export const getZones = async (): Promise<Station[]> => {
    const response = await fetch(`${API_BASE_URL}/zones`);

    if (!response.ok) {
        console.warn("Failed to fetch zones, returning empty list");
        return [];
    }

    return response.json();
};

export const analyzeZone = async (data: SimulationInput): Promise<SimulationResult> => {
    try {
        console.log('API: Calling analyze-zone with:', data);

        const response = await fetch(`${API_BASE_URL}/analyze-zone`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        console.log('API: Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API: Error response:', errorText);
            throw new Error(`Failed to analyze zone: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('API: Analyze-zone result:', result);

        return result;
    } catch (error) {
        console.error('API: analyzeZone error:', error);
        throw error;
    }
};

/**
 * RISK MODULE
 * Groundwater risk assessment based on demographics and agriculture
 */

export const analyzeRisk = async (data: RiskInput): Promise<RiskResult> => {
    try {
        console.log('API: Calling analyze-risk with:', data);

        const response = await fetch(`${API_BASE_URL}/analyze-risk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        console.log('API: Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API: Error response:', errorText);
            throw new Error(`Failed to analyze risk: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('API: Analyze-risk result:', result);

        return result;
    } catch (error) {
        console.error('API: analyzeRisk error:', error);
        throw error;
    }
};


/**
 * POLICY MODULE
 * Map classification for policy-makers
 */

export const getMapClassification = async (): Promise<ClassificationResult[]> => {
    const response = await fetch(`${API_BASE_URL}/map-classification`);

    if (!response.ok) {
        throw new Error(`Failed to fetch map classification: ${response.statusText}`);
    }

    return response.json();
};

/**
 * RESEARCH MODULE
 * Advanced forecasting with ARIMA/LSTM scenario simulation
 */

export const simulateScenario = async (data: ScenarioInput): Promise<ScenarioResult> => {
    const response = await fetch(`${API_BASE_URL}/simulate_scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to simulate scenario: ${response.statusText}`);
    }

    return response.json();
};

export const exportResearchData = async (): Promise<ExportDataResponse> => {
    const response = await fetch(`${API_BASE_URL}/research/export-data`);

    if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
    }

    return response.json();
};

/**
 * REPORTING MODULE
 * Download CSV/PDF reports
 */

export interface CustomReportParams {
    station_id: string;
    start: string;
    end: string;
}

export const exportOverallReport = async (type: 'csv' | 'pdf'): Promise<Blob> => {
    const endpoint = type === 'csv' ? '/export/overall-csv' : '/export/overall-pdf';
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return response.blob();
};

export const exportCustomReport = async (type: 'csv' | 'pdf', params: CustomReportParams): Promise<Blob> => {
    const endpoint = type === 'csv' ? '/export/custom-csv' : '/export/custom-pdf';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return response.blob();
};

/**
 * ALERTS MODULE
 * Handles system-wide alerts and notifications
 */

export const getAlerts = async (limit: number = 50): Promise<AlertRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/alerts?limit=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
    }

    return response.json();
};

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Generic error handler for API calls
 */
export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return "An unknown error occurred";
};

/**
 * Check if API is reachable
 */
export const healthCheck = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
        return response.ok;
    } catch {
        return false;
    }
};
