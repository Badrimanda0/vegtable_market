import { getDashboardStats } from "./actions";
import Link from 'next/link';

export default async function Dashboard() {
  const stats = await getDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
          <div className="stat-label">Total Debt (Pending)</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {formatCurrency(stats.pendingDebt)}
          </div>
        </div>
        
        <div className="card">
          <div className="stat-label">Total Received</div>
          <div className="stat-value" style={{ color: 'var(--foreground)' }}>
            {formatCurrency(stats.totalReceived)}
          </div>
        </div>
        
        <div className="card">
          <div className="stat-label">Total Commission Earned</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {formatCurrency(stats.totalCommission)}
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3>Quick Actions</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          Get started by adding a new sale or recording a payment from a customer.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/sales/new" className="btn">Add New Sale</Link>
          <Link href="/payments/new" className="btn" style={{ background: 'var(--foreground)' }}>Receive Payment</Link>
          <Link href="/customers" className="btn" style={{ background: 'var(--border)', color: 'var(--foreground)' }}>View Customers</Link>
          <Link href="/reports" className="btn" style={{ background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>View Reports</Link>
        </div>
      </div>
    </div>
  );
}
