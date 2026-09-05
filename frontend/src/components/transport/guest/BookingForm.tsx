import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { createBooking } from '@/lib/api';
import LocationAutocomplete, { Place } from '@/components/LocationAutocomplete';
import {
  Car,
  Plane,
  Map as MapIcon,
  MapPin,
  Target,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';

const bookingSchema = z
  .object({
    pickupLocation: z.string().min(1, 'Pickup location is required'),
    destination: z.string().min(1, 'Drop-off location is required'),
    pickupDate: z.string().min(1, 'Date is required'),
    pickupTime: z.string().min(1, 'Time is required'),
    bookingType: z.string(),
    vehicleType: z.string().min(1, 'Vehicle type is required'),
    passengers: z
      .number({ invalid_type_error: 'Passengers must be a number' })
      .int('Passengers must be a whole number')
      .min(1, 'At least 1 passenger')
      .max(60, 'Maximum 60 passengers'),
    airport: z.string().optional(),
  })
  .refine(
    (data) =>
      data.bookingType !== 'Airport Taxi' || (data.airport && data.airport.trim().length > 0),
    {
      path: ['airport'],
      message: 'Please select an airport for airport taxi bookings',
    }
  )
  .refine(
    (data) => {
      const pickupDateTime = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
      return pickupDateTime.getTime() >= Date.now();
    },
    {
      path: ['pickupTime'],
      message: 'Pickup date/time cannot be in the past',
    }
  );

type BookingFormValues = z.infer<typeof bookingSchema>;

const VEHICLE_OPTIONS = [
  { title: 'Executive Sedan', subtitle: 'Standard luxury commuter', price: 'Rs 45.00', iconType: 'sedan', passengers: 3, backendTypes: ['Sedan', 'Luxury Sedan'] },
  { title: 'Premium SUV', subtitle: 'All-terrain comfort', price: 'Rs 75.00', iconType: 'suv', passengers: 6, backendTypes: ['SUV'] },
  { title: 'Executive Van', subtitle: 'Ideal for small groups', price: 'Rs 110.00', iconType: 'van', passengers: 8, backendTypes: ['Minivan'] },
  { title: 'Passenger Van', subtitle: 'Group travel and team outings', price: 'Rs 95.00', iconType: 'van', passengers: 12, backendTypes: ['Passenger Van'] },
  { title: 'Mini Bus', subtitle: 'Efficient local group transport', price: 'Rs 130.00', iconType: 'bus', passengers: 24, backendTypes: ['Mini Bus', 'Bus'] },
  { title: 'Coach Bus', subtitle: 'Large capacity group comfort', price: 'Rs 160.00', iconType: 'bus', passengers: 45, backendTypes: ['Coach Bus'] },
  { title: 'Extended Coach', subtitle: 'Maximum capacity touring', price: 'Rs 185.00', iconType: 'bus', passengers: 60, backendTypes: ['Extended Coach'] },
];

interface BookingFormProps {
  guestName: string;
  vehicles?: any[];
  onSuccess: () => void;
}

export default function BookingForm({ guestName, onSuccess, vehicles = [] }: BookingFormProps) {
  const [bookingType, setBookingType] = useState('Airport Taxi');
  const [airportDirection, setAirportDirection] = useState<'arrival' | 'departure'>('arrival');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [pickupPlace, setPickupPlace] = useState<Place | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<Place | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  const minTimeToday = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  useEffect(() => {
    if (pickupPlace && dropoffPlace) {
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickupPlace.lon},${pickupPlace.lat};${dropoffPlace.lon},${dropoffPlace.lat}?overview=false`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes[0]) {
            setDistanceKm(data.routes[0].distance / 1000);
          }
        })
        .catch(console.error);
    } else {
      setDistanceKm(null);
    }
  }, [pickupPlace, dropoffPlace]);


  const RATE_PER_KM = 60;
  const baseFare = distanceKm ? distanceKm * RATE_PER_KM : 0;
  const serviceFee = distanceKm ? 150 : 0;
  const tax = distanceKm ? baseFare * 0.18 : 0;
  const total = baseFare + serviceFee + tax;

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickupLocation: '',
      destination: '',
      pickupDate: new Date().toISOString().split('T')[0], // Today's date
      pickupTime: minTimeToday,
      bookingType: 'Airport Taxi',
      vehicleType: 'Executive Sedan',
      passengers: 1,
      airport: '',
    },
  });

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const current = form.getValues('vehicleType');
      const currentOpt = VEHICLE_OPTIONS.find(o => o.title === current);
      const isAvailable = currentOpt && vehicles.some(v => currentOpt.backendTypes.includes(v.type) && v.status?.toLowerCase() === 'available');
      if (!isAvailable) {
        const firstAvail = VEHICLE_OPTIONS.find(opt => vehicles.some(v => opt.backendTypes.includes(v.type) && v.status?.toLowerCase() === 'available'));
        if (firstAvail) {
          form.setValue('vehicleType', firstAvail.title);
        } else {
          form.setValue('vehicleType', '');
        }
      }
    }
  }, [vehicles, form]);

  const mutation = useMutation({
    mutationFn: (data: BookingFormValues) =>
      createBooking({
        guestName,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.destination,
        pickupTime: `${data.pickupDate}T${data.pickupTime}`,
        vehicleType: data.vehicleType,
        passengerCount: data.passengers,
        airport: data.airport,
      }),
    onSuccess: () => {
      form.reset();
      setSubmitError(null);
      onSuccess();
    },
    onError: (err: any) => {
      setSubmitError(err?.response?.data?.message || err.message || 'Failed to submit booking');
      console.error('Booking submission failed:', err);
    }
  });

  const selectedPickupDate = form.watch('pickupDate');
  const selectedPickupTime = form.watch('pickupTime');
  const minTime = selectedPickupDate === minDate ? minTimeToday : undefined;

  useEffect(() => {
    if (selectedPickupDate === minDate && selectedPickupTime && selectedPickupTime < minTimeToday) {
      form.setValue('pickupTime', minTimeToday, { shouldValidate: true });
    }
  }, [selectedPickupDate, selectedPickupTime, minDate, minTimeToday, form]);

  return (
    <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: 12, gap: 8 }}>
        {['Pickup', 'Airport Taxi', 'City Tour'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setBookingType(type);
              form.setValue('bookingType', type);
            }}
            style={{
              padding: '16px 0',
              border: 'none',
              borderRadius: 12,
              background: bookingType === type ? '#ffffff' : '#f8f9fc',
              boxShadow: bookingType === type ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
              color: bookingType === type ? '#0f172a' : '#64748b',
              fontWeight: bookingType === type ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span style={{ color: bookingType === type ? '#2563eb' : '#94a3b8' }}>
              {type === 'Pickup' ? <Car size={20} /> : type === 'Airport Taxi' ? <Plane size={20} /> : <MapIcon size={20} />}
            </span>
            {type}
          </button>
        ))}
      </div>

      {/* Form */ }
      <form onSubmit={form.handleSubmit(
        (d) => {
          setSubmitError(null);
          mutation.mutate(d);
        },
        (errors) => {
          setSubmitError(`Validation Error: ${Object.values(errors).map(e => e?.message).join(', ')}`);
        }
      )} style={{ padding: '32px' }}>
        {bookingType === 'Airport Taxi' && (
          <div style={{ display: 'inline-flex', background: '#f8f9fc', borderRadius: 24, padding: 4, marginBottom: 24, gap: 4 }}>
            <button
              type="button"
              onClick={() => {
                setAirportDirection('arrival');
                if (form.watch('airport')) form.setValue('pickupLocation', form.watch('airport') || '');
                form.setValue('destination', '');
              }}
              style={{
                background: airportDirection === 'arrival' ? '#1e3a8a' : 'transparent',
                color: airportDirection === 'arrival' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: 20,
                padding: '8px 20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: airportDirection === 'arrival' ? '0 2px 8px rgba(30,58,138,0.2)' : 'none',
              }}
            >
              Arrival
            </button>
            <button
              type="button"
              onClick={() => {
                setAirportDirection('departure');
                if (form.watch('airport')) form.setValue('destination', form.watch('airport') || '');
                form.setValue('pickupLocation', '');
              }}
              style={{
                background: airportDirection === 'departure' ? '#1e3a8a' : 'transparent',
                color: airportDirection === 'departure' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: 20,
                padding: '8px 20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: airportDirection === 'departure' ? '0 2px 8px rgba(30,58,138,0.2)' : 'none',
              }}
            >
              Departure
            </button>
          </div>
        )}

        {/* Locations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {bookingType === 'Airport Taxi' ? (
            airportDirection === 'arrival' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                    PICKUP AIRPORT
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fc', borderRadius: 8, padding: '0 16px', border: '1px solid transparent', transition: 'border-color 0.2s' }}>
                    <span style={{ color: '#1e3a8a' }}><Plane size={16} /></span>
                    <select
                      className="form-select"
                      style={{ background: 'transparent', border: 'none', padding: '16px 12px', width: '100%', outline: 'none', fontWeight: 600, appearance: 'none', color: '#0f172a', fontSize: '0.9rem', cursor: 'pointer' }}
                      value={form.watch('airport')}
                      onChange={(e) => {
                        const val = e.target.value;
                        form.setValue('airport', val, { shouldValidate: true });
                        form.setValue('pickupLocation', val, { shouldValidate: true });
                        const coords = val.includes('Bandaranaike') ? { lat: 7.1803, lon: 79.8833 } : val.includes('Mattala') ? { lat: 6.2863, lon: 81.1219 } : { lat: 6.8222, lon: 79.8794 };
                        setPickupPlace(coords as any);
                      }}
                    >
                      <option value="" disabled>Select Airport...</option>
                      <option value="Bandaranaike International (BIA) - Katunayake">Bandaranaike Intl (Katunayake)</option>
                      <option value="Mattala Rajapaksa International (HRI) - Mattala">Mattala Rajapaksa Intl (Mattala)</option>
                      <option value="Ratmalana International (RML) - Colombo">Ratmalana Intl (Colombo)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                    DROP-OFF DESTINATION
                  </label>
                  <LocationAutocomplete
                    placeholder="Hotel or City name"
                    icon={<MapPin size={16} color="#8a94b2" />}
                    value={form.watch('destination')}
                    onChange={(val) => form.setValue('destination', val, { shouldValidate: true })}
                    onSelectPlace={setDropoffPlace}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                    PICKUP LOCATION
                  </label>
                  <LocationAutocomplete
                    placeholder="Hotel or City name"
                    icon={<Target size={16} color="#8a94b2" />}
                    value={form.watch('pickupLocation')}
                    onChange={(val) => form.setValue('pickupLocation', val, { shouldValidate: true })}
                    onSelectPlace={setPickupPlace}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                    DROP-OFF AIRPORT
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fc', borderRadius: 8, padding: '0 16px', border: '1px solid transparent', transition: 'border-color 0.2s' }}>
                    <span style={{ color: '#1e3a8a' }}><Plane size={16} /></span>
                    <select
                      className="form-select"
                      style={{ background: 'transparent', border: 'none', padding: '16px 12px', width: '100%', outline: 'none', fontWeight: 600, appearance: 'none', color: '#0f172a', fontSize: '0.9rem', cursor: 'pointer' }}
                      value={form.watch('airport')}
                      onChange={(e) => {
                        const val = e.target.value;
                        form.setValue('airport', val, { shouldValidate: true });
                        form.setValue('destination', val, { shouldValidate: true });
                        const coords = val.includes('Bandaranaike') ? { lat: 7.1803, lon: 79.8833 } : val.includes('Mattala') ? { lat: 6.2863, lon: 81.1219 } : { lat: 6.8222, lon: 79.8794 };
                        setDropoffPlace(coords as any);
                      }}
                    >
                      <option value="" disabled>Select Airport...</option>
                      <option value="Bandaranaike International (BIA) - Katunayake">Bandaranaike Intl (Katunayake)</option>
                      <option value="Mattala Rajapaksa International (HRI) - Mattala">Mattala Rajapaksa Intl (Mattala)</option>
                      <option value="Ratmalana International (RML) - Colombo">Ratmalana Intl (Colombo)</option>
                    </select>
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                  PICKUP LOCATION
                </label>
                <LocationAutocomplete
                  placeholder="Grand Hyatt Residence"
                  icon={<Target size={16} color="#8a94b2" />}
                  value={form.watch('pickupLocation')}
                  onChange={(val) => form.setValue('pickupLocation', val, { shouldValidate: true })}
                  onSelectPlace={setPickupPlace}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                  DESTINATION
                </label>
                <LocationAutocomplete
                  placeholder="Where to?"
                  icon={<MapPin size={16} color="#8a94b2" />}
                  value={form.watch('destination')}
                  onChange={(val) => form.setValue('destination', val, { shouldValidate: true })}
                  onSelectPlace={setDropoffPlace}
                />
              </div>
            </>
          )}
        </div>

        {/* Date, Time, Passengers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>DATE</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fc', borderRadius: 8, padding: '0 16px' }}>
              <span style={{ color: '#94a3b8' }}><Calendar size={16} /></span>
              <input
                type="date"
                min={minDate}
                className="form-input"
                style={{ background: 'transparent', border: 'none', padding: '16px 12px', width: '100%', outline: 'none', fontWeight: 500 }}
                {...form.register('pickupDate')}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>TIME</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fc', borderRadius: 8, padding: '0 16px' }}>
              <span style={{ color: '#94a3b8' }}><Clock size={16} /></span>
              <input
                type="time"
                min={minTime}
                className="form-input"
                style={{ background: 'transparent', border: 'none', padding: '16px 12px', width: '100%', outline: 'none', fontWeight: 500 }}
                {...form.register('pickupTime')}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>PASSENGERS</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fc', borderRadius: 8, padding: '0 16px' }}>
              <span style={{ color: '#94a3b8' }}>👥</span>
              <select className="form-select" style={{ background: 'transparent', border: 'none', padding: '16px 12px', width: '100%', outline: 'none', fontWeight: 500, appearance: 'none' }} {...form.register('passengers', { valueAsNumber: true })}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                  <option key={count} value={count}>{count} {count === 1 ? 'Person' : 'People'}</option>
                ))}
                <option value="12">12 People</option>
                <option value="15">15 People</option>
                <option value="20">20 People</option>
                <option value="24">24 People</option>
                <option value="30">30 People</option>
                <option value="45">45 People</option>
                <option value="60">60 People</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: 16, textTransform: 'uppercase' }}>VEHICLE SELECTION</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '340px', overflowY: 'auto' }}>
            {VEHICLE_OPTIONS.map((car) => {
              const isSelected = form.watch('vehicleType') === car.title;
              const isAvailable = vehicles.length === 0 || vehicles.some(v => car.backendTypes.includes(v.type) && v.status?.toLowerCase() === 'available');

              return (
                <div
                  key={car.title}
                  onClick={() => {
                    if (isAvailable) {
                      form.setValue('vehicleType', car.title);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isSelected ? '#f5f8ff' : isAvailable ? '#f8f9fc' : '#f1f5f9',
                    border: `1.5px solid ${isSelected ? '#1e3a8a' : 'transparent'}`,
                    borderRadius: 12,
                    padding: '16px 20px',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.6,
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 56, height: 56, background: '#e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', flexShrink: 0
                    }}>
                      <Car size={30} />
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? '#1e3a8a' : '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        {car.title}
                        {!isAvailable && (
                          <span style={{ marginLeft: 8, fontSize: '0.6rem', padding: '2px 6px', background: '#fee2e2', color: '#dc2626', borderRadius: 4, fontWeight: 800, letterSpacing: '0.05em' }}>
                            UNAVAILABLE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{car.subtitle}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.7rem', color: '#0f172a', fontWeight: 700 }}>
                        <span style={{ fontSize: '0.8rem' }}>👥</span> Up to {car.passengers} pax
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isSelected ? '#1e3a8a' : '#0f172a' }}>{car.price}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', marginTop: 2 }}>PER HOUR</div>
                    </div>
                    <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
                      {isSelected && <CheckCircle size={20} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trip Estimate */}
        {distanceKm !== null && (
          <div style={{ background: '#f8f9fc', borderRadius: 16, padding: 32, marginBottom: 32, border: '1px solid #eef1f6' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>TRIP ESTIMATE</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Route Distance</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{distanceKm.toFixed(1)} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Base Fare (Rs 60/km)</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Rs {baseFare.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Service Fee</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Rs {serviceFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid #eef1f6', marginBottom: 20, fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Taxes & Others (18%)</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Rs {tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.05rem' }}>Estimated Total</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#2563eb', fontWeight: 900, fontSize: '1.6rem' }}>Rs {total.toFixed(2)}</span>
                <div style={{ color: '#8a94b2', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', marginTop: 4 }}>FINAL PRICE MAY VARY</div>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca', fontSize: '0.9rem', fontWeight: 600 }}>
            {submitError}
          </div>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          style={{ width: '100%', padding: '18px', background: '#0a192f', color: '#ffffff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10, 25, 47, 0.4)' }}
        >
          {mutation.isPending ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}
