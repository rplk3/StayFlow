import React from 'react';

const colors = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function StatusBadge({ status }) {
    const c = colors[status] || colors.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
            {status}
        </span>
    );
}
