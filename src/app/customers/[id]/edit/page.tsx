import { updateCustomer } from '../../../actions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = parseInt(id);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  if (!customer) return <div>Not found</div>;

  async function handleUpdate(formData: FormData) {
    'use server';
    await updateCustomer(customerId, {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      shopName: formData.get('shopName') as string,
    });
    redirect(`/customers`);
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Edit Customer</h2>
      <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name *</label>
          <input type="text" name="name" defaultValue={customer.name} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone (Optional)</label>
          <input type="text" name="phone" defaultValue={customer.phone || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Shop Name (Optional)</label>
          <input type="text" name="shopName" defaultValue={customer.shopName || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
          <Link href="/customers" className="btn" style={{ flex: 1, background: 'var(--border)', color: 'var(--foreground)' }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
