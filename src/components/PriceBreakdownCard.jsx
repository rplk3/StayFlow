import React from 'react';

export default function PriceBreakdownCard({ pricing, services, guestsCount, hallSnapshot }) {
    return (
        <div className="bg-card rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3 className="font-bold text-text mb-4 text-lg">Price Breakdown</h3>
            <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted">
                        Hall ({hallSnapshot?.priceModel === 'PER_HOUR' ? 'per hour' : 'fixed'})
                    </span>
                    <span className="font-medium">LKR {pricing?.hallCost?.toLocaleString()}</span>
                </div>
                {services?.catering?.selected && (
                    <div className="flex justify-between">
                        <span className="text-muted">Catering ({guestsCount} × LKR {services.catering.pricePerPerson?.toLocaleString()})</span>
                        <span className="font-medium">LKR {(guestsCount * (services.catering.pricePerPerson || 0)).toLocaleString()}</span>
                    </div>
                )}
                {services?.decoration?.selected && (
                    <div className="flex justify-between">
                        <span className="text-muted">Decoration</span>
                        <span className="font-medium">LKR {services.decoration.price?.toLocaleString()}</span>
                    </div>
                )}
                {services?.audioVisual?.selected && (
                    <div className="flex justify-between">
                        <span className="text-muted">Audio/Visual</span>
                        <span className="font-medium">LKR {services.audioVisual.price?.toLocaleString()}</span>
                    </div>
                )}
                {services?.extraItems?.map((item, i) => (
                    <div key={i} className="flex justify-between">
                        <span className="text-muted">{item.name} ({item.qty}×)</span>
                        <span className="font-medium">LKR {(item.unitPrice * item.qty).toLocaleString()}</span>
                    </div>
                ))}
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-medium">LKR {pricing?.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted">Tax (10%)</span>
                    <span className="font-medium">LKR {pricing?.tax?.toLocaleString()}</span>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">LKR {pricing?.total?.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
