import React from 'react';
import { Wifi, Car, Monitor, Mic, Snowflake, Sun, Music, Coffee, Flame, Eye, Armchair } from 'lucide-react';

const iconMap = {
    'WiFi': Wifi, 'Parking': Car, 'Projector': Monitor, 'Sound System': Mic,
    'AC': Snowflake, 'Stage': Sun, 'Dance Floor': Music, 'Coffee Machine': Coffee,
    'Fireplace': Flame, 'River View': Eye, 'Bar Counter': Armchair,
};

export default function FacilityBadge({ name }) {
    const Icon = iconMap[name];
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-secondary px-2 py-1 rounded-full">
            {Icon && <Icon size={12} />}
            {name}
        </span>
    );
}
