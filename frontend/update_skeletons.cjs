const fs = require('fs');

function updateHotelDetails() {
    let content = fs.readFileSync('src/modules/hotelRoom/pages/HotelDetails.jsx', 'utf8');
    const target = `    if (!data) return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-12">
            <div className="max-w-5xl mx-auto w-full px-4 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-80 w-full bg-gray-200 rounded-3xl mb-8"></div>
                <div className="h-10 w-2/3 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
            </div>
        </div>
    );`;
    
    const replacement = `    if (!data) return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header style={{ background: C[900] }} className="text-white sticky top-0 z-50 shadow-md h-[52px] w-full"></header>
            <main className="max-w-5xl mx-auto px-4 pt-6 w-full animate-pulse">
                <div className="h-4 w-64 bg-gray-200 rounded mb-4"></div>
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="rounded-2xl bg-gray-200 h-[400px] w-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                    <div className="md:col-span-2 space-y-4">
                        <div className="h-8 w-48 bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-10 w-full bg-white border border-gray-100 rounded-lg shadow-sm"></div>
                        <div className="h-10 w-full bg-white border border-gray-100 rounded-lg shadow-sm"></div>
                        <div className="h-10 w-full bg-white border border-gray-100 rounded-lg shadow-sm"></div>
                    </div>
                </div>
            </main>
        </div>
    );`;

    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedTarget = target.replace(/\r\n/g, '\n');
    const result = normalizedContent.replace(normalizedTarget, replacement);
    fs.writeFileSync('src/modules/hotelRoom/pages/HotelDetails.jsx', result);
}

function updateSearchResults() {
    let content = fs.readFileSync('src/modules/hotelRoom/pages/SearchResults.jsx', 'utf8');
    const target = `                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 animate-pulse h-48">
                                        <div className="w-64 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1 space-y-3 py-2">
                                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full mt-4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : hotels.length === 0 ? (`;
                        
    const replacement = `                        {loading ? (
                            <div className="space-y-5">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row h-auto sm:h-56 animate-pulse">
                                        <div className="w-full sm:w-72 h-48 sm:h-full bg-gray-200 shrink-0"></div>
                                        <div className="p-5 flex flex-col flex-1 w-full">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
                                                <div className="h-6 bg-gray-200 rounded-md w-12 shrink-0"></div>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                                            <div className="space-y-2 mt-1 mb-4 flex-1">
                                                <div className="h-3 bg-gray-200 rounded-md w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-4/5"></div>
                                            </div>
                                            <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                                                <div className="flex gap-2">
                                                    <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
                                                    <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
                                                    <div className="h-10 w-32 bg-gray-200 rounded-xl mt-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : hotels.length === 0 ? (`;
                        
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedTarget = target.replace(/\r\n/g, '\n');
    const result = normalizedContent.replace(normalizedTarget, replacement);
    fs.writeFileSync('src/modules/hotelRoom/pages/SearchResults.jsx', result);
}

try {
    updateHotelDetails();
    console.log("Updated HotelDetails");
    updateSearchResults();
    console.log("Updated SearchResults");
} catch (e) {
    console.error(e);
}
