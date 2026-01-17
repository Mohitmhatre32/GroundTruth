
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getMapClassification, ClassificationResult } from '../services/api';
import { Shield, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

// Reusing the icon logic but keeping it local to avoid dependency issues
const createCustomIcon = (status: ClassificationResult['status']) => {
    let colorClass = '';
    switch (status) {
        case 'Critical': colorClass = 'bg-danger shadow-red-500/50'; break;
        case 'Semi-Critical': colorClass = 'bg-warning shadow-yellow-500/50'; break;
        case 'Safe': colorClass = 'bg-success shadow-green-500/50'; break;
    }

    return L.divIcon({
        className: 'custom-pin',
        html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ${colorClass} animate-pulse-fast"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

const Policy = () => {
    const [zones, setZones] = useState<ClassificationResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<ClassificationResult | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMapClassification();
                setZones(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load policy data", error);
                toast.error("Failed to load policy data");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        if (status === 'Critical') return 'text-danger';
        if (status === 'Semi-Critical') return 'text-warning';
        return 'text-success';
    };

    const getStatusBg = (status: string) => {
        if (status === 'Critical') return 'bg-danger/10 border-danger/20';
        if (status === 'Semi-Critical') return 'bg-warning/10 border-warning/20';
        return 'bg-success/10 border-success/20';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
                    <Shield className="text-primary" />
                    Policy & Regulation Map
                </h1>
                <p className="text-textMuted">
                    Zone-wise groundwater status and official policy recommendations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
                {/* MAP SECTION */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative h-[500px] lg:h-auto">
                    <MapContainer
                        center={[23.0, 78.0]} // Approximate center of India
                        zoom={5}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        />
                        {zones.map(zone => (
                            <Marker
                                key={zone.id}
                                position={[zone.lat, zone.lng]}
                                icon={createCustomIcon(zone.status)}
                                eventHandlers={{
                                    click: () => setSelectedZone(zone)
                                }}
                            >
                                <Popup>
                                    <div className="font-semibold">{zone.name}</div>
                                    <div className={`text-xs ${getStatusColor(zone.status)}`}>{zone.status}</div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                    {/* Legend */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow border border-gray-100 text-xs z-[1000]">
                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-success"></span> Safe</div>
                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-warning"></span> Semi-Critical</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-danger"></span> Critical</div>
                    </div>
                </div>

                {/* DETAILS PANEL */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px] lg:h-auto overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-semibold text-textMain flex items-center gap-2">
                            <Info size={18} />
                            Policy Details
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedZone ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className={`p-4 rounded-lg border mb-4 ${getStatusBg(selectedZone.status)}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedZone.name}</h3>
                                            <p className="text-xs text-textMuted font-mono">{selectedZone.id}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold bg-white/50 ${getStatusColor(selectedZone.status)}`}>
                                            {selectedZone.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-3">
                                        <span>Current Level:</span>
                                        <span className="font-mono font-bold">{selectedZone.baseline_level} mbgl</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-textMuted uppercase tracking-wider">Official Recommendation</h4>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-sm leading-relaxed flex gap-3">
                                        <Shield className="shrink-0 text-blue-600" size={20} />
                                        {selectedZone.policy_recommendation}
                                    </div>

                                    <h4 className="font-semibold text-sm text-textMuted uppercase tracking-wider mt-6">Action Plan</h4>
                                    <ul className="space-y-2 text-sm">
                                        {selectedZone.status === 'Critical' && (
                                            <>
                                                <li className="flex gap-2 items-center text-textMain"><AlertTriangle size={14} className="text-danger" /> Halt new industrial licenses</li>
                                                <li className="flex gap-2 items-center text-textMain"><ExternalLink size={14} className="text-gray-400" /> Enforce crop rotation (Govt. Order #221)</li>
                                            </>
                                        )}
                                        {selectedZone.status === 'Semi-Critical' && (
                                            <>
                                                <li className="flex gap-2 items-center text-textMain"><CheckCircle size={14} className="text-warning" /> Mandate rainwater harvesting</li>
                                                <li className="flex gap-2 items-center text-textMain"><Info size={14} className="text-gray-400" /> Increase monitoring frequency</li>
                                            </>
                                        )}
                                        {selectedZone.status === 'Safe' && (
                                            <>
                                                <li className="flex gap-2 items-center text-textMain"><CheckCircle size={14} className="text-success" /> Continue routine monitoring</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center text-textMuted text-center p-6">
                                <div className="bg-gray-100 p-4 rounded-full mb-4">
                                    <Shield size={32} className="text-gray-400" />
                                </div>
                                <p>Select a zone on the map to view detailed policy recommendations and action plans.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Policy;
