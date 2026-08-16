import { getCustomerLedger } from '../../actions';
import Link from 'next/link';

export default async function CustomerLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const ledger = await getCustomerLedger(parseInt(resolvedParams.id));
  
  if (!ledger) {
    return <div>Customer not found</div>;
  }
  
  const { customer, totalSales, totalPayments, pendingAmount } = ledger;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{customer.name}'s Ledger</h1>
        <Link href="/customers" className="btn" style={{ background: 'var(--border)', color: 'var(--foreground)' }}>Back to Customers</Link>
      </div>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="stat-label">Total Purchased</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--foreground)' }}>{formatCurrency(totalSales)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{formatCurrency(totalPayments)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Remaining Balance</div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: pendingAmount > 0 ? 'var(--danger)' : 'var(--primary)' }}>
            {formatCurrency(pendingAmount)}
          </div>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0 }}>
        <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--background)', margin: 0 }}>Transaction History</h3>
        <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Details</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {customer.sales.map((s: any) => (
              <tr key={`sale-${s.id}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{formatDate(s.date)}</td>
                <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.6rem', background: '#fef2f2', color: 'var(--danger)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>Sale</span></td>
                <td style={{ padding: '1rem' }}>{s.quantityKg} KG {s.vegetable} @ ₹{s.ratePerKg}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>+{formatCurrency(s.totalAmount)}</td>
              </tr>
            ))}
            {customer.payments.map((p: any) => (
              <tr key={`pay-${p.id}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{formatDate(p.date)}</td>
                <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.6rem', background: '#ecfdf5', color: 'var(--primary)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>Payment</span></td>
                <td style={{ padding: '1rem' }}>Payment Received</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>-{formatCurrency(p.amount)}</td>
              </tr>
            ))}
            {customer.sales.length === 0 && customer.payments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
