import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Truck, Crown, Users, Clock, Calendar, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

/* ───────── Global Color System ───────── */
const C = {
    // Semantic Tokens
    primary: '#0F2D52', action: '#1D6FE8', accent: '#F59E0B', 
    success: '#16A34A', alert: '#C0392B', bg: '#F4F6F9', 
    card: '#FFFFFF', text: '#1A1A2E',
    
    // Legacy mapping to prevent breakages
    900: '#0F2D52', 800: '#0F2D52', 700: '#0F2D52', 600: '#1D6FE8',
    500: '#1D6FE8', 400: '#1D6FE8', 300: '#60A5FA', 200: '#BFDBFE',
    100: '#DBEAFE', 50: '#F0F9FF',
};

const SedanIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>;
const SUVIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19 6H5c-1.66 0-3 1.34-3 3v8h2v2c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-2h10v2c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-2h2V9c0-1.66-1.34-3-3-3zM7 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11V8h14v3H5z"/></svg>;
const VanIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M21 9h-4.5V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v10h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-2-3zm-15 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm9 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-4V9h2.5l1.5 2H18z"/></svg>;
const LuxuryIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20 9L18 6l-3-2H9L6 6 4 9v7c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-1h6v1c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2V9zm-13 4c-.83 0-1.5-.67-1.5-1.5S6.17 10 7 10s1.5.67 1.5 1.5S7.83 13 7 13zm10 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>;

