'use client';
import { createSale } from '../../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VEGETABLE_OPTIONS } from '@/lib/vegetables';

export default function SaleForm({ customers }: { customers: any[] }) {
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [boxes, setBoxes] = useState('0');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const subtotal = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);
  const total = subtotal;
  
  async function action(formData: FormData) {
    setLoading(true);
    formData.append('totalAmount', total.toString());
    await createSale(formData);
    setLoading(false);
    router.push('/customers');
  }
  
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Customer *</label>
        <select name="customerId" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <option value="">-- Choose Customer --</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name} (Pending: ₹{c.pendingAmount})</option>
          ))}
        </select>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date & Time</label>
        <input type="datetime-local" name="date" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
        <small style={{ color: 'var(--text-muted)' }}>Leave blank to use current date and time</small>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vegetable Name *</label>
        <select name="vegetable" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <option value="">-- Select Vegetable --</option>
          {VEGETABLE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      
      <div className="form-row">
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity (KG) *</label>
          <input name="quantityKg" type="number" step="0.01" value={qty} onChange={e => setQty(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rate per KG (₹) *</label>
          <input name="ratePerKg" type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
        </div>
      </div>
      
      {total > 0 && (
        <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Calculated Total Amount:</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--foreground)' }}>₹{total.toFixed(2)}</span>
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Number of Boxes *</label>
        <input name="commission" type="number" value={boxes} onChange={e => setBoxes(e.target.value)} required min="0" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Bill/Item Image</label>
        <input type="file" name="billImage" accept="image/*" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
      </div>
      
      <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Saving...' : 'Confirm Sale'}
      </button>
    </form>
  );
}
