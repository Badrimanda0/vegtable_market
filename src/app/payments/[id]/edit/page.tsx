import { updatePayment } from '../../../actions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paymentId = parseInt(id);
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  
  if (!payment) return <div>Not found</div>;

  async function handleUpdate(formData: FormData) {
    'use server';
    await updatePayment(paymentId, {
      amount: parseFloat(formData.get('amount') as string),
    });
    redirect(`/customers/${payment!.customerId}`);
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit Payment</h2>
      <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount (₹) *</label>
          <input type="number" step="0.01" name="amount" defaultValue={payment.amount} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
          <Link href={`/customers/${payment.customerId}`} className="btn" style={{ flex: 1, background: 'var(--border)', color: 'var(--foreground)' }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
