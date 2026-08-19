'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeleteButton from '../../delete-button';
import { 
  deleteSale, 
  deletePayment, 
  deleteExpense, 
  deleteCompanyFund, 
  deleteOrder, 
  deleteOrder1 
} from '../../actions';

type DailyActivitiesClientProps = {
  data: {
    date: Date;
    dateKey: string;
    summary: {
      totalSales: number;
      salesCount: number;
      totalBoxes: number;
      totalReceived: number;
      paymentsCount: number;
      totalExpenses: number;
      expensesCount: number;
      totalFunds: number;
      fundsCount: number;
      totalOrders: number;
      ordersCount: number;
      order1sCount: number;
      totalOrder1Boxes: number;
      totalActivities: number;
      pendingGenerated: number;
      netCashFlow: number;
    };
    sales: any[];
    payments: any[];
    expenses: any[];
    companyFunds: any[];
    orders: any[];
    order1s: any[];
    timeline: any[];
  };
};

export default function DailyActivitiesClient({ data }: DailyActivitiesClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'payments' | 'expenses' | 'orders'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateFull = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return new Intl.DateTimeFormat('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(d);
  };

  const { summary, sales, payments, expenses, companyFunds, orders, order1s, timeline } = data;

  // Filter timeline based on search query
  const filteredTimeline = timeline.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.badge?.toLowerCase().includes(q) ||
      (item.amount && item.amount.toString().includes(q))
    );
  });

  const filteredSales = sales.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.customer?.name?.toLowerCase().includes(q) ||
      s.vegetable?.toLowerCase().includes(q) ||
      s.totalAmount?.toString().includes(q)
    );
  });

  const filteredPayments = payments.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.customer?.name?.toLowerCase().includes(q) ||
      p.senderName?.toLowerCase().includes(q) ||
      p.amount?.toString().includes(q)
    );
  });

  const filteredExpenses = expenses.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.description?.toLowerCase().includes(q) ||
      e.amount?.toString().includes(q)
    );
  });

  const filteredFunds = companyFunds.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.description?.toLowerCase().includes(q) ||
      f.amount?.toString().includes(q)
    );
  });

  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.shopName?.toLowerCase().includes(q) ||
      o.itemName?.toLowerCase().includes(q) ||
      o.amount?.toString().includes(q)
    );
  });

  const filteredOrder1s = order1s.filter(o1 => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o1.vegetableOption?.toLowerCase().includes(q) ||
      o1.numberOfVegetables?.toString().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header with Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link 
            href="/reports" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'var(--primary)', 
              fontWeight: 500, 
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              textDecoration: 'none'
            }}
          >
            ← Back to Daily Reports
          </Link>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            Activity Report: {formatDateFull(data.date)}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete audit trail of all transactions, payments, boxes, orders, and expenses recorded on this day.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/sales/new" className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}>
            + Add Sale
          </Link>
          <Link href="/payments/new" className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', background: '#16a34a' }}>
            + Receive Payment
          </Link>
          <Link href="/expenses" className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', background: 'var(--foreground)' }}>
            + Add Expense
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
          <div className="stat-label">Total Sales</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>
            {formatCurrency(summary.totalSales)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{summary.salesCount} sale transaction{summary.salesCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #059669', background: '#f0fdf4' }}>
          <div className="stat-label" style={{ color: '#047857' }}>Total Boxes (Commission)</div>
          <div className="stat-value" style={{ color: '#047857' }}>
            {summary.totalBoxes} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Boxes</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#065f46', marginTop: '0.25rem' }}>
            From sales commission
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="stat-label">Payments Received</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>
            {formatCurrency(summary.totalReceived)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {summary.paymentsCount} payment transaction{summary.paymentsCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ea580c' }}>
          <div className="stat-label">Expenses Incurred</div>
          <div className="stat-value" style={{ color: '#ea580c' }}>
            {formatCurrency(summary.totalExpenses)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {summary.expensesCount} expense record{summary.expensesCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-label">Company Funds Deposited</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>
            {formatCurrency(summary.totalFunds)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {summary.fundsCount} fund deposit{summary.fundsCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div className="stat-label">Orders & Daily Items</div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>
            {formatCurrency(summary.totalOrders)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {summary.ordersCount} Order(s) • {summary.order1sCount} Daily Item(s)
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--foreground)' }}>
          <div className="stat-label">Day Net Pending Generated</div>
          <div className="stat-value" style={{ color: summary.pendingGenerated > 0 ? 'var(--danger)' : '#16a34a' }}>
            {summary.pendingGenerated > 0 ? '+' : ''}{formatCurrency(summary.pendingGenerated)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Sales ({formatCurrency(summary.totalSales)}) - Paid ({formatCurrency(summary.totalReceived)})
          </div>
        </div>
      </div>

      {/* Activities Section with Tabbed Filter & Search */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === 'all' ? 'var(--primary)' : 'var(--border)',
                  background: activeTab === 'all' ? 'var(--primary)' : 'var(--surface)',
                  color: activeTab === 'all' ? 'white' : 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                All Activities ({summary.totalActivities})
              </button>

              <button
                onClick={() => setActiveTab('sales')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === 'sales' ? '#dc2626' : 'var(--border)',
                  background: activeTab === 'sales' ? '#dc2626' : 'var(--surface)',
                  color: activeTab === 'sales' ? 'white' : 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Sales ({summary.salesCount})
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === 'payments' ? '#16a34a' : 'var(--border)',
                  background: activeTab === 'payments' ? '#16a34a' : 'var(--surface)',
                  color: activeTab === 'payments' ? 'white' : 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Payments ({summary.paymentsCount})
              </button>

              <button
                onClick={() => setActiveTab('expenses')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === 'expenses' ? '#ea580c' : 'var(--border)',
                  background: activeTab === 'expenses' ? '#ea580c' : 'var(--surface)',
                  color: activeTab === 'expenses' ? 'white' : 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Expenses & Funds ({summary.expensesCount + summary.fundsCount})
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === 'orders' ? '#7c3aed' : 'var(--border)',
                  background: activeTab === 'orders' ? '#7c3aed' : 'var(--surface)',
                  color: activeTab === 'orders' ? 'white' : 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Orders ({summary.ordersCount + summary.order1sCount})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              />
            </div>
          </div>
        </div>

        {/* Tab 1: All Activities (Chronological Feed) */}
        {activeTab === 'all' && (
          <div>
            {filteredTimeline.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No activities found matching your filter on this day.
              </div>
            ) : (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '1rem', width: '110px' }}>Time</th>
                      <th style={{ padding: '1rem', width: '120px' }}>Type</th>
                      <th style={{ padding: '1rem' }}>Activity Details</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'center', width: '140px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimeline.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                          ⏰ {formatTime(item.date)}
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <span 
                            style={{ 
                              padding: '0.25rem 0.65rem', 
                              background: item.badgeBg, 
                              color: item.badgeColor, 
                              borderRadius: '1rem', 
                              fontSize: '0.8rem', 
                              fontWeight: 700 
                            }}
                          >
                            {item.badge}
                          </span>
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.95rem' }}>
                            {item.type === 'sale' && item.details?.customer?.id ? (
                              <Link 
                                href={`/customers/${item.details.customer.id}`} 
                                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                              >
                                {item.title}
                              </Link>
                            ) : item.type === 'payment' && item.details?.customer?.id ? (
                              <Link 
                                href={`/customers/${item.details.customer.id}`} 
                                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                              >
                                {item.title}
                              </Link>
                            ) : (
                              item.title
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {item.subtitle}
                          </div>
                          {item.type === 'sale' && item.details?.billImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(item.details.billImage)}
                              style={{ 
                                marginTop: '0.35rem', 
                                fontSize: '0.8rem', 
                                color: 'var(--primary)', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                textDecoration: 'underline',
                                padding: 0
                              }}
                            >
                              📸 View Bill Image
                            </button>
                          )}
                          {item.type === 'payment' && item.details?.receiptImage && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(item.details.receiptImage)}
                              style={{ 
                                marginTop: '0.35rem', 
                                fontSize: '0.8rem', 
                                color: 'var(--primary)', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                textDecoration: 'underline',
                                padding: 0
                              }}
                            >
                              🧾 View Payment Receipt
                            </button>
                          )}
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, fontSize: '1rem' }}>
                          {item.amount != null ? (
                            <span style={{ color: item.type === 'sale' ? '#dc2626' : item.type === 'payment' ? '#16a34a' : item.type === 'expense' ? '#ea580c' : item.type === 'fund' ? '#2563eb' : 'var(--foreground)' }}>
                              {item.type === 'sale' ? '+' : item.type === 'payment' ? '-' : ''}{formatCurrency(item.amount)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                          )}
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            {item.type === 'sale' && (
                              <>
                                <Link 
                                  href={`/sales/${item.details.id}/edit`} 
                                  className="btn" 
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--foreground)' }}
                                >
                                  Edit
                                </Link>
                                <DeleteButton 
                                  action={deleteSale.bind(null, item.details.id, item.details.customerId)} 
                                  itemType="Sale" 
                                />
                              </>
                            )}
                            {item.type === 'payment' && (
                              <>
                                <Link 
                                  href={`/payments/${item.details.id}/edit`} 
                                  className="btn" 
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--foreground)' }}
                                >
                                  Edit
                                </Link>
                                <DeleteButton 
                                  action={deletePayment.bind(null, item.details.id, item.details.customerId)} 
                                  itemType="Payment" 
                                />
                              </>
                            )}
                            {item.type === 'expense' && (
                              <DeleteButton 
                                action={deleteExpense.bind(null, item.details.id)} 
                                itemType="Expense" 
                              />
                            )}
                            {item.type === 'fund' && (
                              <DeleteButton 
                                action={deleteCompanyFund.bind(null, item.details.id)} 
                                itemType="Fund" 
                              />
                            )}
                            {item.type === 'order' && (
                              <DeleteButton 
                                action={deleteOrder.bind(null, item.details.id)} 
                                itemType="Order" 
                              />
                            )}
                            {item.type === 'order1' && (
                              <DeleteButton 
                                action={deleteOrder1.bind(null, item.details.id)} 
                                itemType="Daily Item" 
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sales */}
        {activeTab === 'sales' && (
          <div className="table-responsive">
            {filteredSales.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No sales recorded for this date.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Time</th>
                    <th style={{ padding: '1rem' }}>Customer</th>
                    <th style={{ padding: '1rem' }}>Vegetable / Item</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Rate / KG</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#047857' }}>Boxes</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Total Amount</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Bill Image</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {formatTime(s.date)}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        <Link href={`/customers/${s.customerId}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                          {s.customer?.name || `Customer #${s.customerId}`}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{s.vegetable}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{s.quantityKg} KG</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>₹{s.ratePerKg}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#047857', background: '#ecfdf5' }}>
                        {s.commission || 0}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                        {formatCurrency(s.totalAmount)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {s.billImage ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(s.billImage)}
                            style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            📸 View
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <Link href={`/sales/${s.id}/edit`} className="btn" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--foreground)' }}>
                            Edit
                          </Link>
                          <DeleteButton action={deleteSale.bind(null, s.id, s.customerId)} itemType="Sale" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Payments */}
        {activeTab === 'payments' && (
          <div className="table-responsive">
            {filteredPayments.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No payments received on this date.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Time</th>
                    <th style={{ padding: '1rem' }}>Customer</th>
                    <th style={{ padding: '1rem' }}>Sender Name / Mode</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Amount Paid</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Receipt</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {formatTime(p.date)}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        <Link href={`/customers/${p.customerId}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                          {p.customer?.name || `Customer #${p.customerId}`}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                        {p.senderName || 'Direct / Cash'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {p.receiptImage ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(p.receiptImage)}
                            style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            🧾 View
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <Link href={`/payments/${p.id}/edit`} className="btn" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--foreground)' }}>
                            Edit
                          </Link>
                          <DeleteButton action={deletePayment.bind(null, p.id, p.customerId)} itemType="Payment" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 4: Expenses & Funds */}
        {activeTab === 'expenses' && (
          <div style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>
              Expenses ({filteredExpenses.length})
            </h3>
            {filteredExpenses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>No expenses recorded for this date.</p>
            ) : (
              <div className="table-responsive" style={{ marginBottom: '2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((e) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatTime(e.date)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{e.description || 'General Expense'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#ea580c' }}>{formatCurrency(e.amount)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <DeleteButton action={deleteExpense.bind(null, e.id)} itemType="Expense" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>
              Company Funds Injected ({filteredFunds.length})
            </h3>
            {filteredFunds.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No company fund deposits for this date.</p>
            ) : (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFunds.map((f) => (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatTime(f.date)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{f.description || 'Company Fund'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{formatCurrency(f.amount)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <DeleteButton action={deleteCompanyFund.bind(null, f.id)} itemType="Fund" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Orders */}
        {activeTab === 'orders' && (
          <div style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>
              Orders ({filteredOrders.length})
            </h3>
            {filteredOrders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>No orders recorded for this date.</p>
            ) : (
              <div className="table-responsive" style={{ marginBottom: '2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Shop Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Item Name</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatTime(o.date)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{o.shopName}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{o.itemName}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{o.quantity}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(o.amount)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <DeleteButton action={deleteOrder.bind(null, o.id)} itemType="Order" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>
              Daily Items (Order 1: {filteredOrder1s.length})
            </h3>
            {filteredOrder1s.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No daily items recorded for this date.</p>
            ) : (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Vegetable Option</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Boxes / Count</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrder1s.map((o1) => (
                      <tr key={o1.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatTime(o1.date)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{o1.vegetableOption}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#0891b2' }}>{o1.numberOfVegetables} Boxes</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <DeleteButton action={deleteOrder1.bind(null, o1.id)} itemType="Daily Item" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal Lightbox */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'white',
              borderRadius: '8px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 600 }}>Image Preview</span>
              <button 
                onClick={() => setPreviewImage(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.5rem' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1rem', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <img 
                src={previewImage} 
                alt="Document preview" 
                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '4px' }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
