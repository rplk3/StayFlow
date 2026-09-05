import { Search, Bell } from 'lucide-react';

interface GuestTopbarProps {
  guestName?: string;
  hasWarnings: boolean;
  warningsCount: number;
}

export default function GuestTopbar({ guestName, hasWarnings, warningsCount }: GuestTopbarProps) {
  return (
    <header
      className="topbar page-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        borderBottom: '1px solid #eef1f6',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ flex: 1, position: 'relative', maxWidth: 400 }}>
        <span
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
          }}
        >
          <Search size={16} />
        </span>
        <input
          className="form-input"
          style={{
            paddingLeft: 40,
            border: 'none',
            background: '#f8fafc',
            borderRadius: 8,
            height: 44,
            width: '100%',
          }}
          placeholder="Search destinations, hotels..."
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button
          className="notif-btn"
          style={{
            background: '#f8fafc',
            border: 'none',
            padding: 10,
            borderRadius: '50%',
            color: '#64748b',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bell size={18} />
          {hasWarnings && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                background: '#ef4444',
                borderRadius: '50%',
              }}
            />
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="avatar"
            style={{
              width: 40,
              height: 40,
              background: '#0f172a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontWeight: 700,
            }}
          >
            {guestName ? guestName[0].toUpperCase() : 'G'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              {guestName || 'Guest User'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
              Premium Member
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
