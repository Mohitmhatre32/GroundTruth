import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Info, MapPin, Filter } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getSatelliteData, GeoJSONCollection } from '../services/api';
import { toast } from 'sonner';

// Custom component to focus map on data bounds
const MapBounds = ({ data }: { data: GeoJSONCollection | null }) => {
    const map = useMap();
    useEffect(() => {
        if (data && data.features.length > 0) {
            const lats = data.features.map(f => f.geometry.coordinates[1]);
            const lngs = data.features.map(f => f.geometry.coordinates[0]);
            const bounds = [
                [Math.min(...lats), Math.min(...lngs)],
                [Math.max(...lats), Math.max(...lngs)]
            ] as [number, number][];
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [data, map]);
    return null;
};

const Vegetation = () => {
    const [satelliteData, setSatelliteData] = useState<GeoJSONCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFeature, setSelectedFeature] = useState<any>(null);

    useEffect(() => {
        const fetchSatellite = async () => {
            try {
                const data = await getSatelliteData();
                setSatelliteData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching satellite data:', error);
                toast.error('Failed to load vegetation data');
                setLoading(false);
            }
        };

        fetchSatellite();
    }, []);

    const onEachFeature = (feature: any, layer: any) => {
        layer.on({
            click: () => setSelectedFeature(feature.properties),
            mouseover: (e: any) => {
                const el = e.target;
                el.setStyle({
                    fillOpacity: 0.9,
                    weight: 3,
                    color: '#fff'
                });
            },
            mouseout: (e: any) => {
                const el = e.target;
                el.setStyle({
                    fillOpacity: 0.6,
                    weight: 1,
                    color: feature.properties.fill
                });
            }
        });
    };

    const pointToLayer = (feature: any, latlng: any) => {
        // Use Orange/Amber for Water Stress (NDVI < 0.45)
        let color = feature.properties.fill;
        const ndvi = feature.properties.ndvi_score;
        if (ndvi < 0.45) color = "#f59e0b"; // Amber-500
        if (ndvi < 0.3) color = "#ef4444";  // Red-500

        return L.circle(latlng, {
            radius: 12000 + (ndvi * 15000), // 12km to 27km radius
            fillColor: color,
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-primary mb-4"
                    >
                        <Leaf size={48} />
                    </motion.div>
                    <p className="text-textMuted font-bold uppercase tracking-widest text-xs">Analyzing Vegetation Indices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px-48px)] flex flex-col gap-6 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Leaf className="text-success" />
                        Agricultural Intelligence
                    </h1>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                        NDVI Satellite Monitoring • Real-time Crop Health
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-[#006400]"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Lush</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-[#228B22]"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Healthy</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Stress</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Arid</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Map Section */}
                <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative bg-white">
                    <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; CARTO'
                        />
                        <ZoomControl position="topright" />
                        {satelliteData && (
                            <GeoJSON
                                data={satelliteData as any}
                                onEachFeature={onEachFeature}
                                pointToLayer={pointToLayer}
                            />
                        )}
                        <MapBounds data={satelliteData} />
                    </MapContainer>

                    {/* Heatmap Legend Overlay */}
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/50 z-[1000] max-w-[200px]">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Health Index (NDVI)</h4>
                        <div className="h-2 w-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-700 rounded-full mb-2"></div>
                        <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                            <span>0.0 (Arid)</span>
                            <span>1.0 (Lush)</span>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {selectedFeature ? (
                            <motion.div
                                key={selectedFeature.station_id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white p-6 rounded-2xl shadow-lg border border-primary/10 space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900">{selectedFeature.station_id}</h3>
                                    <button
                                        onClick={() => setSelectedFeature(null)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <Filter size={16} />
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vegetation Score</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-primary">{selectedFeature.ndvi_score}</span>
                                        <span className={`text-xs font-bold mb-1.5 ${selectedFeature.ndvi_score > 0.7 ? 'text-success' :
                                            selectedFeature.ndvi_score > 0.5 ? 'text-blue-500' : 'text-warning'
                                            }`}>
                                            {selectedFeature.ndvi_score > 0.7 ? 'Lush Forest' :
                                                selectedFeature.ndvi_score > 0.5 ? 'Healthy Crops' : 'Water Stress'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Potential Yield</span>
                                        <span className="font-bold text-slate-900">High</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Pumping Risk</span>
                                        <span className={`font-bold ${selectedFeature.ndvi_score > 0.7 ? 'text-danger' : 'text-success'}`}>
                                            {selectedFeature.ndvi_score > 0.7 ? 'Elevated' : 'Low'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Soil Moisture</span>
                                        <span className="font-bold text-slate-900">Optimal</span>
                                    </div>
                                </div>

                                <button className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                                    <Info size={16} className="text-primary" />
                                    Full Satellite Profile
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-primary/5 border-2 border-dashed border-primary/20 p-8 rounded-2xl text-center space-y-4 h-full flex flex-col justify-center"
                            >
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                    <MapPin className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight">Select Region</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Click on any colored sector on the map to view detailed vegetation health and water consumption analytics.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Stats Card - WHITE THEME */}
                    <div className="bg-white p-6 rounded-2xl text-slate-900 shadow-lg border border-slate-100 relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Leaf size={80} className="text-success" />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Network Overview</h4>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <p className="text-2xl font-black text-primary">0.68</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">Avg NDVI</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-success">82%</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">Health Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Vegetation;
