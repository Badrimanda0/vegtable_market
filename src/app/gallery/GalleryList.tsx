'use client';

import { useState } from 'react';

type GalleryItem = {
  id: string;
  type: string;
  image: string;
  customerName: string;
  date: Date;
  amount: number;
};

type GroupedImages = {
  dateString: string;
  items: GalleryItem[];
};

export default function GalleryList({ groupedImages }: { groupedImages: GroupedImages[] }) {
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const toggleDate = (dateString: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateString]: !prev[dateString]
    }));
  };

  const formatDateLabel = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (groupedImages.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No images have been uploaded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {groupedImages.map((group) => {
        const isExpanded = expandedDates[group.dateString];
        
        return (
          <div key={group.dateString} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <button 
              onClick={() => toggleDate(group.dateString)}
              style={{
                width: '100%',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isExpanded ? 'var(--background)' : 'transparent',
                border: 'none',
                borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{formatDateLabel(group.dateString)}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{group.items.length} image(s)</span>
              </div>
              <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                ▼
              </div>
            </button>
            
            {isExpanded && (
              <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', background: '#fafafa' }}>
                {group.items.map(item => (
                  <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: '#fff' }}>
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.customerName}</span>
                        <span style={{ color: item.type === 'sale' ? 'var(--foreground)' : 'var(--success)' }}>
                          ₹{item.amount}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span>{item.type === 'sale' ? 'Bill' : 'Receipt'}</span>
                        <span>{formatTime(item.date)}</span>
                      </div>
                    </div>
                    <div style={{ position: 'relative', width: '100%', height: '250px', background: '#f5f5f5' }}>
                      <img 
                        src={item.image} 
                        alt={`${item.type} for ${item.customerName}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
