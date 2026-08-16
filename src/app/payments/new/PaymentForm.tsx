'use client';
import { createPayment } from '../../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentForm({ customers }: { customers: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  async function action(formData: FormData) {
    setLoading(true);
    await createPayment(formData);
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
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount Received (₹) *</label>
        <input name="amount" type="number" step="0.01" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Sender Name (Who sent the money)</label>
        <input type="text" name="senderName" placeholder="e.g. Ramesh" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Transaction Receipt</label>
        <input type="file" name="receiptImage" accept="image/*" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
      </div>
      
      <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Saving...' : 'Record Payment'}
      </button>
    </form>
  );
}
