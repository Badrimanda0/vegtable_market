import { getDailyReports } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const reports = await getDailyReports();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(date);
  };

  return (
    <div>
      <h1 className="page-title">Daily Reports</h1>
      
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Total Sales</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)' }}>Commission Earned</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Received Payments</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)' }}>New Pending Debt</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{formatDate(r.date)}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(r.totalSales)}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)', background: '#ecfdf5' }}>{formatCurrency(r.totalCommission)}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(r.totalReceived)}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: r.pendingGenerated > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {r.pendingGenerated > 0 ? '+' : ''}{formatCurrency(r.pendingGenerated)}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No reports generated yet. Add sales or payments to see data here.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
