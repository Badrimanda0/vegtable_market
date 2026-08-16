import { getDashboardStats, getRecentBills } from "./actions";
import Link from 'next/link';
import ResetButton from './reset-button';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const recentBills = await getRecentBills();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="stat-label">Today's Total Sales</div>
          <div className="stat-value">{formatCurrency(stats.todaySales)}</div>
        </div>
        
        <div className="card">
          <div className="stat-label">{stats.pendingDebt < 0 ? 'Total Advance (We Owe)' : 'Total Debt (Pending)'}</div>
          <div className="stat-value" style={{ color: stats.pendingDebt < 0 ? 'var(--success)' : 'var(--danger)' }}>
            {stats.pendingDebt < 0 ? formatCurrency(Math.abs(stats.pendingDebt)) : formatCurrency(stats.pendingDebt)}
          </div>
        </div>
        
        <div className="card">
          <div className="stat-label">Total Received</div>
          <div className="stat-value" style={{ color: 'var(--foreground)' }}>
            {formatCurrency(stats.totalReceived)}
          </div>
        </div>
        
        <div className="card">
          <div className="stat-label">Total Boxes</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {stats.totalCommission}
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3>Quick Actions</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          Get started by adding a new sale or recording a payment from a customer.
        </p>
        <div className="quick-actions-container">
          <Link href="/sales/new" className="btn">Add New Sale</Link>
          <Link href="/payments/new" className="btn" style={{ background: 'var(--foreground)' }}>Receive Payment</Link>
          <Link href="/customers" className="btn" style={{ background: 'var(--border)', color: 'var(--foreground)' }}>View Customers</Link>
          <Link href="/reports" className="btn" style={{ background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>View Reports</Link>
          <ResetButton />
        </div>
      </div>

      {recentBills.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Recently Uploaded Bills</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {recentBills.map((bill: any) => (
              <div key={bill.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                  <div style={{ fontWeight: 600 }}>{bill.customer.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(bill.date)}</div>
                </div>
                <div style={{ position: 'relative', width: '100%', height: '200px', background: '#f5f5f5' }}>
                  <img src={bill.billImage} alt={`Bill for ${bill.customer.name}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
