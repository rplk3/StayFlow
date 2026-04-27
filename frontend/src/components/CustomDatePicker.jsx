import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const CustomDatePicker = ({ dateRange, setDateRange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Calendar');
    const [flexibility, setFlexibility] = useState('Exact dates');
    const wrapperRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const flexibilityOptions = ['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days'];

    // If checkIn/checkOut are empty strings, convert to Date objects for the picker
    const ranges = [{
        startDate: dateRange.checkIn ? new Date(dateRange.checkIn) : new Date(),
        endDate: dateRange.checkOut ? new Date(dateRange.checkOut) : addDays(new Date(), 1),
        key: 'selection',
        color: '#1d4ed8' // tailwind blue-700
    }];

    const handleSelect = (ranges) => {
        const { selection } = ranges;
        let endDate = selection.endDate;
        
        // Enforce maximum stay of 7 days
        const diffTime = Math.abs(selection.endDate - selection.startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
            endDate = addDays(selection.startDate, 7);
        }

        setDateRange({
            checkIn: format(selection.startDate, 'yyyy-MM-dd'),
            checkOut: format(endDate, 'yyyy-MM-dd')
        });
    };

    const displayDate = () => {
        if (!dateRange.checkIn && !dateRange.checkOut) return 'Select dates';
        if (dateRange.checkIn && !dateRange.checkOut) return format(new Date(dateRange.checkIn), 'MMM d');
        return `${format(new Date(dateRange.checkIn), 'MMM d')} - ${format(new Date(dateRange.checkOut), 'MMM d')}`;
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Input Trigger */}
            <div
                className="w-full flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-100 transition-all focus-within:ring-2 focus-within:ring-blue-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CalendarIcon className="text-gray-400 mr-3" size={20} />
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold mb-0.5">Dates</span>
                    <span className="text-gray-800 font-medium truncate min-h-[1.5rem] flex items-center">
                        {displayDate()}
                    </span>
                </div>
            </div>

            {/* Dropdown Calendar UI */}
            {isOpen && (
                <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-3 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 w-[300px] md:w-[700px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 p-2">
                        <button
                            className={`flex-1 py-3 text-sm font-bold transition-all rounded-t-xl border-b-2 ${activeTab === 'Calendar' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'}`}
                            onClick={(e) => { e.preventDefault(); setActiveTab('Calendar'); }}
                        >
                            Calendar
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-bold transition-all rounded-t-xl border-b-2 ${activeTab === 'Flexible dates' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'}`}
                            onClick={(e) => { e.preventDefault(); setActiveTab('Flexible dates'); }}
                        >
                            Flexible dates
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col items-center">
                        <style>
                            {`
                            /* Custom Styles to Override react-date-range defaults for modern look */
                            .rdrCalendarWrapper {
                                font-family: inherit;
                                background-color: transparent;
                            }
                            .rdrMonth {
                                width: 310px;
                            }
                            .rdrMonthName {
                                font-weight: 700;
                                font-size: 1rem;
                                color: #1f2937;
                            }
                            .rdrDayNumber span {
                                font-weight: 500;
                            }
                            `}
                        </style>
                        <DateRange
                            ranges={ranges}
                            onChange={handleSelect}
                            months={window.innerWidth >= 768 ? 2 : 1}
                            direction="horizontal"
                            minDate={new Date()} // VALIDATION: Prevents booking past dates
                            showDateDisplay={false}
                            showMonthAndYearPickers={false}
                            rangeColors={['#2563eb']}
                        />
                    </div>

                    {/* Flexibility Options Footer */}
                    <div className="border-t border-gray-100 p-4 bg-gray-50 flex flex-wrap gap-2">
                        {flexibilityOptions.map(option => (
                            <button
                                key={option}
                                onClick={(e) => { e.preventDefault(); setFlexibility(option); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${flexibility === option ? 'bg-blue-900 text-white shadow-md' : 'bg-white border text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
