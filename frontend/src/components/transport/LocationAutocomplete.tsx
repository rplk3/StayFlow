import { useState, useEffect, useRef } from 'react';

export interface Place {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationAutocompleteProps {
    placeholder: string;
    icon: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    onSelectPlace?: (place: Place | null) => void;
    error?: string;
}

export default function LocationAutocomplete({ placeholder, icon, value, onChange, onSelectPlace, error }: LocationAutocompleteProps) {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState<Place[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync prop changes
    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    // Debounced search against OpenStreetMap Nominatim
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2 && query !== value) {
                setLoading(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
                    const data = await res.json();
                    setResults(data);
                    setIsOpen(true);
                } catch (e) {
                    console.error("Geocoding failed", e);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query, value]);

    const handleSelect = (place: Place) => {
        onChange(place.display_name);
        setQuery(place.display_name);
        onSelectPlace?.(place);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (e.target.value === '') {
            onChange('');
            onSelectPlace?.(null);
        }
    };

    // Handler for using current location
    const handleUseCurrentLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            // Reverse geocode using Nominatim
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await res.json();
                if (data && data.display_name) {
                    onChange(data.display_name);
                    setQuery(data.display_name);
                    onSelectPlace?.({
                        place_id: data.place_id || 0,
                        display_name: data.display_name,
                        lat: String(latitude),
                        lon: String(longitude),
                    });
                }
            } catch (e) {
                alert('Failed to get address from location.');
            }
        }, (err) => {
            alert('Unable to retrieve your location.');
        });
    };

    return (
        <div style={{ position: 'relative' }} ref={wrapperRef}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fc', borderRadius: 8, padding: '0 16px', border: error ? '1px solid #ef4444' : '1px solid transparent' }}>
                <span style={{ color: '#0f172a' }}>{icon}</span>
                <input
                    className="form-input"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                    style={{ background: 'transparent', border: 'none', padding: '16px 12px', width: '100%', outline: 'none', fontWeight: 500, color: '#0f172a' }}
                />
                <button type="button" onClick={handleUseCurrentLocation} style={{ marginLeft: 8, background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#3730a3', fontWeight: 600 }} title="Use current location">📡</button>
                {loading && <span style={{ fontSize: 12, color: '#94a3b8' }}>...</span>}
            </div>

            {isOpen && results.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#ffffff', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                    {results.map(place => (
                        <div
                            key={place.place_id}
                            onClick={() => handleSelect(place)}
                            style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 500, borderBottom: '1px solid #eef1f6', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                        >
                            <span style={{ fontSize: '1rem', color: '#64748b' }}>📍</span>
                            {place.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
