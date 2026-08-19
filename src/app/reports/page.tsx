import Link from 'next/link';
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

  // Cumulative totals
  const totalSalesAllTime = reports.reduce((sum, r) => sum + r.totalSales, 0);
  const totalBoxesAllTime = reports.reduce((sum, r) => sum + r.totalCommission, 0);
  const totalReceivedAllTime = reports.reduce((sum, r) => sum + r.totalReceived, 0);
  const totalActivitiesAllTime = reports.reduce((sum, r) => sum + r.totalActivities, 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Daily Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Click on any date to see the complete breakdown of all sales, payments, boxes, and daily activities.
          </p>
        </div>
      </div>

      {/* Top summary stats */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-label">Total Sales Recorded</div>
          <div className="stat-value" style={{ color: 'var(--foreground)' }}>{formatCurrency(totalSalesAllTime)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Across {reports.length} recorded day(s)</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="stat-label">Total Boxes Sold</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{totalBoxesAllTime} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Boxes</span></div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total commissions / boxes</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-label">Total Payments Received</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>{formatCurrency(totalReceivedAllTime)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Collected from customers</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="stat-label">Total Day Activities</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{totalActivitiesAllTime}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Sales, payments & entries</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--foreground)' }}>
            Daily Summary List
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {reports.length} day(s)
          </span>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Date (Click to View Activities)</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Total Sales</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)' }}>Total Boxes</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Received Payments</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)' }}>New Pending Debt</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Activities</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr 
                  key={r.dateKey || i} 
                  style={{ 
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.15s ease'
                  }}
                  className="hover-row"
                >
                  <td style={{ padding: '1rem' }}>
                    <Link 
                      href={`/reports/${r.dateKey}`}
                      style={{ 
                        display: 'inline-flex', 
                        flexDirection: 'column', 
                        gap: '0.25rem',
                        textDecoration: 'none',
                        color: 'var(--primary)',
                        fontWeight: 600
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                        📅 {formatDate(r.date)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {r.totalActivities} total record(s) on this day
                      </span>
                    </Link>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                    <div>{formatCurrency(r.totalSales)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {r.salesCount} sale{r.salesCount === 1 ? '' : 's'}
                    </div>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)', background: '#ecfdf5' }}>
                    <div>{r.totalCommission}</div>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 400 }}>Boxes</div>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                    <div style={{ color: '#16a34a' }}>{formatCurrency(r.totalReceived)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {r.paymentsCount} payment{r.paymentsCount === 1 ? '' : 's'}
                    </div>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: r.pendingGenerated > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {r.pendingGenerated > 0 ? '+' : ''}{formatCurrency(r.pendingGenerated)}
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
                      {r.salesCount > 0 && (
                        <span style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#dc2626', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                          {r.salesCount} Sales
                        </span>
                      )}
                      {r.paymentsCount > 0 && (
                        <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#16a34a', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                          {r.paymentsCount} Payments
                        </span>
                      )}
                      {r.expensesCount > 0 && (
                        <span style={{ fontSize: '0.75rem', background: '#fff7ed', color: '#c2410c', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                          {r.expensesCount} Exp
                        </span>
                      )}
                      {r.ordersCount > 0 && (
                        <span style={{ fontSize: '0.75rem', background: '#faf5ff', color: '#7e22ce', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                          {r.ordersCount} Orders
                        </span>
                      )}
                      {r.totalActivities === 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0</span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <Link
                      href={`/reports/${r.dateKey}`}
                      className="btn"
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.85rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      View All →
                    </Link>
                  </td>
                </tr>
              ))}

              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No daily reports generated yet.</div>
                    <div style={{ fontSize: '0.9rem' }}>Add sales, payments, or expenses to see detailed daily summaries here.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
