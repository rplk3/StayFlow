import {
  LayoutDashboard,
  Calendar,
  Map,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface GuestSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export default function GuestSidebar({ activeNav, setActiveNav }: GuestSidebarProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'bookings', icon: <Calendar size={18} />, label: 'Bookings' },
    { id: 'tours', icon: <Map size={18} />, label: 'Tours' },
    { id: 'history', icon: <Clock size={18} />, label: 'History' },
    { id: 'payments', icon: <CreditCard size={18} />, label: 'Payments' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <aside
      className="sidebar"
      style={{
        width: 260,
        background: '#f8f9fc',
        borderRight: '1px solid #eef1f6',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      <div
        className="sidebar-logo"
        style={{
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          letterSpacing: '0.05em',
        }}
      >
        <div style={{ color: '#0f172a', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.05em' }}>
          GUEST GO
        </div>
        <div style={{ color: '#8a94b2', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          PREMIUM SERVICE
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => setActiveNav(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              borderRadius: 8,
              background: activeNav === item.id ? '#ffffff' : 'transparent',
              color: activeNav === item.id ? '#0f172a' : '#64748b',
              fontWeight: activeNav === item.id ? 700 : 500,
              border: 'none',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
              marginBottom: 4,
              boxShadow: activeNav === item.id ? '0 2px 10px rgba(0,0,0,0.02)' : 'none',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                color: activeNav === item.id ? '#2563eb' : '#94a3b8',
              }}
            >
              {item.icon}
            </span>
            {item.label}
            {activeNav === item.id && (
              <div
                style={{
                  marginLeft: 'auto',
                  width: 4,
                  height: 16,
                  background: '#2563eb',
                  borderRadius: 2,
                }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ padding: '24px 16px' }}>
        <button
          style={{
            width: '100%',
            background: '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '12px 0',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: 24,
            cursor: 'pointer',
          }}
        >
          + New Booking
        </button>
        <button
          className="nav-item"
          onClick={() => setActiveNav('support')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 16px',
            color: '#64748b',
            fontWeight: 500,
            border: 'none',
            background: 'transparent',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <span style={{ color: '#94a3b8' }}>
            <HelpCircle size={18} />
          </span>{' '}
          Support
        </button>
        <button
          className="nav-item"
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 16px',
            color: '#64748b',
            fontWeight: 500,
            border: 'none',
            background: 'transparent',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <span style={{ color: '#94a3b8' }}>
            <LogOut size={18} />
          </span>{' '}
          Sign Out
        </button>
      </div>
    </aside>
  );
}
