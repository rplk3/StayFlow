import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Truck, Crown, Users, Clock, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { estimateTransportCost } from '../../hotelRoom/services/bookingApi';

// Fix leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const vehicles = [
    { type: 'sedan', label: 'Sedan', icon: Car, desc: 'Comfortable sedan for 1-3 passengers', rate: 35, base: 500, passengers: 3, color: 'from-blue-500 to-blue-600' },
    { type: 'suv', label: 'SUV', icon: Car, desc: 'Spacious SUV for up to 5 passengers', rate: 50, base: 800, passengers: 5, color: 'from-emerald-500 to-emerald-600' },
    { type: 'van', label: 'Van', icon: Truck, desc: 'Mini van for groups up to 8', rate: 65, base: 1000, passengers: 8, color: 'from-amber-500 to-amber-600' },
    { type: 'luxury', label: 'Luxury', icon: Crown, desc: 'Premium luxury vehicle', rate: 100, base: 2000, passengers: 3, color: 'from-purple-500 to-purple-600' },
];

// Map click handler component
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        }
    });
    return null;
}

const TransportSection = ({ checkInDate, hotelDestination, onTransportChange }) => {
    const [enabled, setEnabled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [pickupDate, setPickupDate] = useState(checkInDate || '');
    const [pickupTime, setPickupTime] = useState('10:00');
    const [vehicleType, setVehicleType] = useState('sedan');
    const [passengerCount, setPassengerCount] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [estimate, setEstimate] = useState(null);
    const [locating, setLocating] = useState(false);
    const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Sri Lanka center
    const [mapZoom, setMapZoom] = useState(8);
    const mapRef = useRef(null);

    // Hotel destination coords (approximate for Sri Lankan cities)
    const destCoords = { lat: 6.9271, lng: 79.8612 }; // Default Colombo

    useEffect(() => {
        if (checkInDate) setPickupDate(checkInDate);
    }, [checkInDate]);

    // Auto-estimate when coords or vehicle changes
    useEffect(() => {
        if (enabled && pickupCoords) {
            fetchEstimate();
        }
    }, [pickupCoords, vehicleType, enabled]);

    const fetchEstimate = async () => {
        if (!pickupCoords) return;
        try {
            const res = await estimateTransportCost({
                pickupCoords,
                dropoffCoords: destCoords,
                vehicleType
            });
            setEstimate(res.data);
            onTransportChange({
                enabled: true,
                pickupDate,
                pickupTime,
                pickupAddress,
                pickupCoords,
                dropoffAddress: hotelDestination || 'Hotel',
                dropoffCoords: destCoords,
                vehicleType,
                passengerCount,
                specialRequests,
                estimatedDistance: res.data.estimatedDistance,
                estimatedCost: res.data.estimatedCost
            });
        } catch (err) {
            console.error('Estimate failed:', err);
        }
    };

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState);
        setExpanded(newState);
        if (!newState) {
            setEstimate(null);
            onTransportChange({ enabled: false, estimatedCost: 0 });
        }
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPickupCoords(coords);
                setMapCenter([coords.lat, coords.lng]);
                setMapZoom(14);
                // Reverse geocode using Nominatim (free)
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
                    const data = await res.json();
                    setPickupAddress(data.display_name || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                } catch {
                    setPickupAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                }
                setLocating(false);
            },
            (err) => {
                alert('Unable to get your location. Please select on the map.');
                setLocating(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleMapClick = async (latlng) => {
        const coords = { lat: latlng.lat, lng: latlng.lng };
        setPickupCoords(coords);
        // Reverse geocode
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
            const data = await res.json();
            setPickupAddress(data.display_name || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        } catch {
            setPickupAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        }
    };

    const handleFieldChange = () => {
        if (enabled && pickupCoords) {
            onTransportChange({
                enabled: true,
                pickupDate,
                pickupTime,
                pickupAddress,
                pickupCoords,
                dropoffAddress: hotelDestination || 'Hotel',
                dropoffCoords: destCoords,
                vehicleType,
                passengerCount,
                specialRequests,
                estimatedDistance: estimate?.estimatedDistance || 0,
                estimatedCost: estimate?.estimatedCost || 0
            });
        }
    };

    useEffect(() => { handleFieldChange(); }, [pickupDate, pickupTime, passengerCount, specialRequests, pickupAddress]);

    return (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden transition-all duration-300" style={{ borderColor: enabled ? '#0071C2' : undefined, borderStyle: enabled ? 'solid' : 'dashed' }}>
            {/* Toggle Header */}
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full flex items-center justify-between p-5 transition-all duration-300 ${enabled ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all ${enabled ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                        <Car size={22} />
                    </div>
                    <div className="text-left">
                        <h3 className={`font-bold text-base ${enabled ? 'text-blue-900' : 'text-gray-700'}`}>
                            🚗 Need transport to the hotel?
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Add a comfortable ride from your location to {hotelDestination || 'the hotel'}</p>
                    </div>
                </div>
                <div className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${enabled ? 'translate-x-7' : ''}`} />
                </div>
            </button>

            {/* Expanded Content */}
            {enabled && (
                <div className="p-6 space-y-6 bg-white">
                    {/* Date & Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"><Calendar size={14} /> Pickup Date</label>
                            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50" />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"><Clock size={14} /> Pickup Time</label>
                            <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50" />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"><Users size={14} /> Passengers</label>
                            <input type="number" min="1" max="8" value={passengerCount} onChange={(e) => setPassengerCount(parseInt(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50" />
                        </div>
                    </div>

                    {/* Location Picker */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"><MapPin size={14} /> Pickup Location</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                                placeholder="Enter your pickup address or use the map..."
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50"
                            />
                            <button
                                type="button"
                                onClick={handleLocateMe}
                                disabled={locating}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-60 whitespace-nowrap"
                            >
                                {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                                {locating ? 'Locating...' : 'Use My Location'}
                            </button>
                        </div>
                        
                        {/* Map */}
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner" style={{ height: '220px' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                ref={mapRef}
                                style={{ height: '100%', width: '100%' }}
                                key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapClickHandler onMapClick={handleMapClick} />
                                {pickupCoords && (
                                    <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon} />
                                )}
                            </MapContainer>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">Click on the map to set your pickup point, or use "Use My Location"</p>
                    </div>

                    {/* Drop-off (auto-filled) */}
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-1">
                            <MapPin size={14} /> Drop-off Location (Auto-filled)
                        </div>
                        <p className="text-green-700 text-sm">{hotelDestination || 'Hotel destination'}</p>
                    </div>

                    {/* Vehicle Selection */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">Choose Your Vehicle</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {vehicles.map((v) => {
                                const Icon = v.icon;
                                const selected = vehicleType === v.type;
                                return (
                                    <button
                                        type="button"
                                        key={v.type}
                                        onClick={() => setVehicleType(v.type)}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${selected ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                                    >
                                        {selected && <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center text-white mb-2 shadow-sm`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="font-bold text-sm text-gray-800">{v.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Up to {v.passengers} guests</div>
                                        <div className="text-xs font-semibold text-blue-600 mt-1.5">Rs. {v.rate}/km</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Special Requests <span className="font-normal text-gray-400">(optional)</span></label>
                        <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="e.g. Child seat needed, extra luggage space..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50 h-20 resize-none"
                        />
                    </div>

                    {/* Cost Estimate */}
                    {estimate && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-blue-100">Estimated Distance</span>
                                <span className="font-bold text-lg">{estimate.estimatedDistance} km</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-blue-100">Base Fare</span>
                                <span>Rs. {estimate.baseFare}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-blue-100">Rate ({estimate.vehicleType})</span>
                                <span>Rs. {estimate.perKmRate}/km</span>
                            </div>
                            <div className="border-t border-blue-400 pt-3 mt-3 flex items-center justify-between">
                                <span className="font-bold text-lg">Transport Cost</span>
                                <span className="font-extrabold text-2xl">Rs. {estimate.estimatedCost.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                    
                    {!pickupCoords && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm flex items-center gap-2">
                            <MapPin size={16} /> Please set your pickup location on the map or use "Use My Location" to get a cost estimate
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TransportSection;
