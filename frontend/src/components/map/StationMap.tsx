
import React from 'react';
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
                    <Marker
                        key={station.id}
                        position={[station.lat, station.lng]}
                        icon={createCustomIcon(station.status)}
                        eventHandlers={{
                            click: () => {
                                navigate(`/analytics/${station.id}`);
                            },
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[150px]">
                                <h3 className="font-bold text-textMain">{station.name}</h3>
                                <div className="text-sm mt-1">
                                    <span className="text-textMuted">Level: </span>
                                    <span className={`font-semibold ${station.status === 'critical' ? 'text-danger' :
                                        station.status === 'warning' ? 'text-warning' : 'text-success'
                                        }`}>
                                        {station.waterLevel.toFixed(1)}m ({station.status})
                                    </span>
                                </div>
                                <div className="text-xs text-textMuted mt-1">
                                    Click for analytics
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default StationMap;
