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
    });
    redirect(`/customers/${sale!.customerId}`);
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit Sale</h2>
      <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vegetable *</label>
          <input type="text" name="vegetable" defaultValue={sale.vegetable} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Commission (₹)</label>
            <input type="number" step="0.01" name="commission" defaultValue={sale.commission} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
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
