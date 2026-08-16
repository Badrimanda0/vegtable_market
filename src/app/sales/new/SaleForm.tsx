'use client';
import { createSale } from '../../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SaleForm({ customers }: { customers: any[] }) {
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [commission, setCommission] = useState('0');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const total = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);
  
  async function action(formData: FormData) {
    setLoading(true);
    await createSale({
      customerId: parseInt(formData.get('customerId') as string),
      vegetable: formData.get('vegetable') as string,
      quantityKg: parseFloat(formData.get('quantityKg') as string),
      ratePerKg: parseFloat(formData.get('ratePerKg') as string),
      totalAmount: total,
      commission: parseFloat(formData.get('commission') as string) || 0,
    });
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
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vegetable Name *</label>
        <input name="vegetable" placeholder="e.g. Tomato" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
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
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Commission Amount (₹) *</label>
        <input name="commission" type="number" step="0.01" value={commission} onChange={e => setCommission(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>
      
      <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Amount</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{total.toFixed(2)}</div>
      </div>
      
      <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Saving...' : 'Confirm Sale'}
      </button>
    </form>
  );
}
