'use client';

import { useState } from 'react';
import DeleteButton from '../delete-button';
import { deleteOrder1 } from '../actions';

export default function Order1List({ orders }: { orders: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Group by date
  const groupedOrders: Record<string, any[]> = {};
  
  orders.forEach(order => {
    const dateStr = formatDate(order.date);
    if (!groupedOrders[dateStr]) {
      groupedOrders[dateStr] = [];
    }
    groupedOrders[dateStr].push(order);
  });

  // Filter dates
  const filteredDates = Object.keys(groupedOrders).filter(dateStr => 
    dateStr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Dailywise Items list</h3>
        <input 
          type="text" 
          placeholder="Search by date..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
          style={{ width: '100%', maxWidth: '300px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredDates.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', gridColumn: '1 / -1' }}>No orders found...</div>
        ) : (
          filteredDates.map(dateStr => (
            <div key={dateStr} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--card)', fontWeight: 600 }}>
                {dateStr}
              </div>
              <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {groupedOrders[dateStr].map(order => (
                  <div key={`order1-${order.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {order.vegetableOption} - {order.numberOfVegetables}
                    </div>
                    <DeleteButton action={async () => { await deleteOrder1(order.id); }} itemType="Item" />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
