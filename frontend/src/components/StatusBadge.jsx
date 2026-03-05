import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, CheckCircle, Clock, Undo } from 'lucide-react';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const StatusBadge = ({ status, className = '' }) => {
    const statusConfig = {
        SUCCESS: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle, label: 'PAID' },
        PAID: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle, label: 'PAID' },
        FAILED: { color: 'bg-danger/10 text-danger border-danger/20', icon: AlertCircle, label: 'FAILED' },
        PENDING: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock, label: 'PENDING' },
        UNPAID: { color: 'bg-muted/10 text-muted border-muted/20', icon: Clock, label: 'UNPAID' },
        REFUNDED: { color: 'bg-refunded/10 text-refunded border-refunded/20', icon: Undo, label: 'REFUNDED' },
        PARTIALLY_REFUNDED: { color: 'bg-refunded/10 text-refunded border-refunded/20', icon: Undo, label: 'PARTIALLY REFUNDED' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
            config.color,
            className
        )}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
};
