import React from 'react';

const dk = { card: '#1a1d27', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

const StatsCard = ({ title, value, icon: Icon, accentColor = '#6366f1', colorClass }) => {
    // Support both new accentColor and legacy colorClass props
    const color = accentColor;

    return (
        <div className="rounded-xl p-6 hover:scale-[1.02] transform transition-all duration-300 border"
            style={{ background: dk.card, borderColor: dk.border }}>
            <div className="flex items-center">
                <div className="p-3 rounded-xl mr-4" style={{ background: `${color}15` }}>
                    <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: dk.textSec }}>{title}</p>
                    <p className="text-2xl font-bold font-sans mt-1" style={{ color: dk.text }}>{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
