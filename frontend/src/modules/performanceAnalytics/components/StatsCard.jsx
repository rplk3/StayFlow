import React from 'react';

const StatsCard = ({ title, value, icon: Icon, colorClass }) => {
    return (
        <div className="bg-card rounded-xl p-6 shadow-soft hover:scale-[1.02] transform transition-transform duration-300">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 mr-4`}>
                    <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-textSecondary uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold font-sans text-textPrimary mt-1 dashboard-number">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
