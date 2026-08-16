'use client';
import { createCustomer } from '../actions';
import { useState } from 'react';

export default function NewCustomerForm() {
  const [loading, setLoading] = useState(false);
  
  async function action(formData: FormData) {
    setLoading(true);
    await createCustomer({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      shopName: formData.get('shopName') as string,
    });
    setLoading(false);
    // @ts-ignore
    document.getElementById('new-customer-form')?.reset();
  }
  
  return (
    <form id="new-customer-form" action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Name *</label>
        <input name="name" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Phone</label>
        <input name="phone" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Shop Name</label>
        <input name="shopName" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>
      <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Adding...' : 'Add Customer'}
      </button>
    </form>
  );
}
