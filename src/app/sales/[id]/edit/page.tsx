import { updateSale } from '../../../actions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const saleId = parseInt(id);
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });

  if (!sale) return <div>Not found</div>;

  async function handleUpdate(formData: FormData) {
    'use server';
    await updateSale(saleId, {
      vegetable: formData.get('vegetable') as string,
      quantityKg: parseFloat(formData.get('quantityKg') as string),
      ratePerKg: parseFloat(formData.get('ratePerKg') as string),
      totalAmount: parseFloat(formData.get('totalAmount') as string),
      commission: parseFloat(formData.get('commission') as string),
      date: formData.get('date') ? new Date(formData.get('date') as string) : undefined,
    });
    redirect(`/customers/${sale!.customerId}`);
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit Sale</h2>
      <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date & Time</label>
          <input type="datetime-local" name="date" defaultValue={sale.date ? new Date(sale.date.getTime() - sale.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vegetable *</label>
          <select name="vegetable" defaultValue={sale.vegetable} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <option value="">-- Select Vegetable --</option>
            <option value="CT (Carrot)">CT (Carrot)</option>
            <option value="BT (Beetroot)">BT (Beetroot)</option>
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
            <input type="number" step="0.01" name="quantityKg" defaultValue={sale.quantityKg} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rate per KG (₹) *</label>
            <input type="number" step="0.01" name="ratePerKg" defaultValue={sale.ratePerKg} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
          </div>
        </div>
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Total Amount (₹) *</label>
            <input type="number" step="0.01" name="totalAmount" defaultValue={sale.totalAmount} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Number of Boxes</label>
            <input type="number" name="commission" defaultValue={sale.commission || 0} required min="0" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
          <Link href={`/customers/${sale.customerId}`} className="btn" style={{ flex: 1, background: 'var(--border)', color: 'var(--foreground)' }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
