import React from 'react';
import { MapPin, Users, DollarSign, Wifi, Car, Monitor, Mic, Snowflake, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import FacilityBadge from './FacilityBadge';

export default function HallCard({ hall }) {
    const price = hall.priceModel === 'PER_HOUR'
        ? `LKR ${hall.pricePerHour?.toLocaleString()}/hr`
        : `LKR ${hall.fixedPrice?.toLocaleString()} fixed`;

    return (
        <Link to={`/halls/${hall._id}`} className="block group">
            <div className="bg-card rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
                style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={hall.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'}
                        alt={hall.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {!hall.isActive && (
                        <div className="absolute top-3 right-3 bg-danger text-white text-xs font-semibold px-2 py-1 rounded-full">Inactive</div>
                    )}
                </div>
                <div className="p-5">
                    <h3 className="text-lg font-bold text-text mb-1">{hall.name}</h3>
                    <p className="text-muted text-sm mb-3 line-clamp-2">{hall.description}</p>
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted">
                        <span className="flex items-center gap-1"><Users size={15} /> {hall.capacity}</span>
                        <span className="flex items-center gap-1 text-accent font-semibold"><DollarSign size={15} /> {price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {hall.facilities?.slice(0, 4).map((f) => (
                            <FacilityBadge key={f} name={f} />
                        ))}
                        {hall.facilities?.length > 4 && (
                            <span className="text-xs text-muted bg-bg px-2 py-1 rounded-full">+{hall.facilities.length - 4}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
