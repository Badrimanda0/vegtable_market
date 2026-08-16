import { getCustomers } from '../actions';
import NewCustomerForm from './NewCustomerForm';
import Link from 'next/link';

export default async function CustomersPage() {
  const customers = await getCustomers();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Customers</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Phone</th>
                  <th style={{ padding: '1rem' }}>Pending Amount</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      <Link href={`/customers/${c.id}`} style={{ color: 'var(--primary)' }}>{c.name}</Link>
                    </td>
                    <td style={{ padding: '1rem' }}>{c.phone || '-'}</td>
                    <td style={{ padding: '1rem', color: c.pendingAmount > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {formatCurrency(c.pendingAmount)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/customers/${c.id}`} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Ledger</Link>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found. Add one to get started!</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Add New Customer</h3>
            <NewCustomerForm />
          </div>
        </div>
      </div>
    </div>
  );
}
