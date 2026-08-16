'use client';
import { createSale } from '../../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
          <option value="CRT (Carrot)">CRT (Carrot)</option>
          <option value="BRT (Beetroot)">BRT (Beetroot)</option>
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
