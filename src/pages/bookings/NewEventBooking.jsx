import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Users, Utensils, FileCheck, CheckCircle, Loader2 } from 'lucide-react';
import { getHallById, checkAvailability, createBooking } from '../../services/api';
import PriceBreakdownCard from '../../components/PriceBreakdownCard';

const STEPS = ['Date & Time', 'Guest Info', 'Services', 'Review & Submit'];
const EVENT_TYPES = ['WEDDING', 'MEETING', 'CONFERENCE', 'PARTY', 'OTHER'];

function calcDuration(start, end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

function calcPricing(hall, form) {
    const dur = calcDuration(form.startTime, form.endTime);
    const hallCost = hall.priceModel === 'PER_HOUR' ? dur * (hall.pricePerHour || 0) : (hall.fixedPrice || 0);
    let svcCost = 0;
    if (form.catering) svcCost += form.guestsCount * (form.cateringPrice || 0);
    if (form.decoration) svcCost += form.decorationPrice || 0;
    if (form.audioVisual) svcCost += form.avPrice || 0;
    form.extraItems.forEach(i => { svcCost += (i.unitPrice || 0) * (i.qty || 0); });
    const sub = hallCost + svcCost;
    const tax = Math.round(sub * 0.1 * 100) / 100;
    return { hallCost: Math.round(hallCost * 100) / 100, servicesCost: Math.round(svcCost * 100) / 100, subtotal: Math.round(sub * 100) / 100, tax, total: Math.round((sub + tax) * 100) / 100, durationHours: dur };
}

export default function NewEventBooking() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const hallId = params.get('hallId');
    const [hall, setHall] = useState(null);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [availChecked, setAvailChecked] = useState(false);
    const [availResult, setAvailResult] = useState(null);

    const [form, setForm] = useState({
        eventDate: params.get('date') || '', startTime: params.get('start') || '', endTime: params.get('end') || '',
        eventType: 'WEDDING', customerName: '', customerEmail: '', customerPhone: '', guestsCount: 1,
        catering: false, cateringPrice: 1500, cateringMenu: '',
        decoration: false, decorationPrice: 25000, decorationNotes: '',
        audioVisual: false, avPrice: 15000,
        extraItems: [],
        specialRequests: ''
    });

    useEffect(() => {
        if (!hallId) return;
        (async () => {
            try { const r = await getHallById(hallId); setHall(r.data.data); } catch (e) { console.error(e); }
        })();
    }, [hallId]);

    const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const pricing = hall ? calcPricing(hall, form) : null;

    const handleCheckAvail = async () => {
        if (!form.eventDate || !form.startTime || !form.endTime) return;
        try {
            const r = await checkAvailability(hallId, { eventDate: form.eventDate, startTime: form.startTime, endTime: form.endTime });
            setAvailResult(r.data);
            setAvailChecked(true);
        } catch (e) { setAvailResult({ available: false, error: e.response?.data?.message }); setAvailChecked(true); }
    };

    const handleSubmit = async () => {
        setSubmitting(true); setError('');
        try {
            const res = await createBooking({
                hallId, eventDate: form.eventDate, startTime: form.startTime, endTime: form.endTime,
                eventType: form.eventType, customerName: form.customerName, customerEmail: form.customerEmail,
                customerPhone: form.customerPhone, guestsCount: Number(form.guestsCount),
                userId: 'customer-' + Date.now(),
                services: {
                    catering: { selected: form.catering, pricePerPerson: form.cateringPrice, menu: form.cateringMenu },
                    decoration: { selected: form.decoration, price: form.decorationPrice, notes: form.decorationNotes },
                    audioVisual: { selected: form.audioVisual, price: form.avPrice },
                    extraItems: form.extraItems.filter(i => i.name && i.qty > 0)
                },
                specialRequests: form.specialRequests
            });
            setSuccess(res.data.data);
        } catch (e) { setError(e.response?.data?.message || 'Booking failed'); }
        setSubmitting(false);
    };

    if (!hallId) return <div className="text-center py-20"><p className="text-muted">No hall selected. <Link to="/halls" className="text-secondary underline">Browse halls</Link></p></div>;
    if (!hall) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;

    if (success) return (
        <div className="max-w-lg mx-auto text-center py-12">
            <div className="bg-card rounded-xl p-8" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <CheckCircle size={56} className="text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text mb-2">Booking Submitted!</h2>
                <p className="text-muted mb-4">Your booking reference is:</p>
                <p className="text-3xl font-bold text-primary mb-4">{success.bookingRef}</p>
                <p className="text-muted text-sm mb-6">Status: <span className="text-amber-600 font-semibold">PENDING</span> — awaiting admin approval</p>
                <div className="flex gap-3 justify-center">
                    <Link to="/my-event-bookings" className="bg-secondary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary transition-colors">My Bookings</Link>
                    <Link to="/halls" className="border border-gray-200 px-6 py-2.5 rounded-lg font-semibold text-muted hover:border-secondary hover:text-secondary transition-colors">Browse Halls</Link>
                </div>
            </div>
        </div>
    );

    const services = {
        catering: { selected: form.catering, pricePerPerson: form.cateringPrice, menu: form.cateringMenu },
        decoration: { selected: form.decoration, price: form.decorationPrice, notes: form.decorationNotes },
        audioVisual: { selected: form.audioVisual, price: form.avPrice },
        extraItems: form.extraItems
    };

    return (
        <div>
            <Link to={`/halls/${hallId}`} className="inline-flex items-center gap-1.5 text-muted hover:text-secondary transition-colors mb-6 text-sm"><ArrowLeft size={16} /> Back to {hall.name}</Link>
            <h1 className="text-2xl font-bold text-text mb-6">Book {hall.name}</h1>

            {/* Stepper */}
            <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
                {STEPS.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${i === step ? 'bg-secondary text-white' : i < step ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-muted'}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? 'bg-white text-secondary' : i < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>{i < step ? '✓' : i + 1}</span>
                            <span className="hidden md:inline">{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 min-w-4 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-xl p-6" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        {/* Step 0: Date & Time */}
                        {step === 0 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2"><CalendarDays size={20} className="text-secondary" /> Date & Time</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Event Type</label>
                                        <select value={form.eventType} onChange={e => upd('eventType', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary">
                                            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Event Date</label>
                                        <input type="date" value={form.eventDate} onChange={e => { upd('eventDate', e.target.value); setAvailChecked(false); }}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Start Time</label>
                                        <input type="time" value={form.startTime} onChange={e => { upd('startTime', e.target.value); setAvailChecked(false); }}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">End Time</label>
                                        <input type="time" value={form.endTime} onChange={e => { upd('endTime', e.target.value); setAvailChecked(false); }}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                                    </div>
                                </div>
                                {form.startTime && form.endTime && calcDuration(form.startTime, form.endTime) > 0 && (
                                    <p className="text-sm text-muted">Duration: <strong>{calcDuration(form.startTime, form.endTime)} hours</strong></p>
                                )}
                                <button onClick={handleCheckAvail} disabled={!form.eventDate || !form.startTime || !form.endTime}
                                    className="bg-accent text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm">Check Availability</button>
                                {availChecked && availResult && (
                                    <div className={`p-3 rounded-lg text-sm ${availResult.available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                        {availResult.available ? '✅ Slot is available!' : `❌ Not available: ${availResult.error || 'Time conflicts'}`}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 1: Guest Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Users size={20} className="text-secondary" /> Guest Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Full Name *</label>
                                        <input type="text" value={form.customerName} onChange={e => upd('customerName', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Email *</label>
                                        <input type="email" value={form.customerEmail} onChange={e => upd('customerEmail', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" placeholder="john@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Phone *</label>
                                        <input type="tel" value={form.customerPhone} onChange={e => upd('customerPhone', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" placeholder="+94-77-1234567" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Number of Guests * <span className="text-muted font-normal">(max {hall.capacity})</span></label>
                                        <input type="number" min={1} max={hall.capacity} value={form.guestsCount} onChange={e => upd('guestsCount', Math.min(Number(e.target.value), hall.capacity))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Services */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Utensils size={20} className="text-secondary" /> Additional Services</h2>
                                {/* Catering */}
                                <div className={`p-4 rounded-xl border-2 transition-colors ${form.catering ? 'border-secondary bg-blue-50/30' : 'border-gray-100'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.catering} onChange={e => upd('catering', e.target.checked)} className="w-4 h-4 accent-secondary" />
                                        <span className="font-semibold">Catering Service</span>
                                    </label>
                                    {form.catering && (
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-muted mb-1">Price per Person (LKR)</label>
                                                <input type="number" value={form.cateringPrice} onChange={e => upd('cateringPrice', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" /></div>
                                            <div><label className="block text-xs text-muted mb-1">Menu Selection</label>
                                                <input type="text" value={form.cateringMenu} onChange={e => upd('cateringMenu', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder="e.g. Premium buffet" /></div>
                                        </div>
                                    )}
                                </div>
                                {/* Decoration */}
                                <div className={`p-4 rounded-xl border-2 transition-colors ${form.decoration ? 'border-secondary bg-blue-50/30' : 'border-gray-100'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.decoration} onChange={e => upd('decoration', e.target.checked)} className="w-4 h-4 accent-secondary" />
                                        <span className="font-semibold">Decoration</span>
                                    </label>
                                    {form.decoration && (
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div><label className="block text-xs text-muted mb-1">Price (LKR)</label>
                                                <input type="number" value={form.decorationPrice} onChange={e => upd('decorationPrice', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" /></div>
                                            <div><label className="block text-xs text-muted mb-1">Notes</label>
                                                <input type="text" value={form.decorationNotes} onChange={e => upd('decorationNotes', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder="Theme, flowers..." /></div>
                                        </div>
                                    )}
                                </div>
                                {/* Audio Visual */}
                                <div className={`p-4 rounded-xl border-2 transition-colors ${form.audioVisual ? 'border-secondary bg-blue-50/30' : 'border-gray-100'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.audioVisual} onChange={e => upd('audioVisual', e.target.checked)} className="w-4 h-4 accent-secondary" />
                                        <span className="font-semibold">Audio/Visual Equipment</span>
                                    </label>
                                    {form.audioVisual && (
                                        <div className="mt-3 w-full md:w-1/2">
                                            <label className="block text-xs text-muted mb-1">Price (LKR)</label>
                                            <input type="number" value={form.avPrice} onChange={e => upd('avPrice', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                                        </div>
                                    )}
                                </div>
                                {/* Extra Items */}
                                <div className="p-4 rounded-xl border-2 border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold">Extra Items</span>
                                        <button type="button" onClick={() => upd('extraItems', [...form.extraItems, { name: '', unitPrice: 0, qty: 1 }])}
                                            className="text-xs text-secondary hover:underline">+ Add Item</button>
                                    </div>
                                    {form.extraItems.map((item, i) => (
                                        <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                                            <input type="text" value={item.name} placeholder="Item name"
                                                onChange={e => { const n = [...form.extraItems]; n[i].name = e.target.value; upd('extraItems', n); }}
                                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                                            <input type="number" value={item.unitPrice} placeholder="Price"
                                                onChange={e => { const n = [...form.extraItems]; n[i].unitPrice = Number(e.target.value); upd('extraItems', n); }}
                                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                                            <div className="flex gap-1">
                                                <input type="number" min={1} value={item.qty} placeholder="Qty"
                                                    onChange={e => { const n = [...form.extraItems]; n[i].qty = Number(e.target.value); upd('extraItems', n); }}
                                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                                                <button onClick={() => { const n = form.extraItems.filter((_, j) => j !== i); upd('extraItems', n); }}
                                                    className="text-danger hover:bg-red-50 rounded-lg px-2">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Special Requests */}
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Special Requests</label>
                                    <textarea value={form.specialRequests} onChange={e => upd('specialRequests', e.target.value)} rows={3}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none" placeholder="Any special requirements..." />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold flex items-center gap-2"><FileCheck size={20} className="text-secondary" /> Review Your Booking</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-muted">Hall:</span> <strong>{hall.name}</strong></div>
                                    <div><span className="text-muted">Event Type:</span> <strong>{form.eventType}</strong></div>
                                    <div><span className="text-muted">Date:</span> <strong>{form.eventDate}</strong></div>
                                    <div><span className="text-muted">Time:</span> <strong>{form.startTime} – {form.endTime}</strong></div>
                                    <div><span className="text-muted">Duration:</span> <strong>{pricing?.durationHours}h</strong></div>
                                    <div><span className="text-muted">Guests:</span> <strong>{form.guestsCount}</strong></div>
                                    <div><span className="text-muted">Name:</span> <strong>{form.customerName}</strong></div>
                                    <div><span className="text-muted">Email:</span> <strong>{form.customerEmail}</strong></div>
                                    <div><span className="text-muted">Phone:</span> <strong>{form.customerPhone}</strong></div>
                                </div>
                                {form.specialRequests && <div className="text-sm"><span className="text-muted">Special Requests:</span> <p className="mt-1 bg-gray-50 p-3 rounded-lg">{form.specialRequests}</p></div>}
                                {error && <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">{error}</div>}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
                            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                                className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-muted hover:border-secondary hover:text-secondary transition-colors disabled:opacity-30">
                                <ArrowLeft size={16} /> Back
                            </button>
                            {step < 3 ? (
                                <button onClick={() => setStep(s => s + 1)}
                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-primary transition-colors">
                                    Next <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={submitting}
                                    className="flex items-center gap-1.5 px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50">
                                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <>Submit Booking <CheckCircle size={16} /></>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Price Breakdown */}
                <div>
                    {pricing && (
                        <PriceBreakdownCard
                            pricing={pricing}
                            services={services}
                            guestsCount={form.guestsCount}
                            hallSnapshot={{ priceModel: hall.priceModel }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
