'use client';
import { createPayment } from '../../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentForm({ customers }: { customers: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  async function action(formData: FormData) {
    setLoading(true);
    await createPayment({
      customerId: parseInt(formData.get('customerId') as string),
      amount: parseFloat(formData.get('amount') as string),
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
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount Received (₹) *</label>
        <input name="amount" type="number" step="0.01" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>
      
      <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Saving...' : 'Record Payment'}
      </button>
    </form>
  );
}
