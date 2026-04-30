export const getAdminRole = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0].toLowerCase();
    
    // Super Admins
    if (namePart === 'admin' || namePart === 'superadmin' || namePart === 'stayflow') return 'super';
    
    // Assigned Section Admins (e.g. adminpayment@..., adminhotel@...)
    if (namePart.startsWith('admin')) {
        const role = namePart.replace('admin', '');
        return role; // e.g., 'payment', 'hotel', 'room', 'transport', 'event', 'analytics'
    }
    
    return 'super'; // Fallback for backwards compatibility if they don't use 'admin...' format for super admins
};

export const getAssignedSectionPath = (role) => {
    // Determine the route to redirect based on the role
    switch (role) {
        case 'payment':
        case 'payments':
            return '/admin/payments';
        case 'hotel':
        case 'hotels':
            return '/admin/hotels';
        case 'room':
        case 'rooms':
            return '/admin/rooms';
        case 'transport':
            return '/admin/transport';
        case 'event':
        case 'events':
            return '/admin/event-bookings';
        case 'analytics':
            return '/admin/dashboard'; // Analytics might just use dashboard
        case 'super':
        default:
            return '/admin/dashboard';
    }
};

export const isAuthorizedForRoute = (role, pathname) => {
    if (role === 'super') return true;
    
    // Everyone should be able to see dashboard and account
    if (pathname === '/admin/dashboard' || pathname === '/admin/account' || pathname === '/admin') return true;

    // Check specific assigned sections
    if (pathname.startsWith('/admin/payments') && (role === 'payment' || role === 'payments')) return true;
    if (pathname.startsWith('/admin/hotels') && (role === 'hotel' || role === 'hotels')) return true;
    if (pathname.startsWith('/admin/rooms') && (role === 'room' || role === 'rooms')) return true;
    if (pathname.startsWith('/admin/transport') && role === 'transport') return true;
    if (pathname.startsWith('/admin/event-bookings') && (role === 'event' || role === 'events')) return true;
    
    // Analytics
    if ((pathname.startsWith('/admin/forecast') || pathname.startsWith('/admin/reports') || 
         pathname.startsWith('/admin/alerts') || pathname.startsWith('/admin/bi')) && role === 'analytics') {
        return true;
    }

    // Default to false for anything else
    return false;
};
