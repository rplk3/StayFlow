import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, DollarSign, ArrowLeft, CalendarPlus, MapPin, ScrollText } from 'lucide-react';
import { getHallById } from '../../services/api';
import FacilityBadge from '../../components/FacilityBadge';
import AvailabilityChecker from '../../components/AvailabilityChecker';

export default function HallDetails() {
    const { id } = useParams();
    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(0);
    const [availSlot, setAvailSlot] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getHallById(id);
                setHall(res.data.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        })();
    }, [id]);

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!hall) return <div className="text-center py-20"><p className="text-muted text-lg">Hall not found</p></div>;

    const price = hall.priceModel === 'PER_HOUR' ? `LKR ${hall.pricePerHour?.toLocaleString()}/hr` : `LKR ${hall.fixedPrice?.toLocaleString()} fixed`;

    return (
        <div>
            <Link to="/halls" className="inline-flex items-center gap-1.5 text-muted hover:text-secondary transition-colors mb-6 text-sm">
                <ArrowLeft size={16} /> Back to Halls
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Gallery */}
                    <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <img src={hall.images?.[selectedImg] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'} alt={hall.name}
                            className="w-full h-72 md:h-96 object-cover" />
                        {hall.images?.length > 1 && (
                            <div className="flex gap-2 p-3 overflow-x-auto">
                                {hall.images.map((img, i) => (
                                    <img key={i} src={img} alt="" onClick={() => setSelectedImg(i)}
                                        className={`w-20 h-14 object-cover rounded-lg cursor-pointer transition-all ${i === selectedImg ? 'ring-2 ring-secondary' : 'opacity-60 hover:opacity-100'}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="bg-card rounded-xl p-6" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h1 className="text-2xl font-bold text-text mb-2">{hall.name}</h1>
                        <p className="text-muted mb-4">{hall.description}</p>
                        <div className="flex flex-wrap gap-4 mb-5 text-sm">
                            <span className="flex items-center gap-1.5 text-muted"><Users size={16} className="text-secondary" /> Capacity: <strong>{hall.capacity}</strong></span>
                            <span className="flex items-center gap-1.5 text-accent font-semibold"><DollarSign size={16} /> {price}</span>
                        </div>
                        <h3 className="font-semibold text-text mb-2">Facilities</h3>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {hall.facilities?.map(f => <FacilityBadge key={f} name={f} />)}
                        </div>
                        {hall.rules && (
                            <>
                                <h3 className="font-semibold text-text mb-2 flex items-center gap-1.5"><ScrollText size={16} className="text-warning" /> Rules</h3>
                                <p className="text-muted text-sm bg-amber-50 p-3 rounded-lg">{hall.rules}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-white">
                        <h2 className="text-xl font-bold mb-1">{price}</h2>
                        <p className="text-blue-100 text-sm mb-4">{hall.priceModel === 'PER_HOUR' ? 'Per Hour Rate' : 'Fixed Price'}</p>
                        <Link
                            to={`/event-bookings/new?hallId=${hall._id}${availSlot ? `&date=${availSlot.eventDate}&start=${availSlot.startTime}&end=${availSlot.endTime}` : ''}`}
                            className="block w-full text-center bg-white text-primary font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors">
                            <CalendarPlus size={16} className="inline mr-1.5" /> Book This Hall
                        </Link>
                    </div>
                    <AvailabilityChecker hallId={id} onAvailable={setAvailSlot} />
                </div>
            </div>
        </div>
    );
}