const vehicles = [
    { type: 'sedan', label: 'Sedan', icon: SedanIcon, desc: 'Comfortable sedan for 1-3 passengers', rate: 35, base: 500, passengers: 3, color: `from-blue-500 to-blue-700` },
    { type: 'suv', label: 'SUV', icon: SUVIcon, desc: 'Spacious SUV for up to 5 passengers', rate: 50, base: 800, passengers: 5, color: 'from-emerald-500 to-emerald-700' },
    { type: 'van', label: 'Van', icon: VanIcon, desc: 'Mini van for groups up to 8', rate: 65, base: 1000, passengers: 8, color: 'from-amber-500 to-amber-700' },
    { type: 'luxury', label: 'Luxury', icon: LuxuryIcon, desc: 'Premium luxury vehicle', rate: 100, base: 2000, passengers: 3, color: 'from-purple-500 to-purple-700' },
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

const TransportSection = ({ checkInDate, hotelDestination, onTransportChange, guestCount, submitAttempted }) => {
    const [enabled, setEnabled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [pickupDate, setPickupDate] = useState(checkInDate ? new Date(checkInDate) : new Date());
    const [pickupTime, setPickupTime] = useState('10:00');
    const [vehicleType, setVehicleType] = useState('sedan');
    const [passengerCount, setPassengerCount] = useState(guestCount || 1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [estimate, setEstimate] = useState(null);
    const [locating, setLocating] = useState(false);
    const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]);
    const [mapZoom, setMapZoom] = useState(13);
    const mapRef = useRef(null);

    // Hotel destination coords (approximate for Sri Lankan cities)
    const destCoords = { lat: 6.9271, lng: 79.8612 };

    useEffect(() => {
        if (checkInDate) setPickupDate(new Date(checkInDate));
    }, [checkInDate]);

    // Autofill passengers when guestCount changes
    useEffect(() => {
        if (guestCount && guestCount > 0) {
            setPassengerCount(guestCount);
        }
    }, [guestCount]);

    // Auto-estimate when coords or vehicle changes
    useEffect(() => {
        if (enabled && pickupCoords) {
            fetchEstimate();
        }
    }, [pickupCoords, vehicleType, enabled]);

    // Format date for API
    const formatDateForApi = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

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
                pickupDate: formatDateForApi(pickupDate),
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
                pickupDate: formatDateForApi(pickupDate),
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
        <div className="rounded-2xl border-2 overflow-hidden transition-all duration-300" style={{ borderColor: enabled ? C[500] : '#e5e7eb', borderStyle: enabled ? 'solid' : 'dashed' }}>
            {/* Toggle Header */}
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full flex items-center justify-between p-5 transition-all duration-300 ${enabled ? '' : 'bg-gray-50 hover:bg-gray-100'}`}
                style={enabled ? { background: `linear-gradient(135deg, ${C[50]}44, ${C[100]}33)` } : {}}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all"
                        style={enabled
                            ? { background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, color: 'white' }
                            : { background: 'white', color: '#9ca3af', border: '1px solid #e5e7eb' }
                        }
                    >
                        <Car size={22} />
                    </div>
                    <div className="text-left">
                        <h3 className={`font-bold text-base`} style={enabled ? { color: C[900] } : { color: '#374151' }}>
                            Need transport to the hotel?
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Add a comfortable ride from your location to {hotelDestination || 'the hotel'}</p>
                    </div>
                </div>
                <div
                    className="w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1"
                    style={{ background: enabled ? C[600] : '#d1d5db' }}
                >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${enabled ? 'translate-x-7' : ''}`} />
                </div>
            </button>

            {/* Expanded Content */}
            {enabled && (
                <div className="p-6 space-y-6 bg-white">
                    {/* Date & Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Interactive Date Picker */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"><Calendar size={14} /> Pickup Date</label>
                            <style>{`
                                .transport-datepicker-wrapper .react-datepicker-wrapper { width: 100%; }
                                .transport-datepicker-wrapper .react-datepicker__input-container input {
                                    width: 100%;
                                    padding: 0.75rem 1rem;
                                    border: 1px solid #e5e7eb;
                                    border-radius: 0.75rem;
                                    font-size: 0.875rem;
                                    background: #f9fafb;
                                    outline: none;
                                    transition: all 0.2s;
                                    cursor: pointer;
                                }
                                .transport-datepicker-wrapper .react-datepicker__input-container input:focus {
                                    border-color: ${C[500]};
                                    box-shadow: 0 0 0 2px ${C[500]}33;
                                }
                                .transport-datepicker-wrapper .react-datepicker {
                                    font-family: inherit;
                                    border: 1px solid #e5e7eb;
                                    border-radius: 1rem;
                                    box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                                    overflow: hidden;
                                }
                                .transport-datepicker-wrapper .react-datepicker__header {
                                    background: ${C[700]};
                                    border-bottom: none;
                                    padding-top: 12px;
                                    border-radius: 0;
                                }
                                .transport-datepicker-wrapper .react-datepicker__current-month {
                                    color: white;
                                    font-weight: 700;
                                    font-size: 0.95rem;
                                    margin-bottom: 6px;
                                }
                                .transport-datepicker-wrapper .react-datepicker__day-name {
                                    color: ${C[100]};
                                    font-weight: 600;
                                    font-size: 0.75rem;
                                }
                                .transport-datepicker-wrapper .react-datepicker__day {
                                    border-radius: 0.5rem;
                                    font-weight: 500;
                                    transition: all 0.15s;
                                    font-size: 0.85rem;
                                }
                                .transport-datepicker-wrapper .react-datepicker__day:hover {
                                    background: ${C[50]};
                                    color: ${C[700]};
                                }
                                .transport-datepicker-wrapper .react-datepicker__day--selected {
                                    background: ${C[700]} !important;
                                    color: white !important;
                                    font-weight: 700;
                                }
                                .transport-datepicker-wrapper .react-datepicker__day--keyboard-selected {
                                    background: ${C[100]};
                                    color: ${C[800]};
                                }
                                .transport-datepicker-wrapper .react-datepicker__day--disabled {
                                    color: #d1d5db !important;
                                    cursor: not-allowed;
                                }
                                .transport-datepicker-wrapper .react-datepicker__day--today {
                                    font-weight: 800;
                                    color: ${C[700]};
                                }
                                .transport-datepicker-wrapper .react-datepicker__navigation-icon::before {
                                    border-color: white;
                                }
                                .transport-datepicker-wrapper .react-datepicker__navigation:hover *::before {
                                    border-color: ${C[100]};
                                }
                                .transport-datepicker-wrapper .react-datepicker__triangle {
                                    display: none;
                                }
                            `}</style>
                            <div className="transport-datepicker-wrapper">
                                <DatePicker
                                    selected={pickupDate}
                                    onChange={(date) => setPickupDate(date)}
                                    minDate={new Date()}
                                    dateFormat="MMMM d, yyyy"
                                    placeholderText="Select pickup date"
                                    showPopperArrow={false}
                                    popperPlacement="bottom-start"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"><Clock size={14} /> Pickup Time</label>
                            <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm bg-gray-50" style={{ '--tw-ring-color': C[500] }} />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"><Users size={14} /> Passengers</label>
                            <input type="number" min="1" max="8" value={passengerCount} onChange={(e) => setPassengerCount(parseInt(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm bg-gray-50" style={{ '--tw-ring-color': C[500] }} />
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
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm bg-gray-50"
                                style={{ '--tw-ring-color': C[500] }}
                            />
                            <button
                                type="button"
                                onClick={handleLocateMe}
                                disabled={locating}
                                className="flex items-center gap-2 px-5 py-3 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all shadow-sm disabled:opacity-60 whitespace-nowrap"
                                style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}
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
                    <div className="p-4 rounded-xl border" style={{ background: `${C[50]}33`, borderColor: `${C[200]}44` }}>
                        <div className="flex items-center gap-2 font-semibold text-sm mb-1" style={{ color: C[800] }}>
                            <MapPin size={14} /> Drop-off Location (Auto-filled)
                        </div>
                        <p className="text-sm" style={{ color: C[600] }}>{hotelDestination || 'Hotel destination'}</p>
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
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${selected ? 'shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                                        style={selected ? { borderColor: C[500], background: `${C[50]}44`, boxShadow: `0 4px 14px ${C[500]}22` } : {}}
                                    >
                                        {selected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C[600] }}><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center text-white mb-2 shadow-sm`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="font-bold text-sm text-gray-800">{v.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Up to {v.passengers} guests</div>
                                        <div className="text-xs font-semibold mt-1.5" style={{ color: C[600] }}>Rs. {v.rate}/km</div>
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm bg-gray-50 h-20 resize-none"
                            style={{ '--tw-ring-color': C[500] }}
                        />
                    </div>

                    {/* Cost Estimate */}
                    {estimate && (
                        <div className="rounded-xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium" style={{ color: C[100] }}>Estimated Distance</span>
                                <span className="font-bold text-lg">{estimate.estimatedDistance} km</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium" style={{ color: C[100] }}>Base Fare</span>
                                <span>Rs. {estimate.baseFare}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium" style={{ color: C[100] }}>Rate ({estimate.vehicleType})</span>
                                <span>Rs. {estimate.perKmRate}/km</span>
                            </div>
                            <div className="pt-3 mt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${C[400]}` }}>
                                <span className="font-bold text-lg">Transport Cost</span>
                                <span className="font-extrabold text-2xl">Rs. {estimate.estimatedCost.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                    
                    {!pickupCoords && submitAttempted && (
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
