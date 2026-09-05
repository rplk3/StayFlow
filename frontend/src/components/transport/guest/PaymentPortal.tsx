import { useState } from 'react';
import { CreditCard, Plus, Receipt, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export default function PaymentPortal() {
  const { bookings } = useAppStore();
  const [showAddCard, setShowAddCard] = useState(false);

  // Mock data for saved cards
  const savedCards = [
    { id: '1', brand: 'Visa', last4: '4242', exp: '12/26', isDefault: true },
    { id: '2', brand: 'Mastercard', last4: '5555', exp: '08/25', isDefault: false },
  ];

  // Calculate recent transactions from actual bookings, fallback to empty array
  const transactions = bookings.slice(0, 5).map((b) => {
    // Estimating cost. Since we don't store actual calculated price in the backend yet, let's mock it based on passenger count or distance if we had it.
    // For now we generate a fake price around Rs 3000 to Rs 15000 based on pax
    const estimatedCost = (b.passengerCount || 2) * 2500; 
    
    return {
      id: b._id,
      date: new Date(b.pickupTime).toLocaleDateString(),
      description: `Trip to ${b.dropoffLocation}`,
      amount: `Rs ${estimatedCost.toLocaleString('.00')}`,
      status: b.status === 'Completed' ? 'Paid' : 'Pending',
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Billing & Payments
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Manage your payment methods and view your transaction history.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1.5fr', gap: 32 }}>
        {/* Left Column: Payment Methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Balance Summary */}
          <div style={{ background: '#0a192f', borderRadius: 20, padding: 32, color: '#ffffff', boxShadow: '0 10px 30px rgba(10, 25, 47, 0.15)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.1 }}>
              <CreditCard size={150} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>Current Balance</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Rs 0.00</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Pay Balance
                </button>
                <button style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Add Funds
                </button>
              </div>
            </div>
          </div>

          {/* Saved Cards */}
          <div style={{ background: '#ffffff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Payment Methods</h3>
              <button 
                onClick={() => setShowAddCard(!showAddCard)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8f9fc', color: '#2563eb', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            {showAddCard && (
              <div style={{ background: '#f8f9fc', padding: 20, borderRadius: 12, marginBottom: 24, border: '1px solid #eef1f6' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>Add Credit/Debit Card</h4>
                <input type="text" placeholder="Card Number" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 12, outline: 'none' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} />
                  <input type="text" placeholder="CVC" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <button
                  onClick={() => setShowAddCard(false)}
                  style={{ width: '100%', background: '#1e3a8a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Card
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {savedCards.map(card => (
                <div key={card.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: `1.5px solid ${card.isDefault ? '#2563eb' : '#eef1f6'}`, borderRadius: 12, background: card.isDefault ? '#f5f8ff' : '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 32, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', fontWeight: 800, fontSize: '0.7rem' }}>
                      {card.brand}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>•••• •••• •••• {card.last4}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>Expires {card.exp}</div>
                    </div>
                  </div>
                  {card.isDefault && (
                    <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontWeight: 800 }}>DEFAULT</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div style={{ background: '#ffffff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Recent Transactions</h3>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <Receipt size={16} /> View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <Receipt size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontWeight: 500 }}>No recent transactions found.</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: idx !== transactions.length - 1 ? '1px solid #eef1f6' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: tx.status === 'Paid' ? '#ecfdf5' : '#fffbeb', color: tx.status === 'Paid' ? '#059669' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {tx.status === 'Paid' ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginBottom: 4 }}>{tx.description}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tx.date} • {tx.status === 'Paid' ? 'Card ending in 4242' : 'Pending Payment'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{tx.amount}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 4, color: tx.status === 'Paid' ? '#059669' : '#d97706' }}>
                      {tx.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
