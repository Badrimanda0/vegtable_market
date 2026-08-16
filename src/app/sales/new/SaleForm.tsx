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
  
  const subtotal = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);
  const commAmount = parseFloat(commission) || 0;
  const total = subtotal - commAmount;
  
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
        <select name="vegetable" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <option value="">-- Select Vegetable --</option>
          <option value="CT (Country Tomato)">CT (Country Tomato)</option>
          <option value="BT (Bangalore Tomato)">BT (Bangalore Tomato)</option>
          <option value="Caps (Capsicum)">Caps (Capsicum)</option>
          <option value="CB (Cabbage)">CB (Cabbage)</option>
          <option value="CF (Cauliflower)">CF (Cauliflower)</option>
          <option value="Chama (Taro Root)">Chama (Taro Root)</option>
          <option value="BM (Bajji Mirchi)">BM (Bajji Mirchi)</option>
          <option value="ML (Mullangi)">ML (Mullangi)</option>
          <option value="Beera (Ridge Gourd)">Beera (Ridge Gourd)</option>
          <option value="BNS (Green Beans)">BNS (Green Beans)</option>
          <option value="Kakara (Bitter Gourd)">Kakara (Bitter Gourd)</option>
          <option value="AA Kakara (Teasel Gourd)">AA Kakara (Teasel Gourd)</option>
          <option value="Dhonda (Ivy Gourd)">Dhonda (Ivy Gourd)</option>
          <option value="Keera (Cucumber)">Keera (Cucumber)</option>
          <option value="Benda (Okra)">Benda (Okra)</option>
          <option value="Sora (Bottle Gourd)">Sora (Bottle Gourd)</option>
          <option value="Mirchi (Green Chilli)">Mirchi (Green Chilli)</option>
          <option value="Dosa (Yellow Cucumber)">Dosa (Yellow Cucumber)</option>
          <option value="Munaga (Drumstick)">Munaga (Drumstick)</option>
          <option value="Ulli (Onion)">Ulli (Onion)</option>
          <option value="Gummadi (Pumpkin)">Gummadi (Pumpkin)</option>
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
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Commission Amount (₹) *</label>
        <input name="commission" type="number" step="0.01" value={commission} onChange={e => setCommission(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
      </div>
      
      <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--danger)' }}>
          <span>Commission:</span>
          <span>-₹{commAmount.toFixed(2)}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Net Total Amount</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{total.toFixed(2)}</div>
      </div>
      
      <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Saving...' : 'Confirm Sale'}
      </button>
    </form>
  );
}
