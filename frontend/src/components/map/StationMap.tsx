
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Use the same type as Dashboard
interface MapStation {
    id: string;
    name: string;
    location: string;
    waterLevel: number;
    status: 'safe' | 'warning' | 'critical';
    lat: number;
    lng: number;
}

const createCustomIcon = (status: MapStation['status']) => {
    let colorClass = '';
    switch (status) {
        case 'critical': colorClass = 'bg-danger shadow-red-500/50'; break;
        case 'warning': colorClass = 'bg-warning shadow-yellow-500/50'; break;
        case 'safe': colorClass = 'bg-success shadow-green-500/50'; break;
    }

    return L.divIcon({
        className: 'custom-pin',
        html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ${colorClass} animate-pulse-fast"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

interface StationMapProps {
    stations: MapStation[];
}

// Custom Marker component with hover popup
const HoverMarker = ({ station, onClick }: { station: MapStation; onClick: () => void }) => {
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
        const marker = markerRef.current;
        if (marker) {
            marker.on('mouseover', () => {
                marker.openPopup();
            });
            marker.on('mouseout', () => {
                marker.closePopup();
            });
        }
    }, []);

    return (
        <Marker
            ref={markerRef}
            position={[station.lat, station.lng]}
            icon={createCustomIcon(station.status)}
            eventHandlers={{
                click: onClick,
            }}
        >
            <Popup
                className="custom-hover-popup"
                closeButton={false}
                autoPan={false}
            >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-xl border border-gray-200/50 p-4 min-w-[200px]">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-base">{station.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${station.status === 'critical' ? 'bg-danger/10 text-danger' :
                            station.status === 'warning' ? 'bg-warning/10 text-warning' :
                                'bg-success/10 text-success'
                            }`}>
                            {station.status.toUpperCase()}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-textMuted">Baseline Level:</span>
                            <span className={`text-lg font-bold ${station.status === 'critical' ? 'text-danger' :
                                station.status === 'warning' ? 'text-warning' :
                                    'text-success'
                                }`}>
                                {station.waterLevel.toFixed(1)}m
                            </span>
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-textMuted italic">Click for detailed analytics</p>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

const StationMap: React.FC<StationMapProps> = ({ stations }) => {
    const navigate = useNavigate();

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <MapContainer
                center={[30.9010, 75.8573]} // Centered on Punjab (Ludhiana)
                zoom={8}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                />
                {stations.map(station => (
                    <HoverMarker
                        key={station.id}
                        station={station}
                        onClick={() => navigate(`/analytics/${station.id}`)}
                    />
                ))}
            </MapContainer>

            {/* Custom Styles for Popup */}
            <style>{`
                .custom-hover-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                }
                .custom-hover-popup .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                }
                .custom-hover-popup .leaflet-popup-tip {
                    background: white;
                }
            `}</style>
        </div>
    );
};

export default StationMap;
