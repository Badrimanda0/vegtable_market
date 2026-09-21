'use client';
import { useState, useMemo, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { recordQuickPayment } from '../actions';

export default function CustomerList({ customers: initialCustomers }: { customers: any[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Date filter state: 'all' | 'today' | 'custom'
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(getTodayDateStr());
  const [isPendingTransition, startTransition] = useTransition();

  // Quick payment modal state
  const [quickPayTarget, setQuickPayTarget] = useState<{ customer: any; defaultAmount: number } | null>(null);
  const [quickPayAmount, setQuickPayAmount] = useState<string>('');
  const [quickPayNote, setQuickPayNote] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Sync initialCustomers if prop updates
  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) setPreviewImage(null);
        else if (quickPayTarget) setQuickPayTarget(null);
        else if (selectedCustomer) setSelectedCustomer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, selectedCustomer, quickPayTarget]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateVal: string | Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateVal));
  };

  const formatDateKey = (dateVal: string | Date) => {
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const activeDateKey = useMemo(() => {
    if (dateFilterMode === 'all') return null;
    if (dateFilterMode === 'today') return getTodayDateStr();
    return customDate;
  }, [dateFilterMode, customDate]);

  // Calculate day-specific status and updated pending amount for each customer
  const processedCustomers = useMemo(() => {
    return customers.map((c) => {
      const sales = c.sales || [];
      const payments = c.payments || [];

      const totalSales = sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
      const totalPayments = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const pendingAmount = totalSales - totalPayments;

      // Filter for active date if applicable
      let daySales = 0;
      let dayPayments = 0;

      if (activeDateKey) {
        daySales = sales
          .filter((s: any) => formatDateKey(s.date) === activeDateKey)
          .reduce((sum: number, s: any) => sum + s.totalAmount, 0);

        dayPayments = payments
          .filter((p: any) => formatDateKey(p.date) === activeDateKey)
          .reduce((sum: number, p: any) => sum + p.amount, 0);
      }

      // Determine payment status
      let status: 'done' | 'pending' | 'partial' | 'advance' | 'no_activity' = 'done';
      let statusLabel = 'Payment Done';
      let statusColor = '#16a34a'; // green
      let statusBg = '#ecfdf5';

      if (activeDateKey) {
        if (daySales > 0) {
          if (dayPayments >= daySales) {
            status = 'done';
            statusLabel = 'Payment Done';
            statusColor = '#16a34a';
            statusBg = '#ecfdf5';
          } else if (dayPayments > 0) {
            status = 'partial';
            statusLabel = `Partial (${formatCurrency(dayPayments)} / ${formatCurrency(daySales)})`;
            statusColor = '#ea580c';
            statusBg = '#fff7ed';
          } else {
            status = 'pending';
            statusLabel = 'Pending';
            statusColor = '#dc2626';
            statusBg = '#fef2f2';
          }
        } else if (dayPayments > 0) {
          status = 'done';
          statusLabel = `Paid ${formatCurrency(dayPayments)}`;
          statusColor = '#16a34a';
          statusBg = '#ecfdf5';
        } else {
          // No activity on this date, reflect overall pending
          if (pendingAmount > 0) {
            status = 'pending';
            statusLabel = 'Pending Debt';
            statusColor = '#dc2626';
            statusBg = '#fef2f2';
          } else if (pendingAmount < 0) {
            status = 'advance';
            statusLabel = 'Advance Credit';
            statusColor = '#2563eb';
            statusBg = '#eff6ff';
          } else {
            status = 'done';
            statusLabel = 'All Cleared';
            statusColor = '#16a34a';
            statusBg = '#ecfdf5';
          }
        }
      } else {
        // All time
        if (pendingAmount > 0) {
          if (totalPayments > 0) {
            status = 'partial';
            statusLabel = 'Partial Pending';
            statusColor = '#ea580c';
            statusBg = '#fff7ed';
          } else {
            status = 'pending';
            statusLabel = 'Pending';
            statusColor = '#dc2626';
            statusBg = '#fef2f2';
          }
        } else if (pendingAmount < 0) {
          status = 'advance';
          statusLabel = 'Advance Credit';
          statusColor = '#2563eb';
          statusBg = '#eff6ff';
        } else {
          status = 'done';
          statusLabel = 'Payment Done';
          statusColor = '#16a34a';
          statusBg = '#ecfdf5';
        }
      }

      return {
        ...c,
        totalSales,
        totalPayments,
        pendingAmount,
        daySales,
        dayPayments,
        status,
        statusLabel,
        statusColor,
        statusBg
      };
    });
  }, [customers, activeDateKey]);

  const filteredCustomers = useMemo(() => {
    const searchStr = query.toLowerCase();
    return processedCustomers.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchStr) ||
        (c.phone && c.phone.toLowerCase().includes(searchStr))
      );
    });
  }, [processedCustomers, query]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Handle Quick Payment Execution
  const handleQuickPaymentSubmit = async (customerId: number, amountToPay: number, note?: string) => {
    if (amountToPay <= 0 || isNaN(amountToPay)) {
      alert('Please enter a valid payment amount greater than 0');
      return;
    }

    setIsSubmittingPayment(true);
    const dateToUse = activeDateKey ? new Date(`${activeDateKey}T12:00:00`) : new Date();

    try {
      // Optimistic update
      const newPayment = {
        id: Date.now(),
        customerId,
        amount: amountToPay,
        date: dateToUse,
        senderName: note || 'Quick Payment',
        receiptImage: null
      };

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customerId) {
            const updatedPayments = [...(c.payments || []), newPayment];
            return {
              ...c,
              payments: updatedPayments
            };
          }
          return c;
        })
      );

      // If ledger modal is open, update selected customer as well
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer((prev: any) => ({
          ...prev,
          payments: [...(prev.payments || []), newPayment]
        }));
      }

      // Backend Call
      startTransition(async () => {
        await recordQuickPayment(customerId, amountToPay, activeDateKey || undefined, note);
      });

      setQuickPayTarget(null);
      setQuickPayAmount('');
      setQuickPayNote('');
    } catch (err) {
      console.error('Payment submission failed:', err);
      alert('Failed to record payment. Please try again.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Combine and sort transactions for the selected customer in modal
  const transactions = useMemo(() => {
    if (!selectedCustomer) return [];
    const sales = (selectedCustomer.sales || []).map((s: any) => ({
      id: `sale-${s.id}`,
      rawId: s.id,
      type: 'sale',
      date: new Date(s.date),
      details: `${s.quantityKg} KG ${s.vegetable || 'Vegetables'} @ ₹${s.ratePerKg}`,
      amount: s.totalAmount,
      image: s.billImage,
      imageType: 'Bill Image'
    }));
    const payments = (selectedCustomer.payments || []).map((p: any) => ({
      id: `pay-${p.id}`,
      rawId: p.id,
      type: 'payment',
      date: new Date(p.date),
      details: p.senderName ? `Payment (From: ${p.senderName})` : 'Payment Received',
      amount: p.amount,
      image: p.receiptImage,
      imageType: 'Receipt Image'
    }));
    return [...sales, ...payments].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [selectedCustomer]);

  return (
    <div>
      {/* Date Filter & Search Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Day selection toolbar */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>
              📅 Daily Status Filter:
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--background)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setDateFilterMode('today')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: dateFilterMode === 'today' ? 'var(--primary)' : 'transparent',
                  color: dateFilterMode === 'today' ? 'white' : 'var(--foreground)'
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('all')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: dateFilterMode === 'all' ? 'var(--primary)' : 'transparent',
                  color: dateFilterMode === 'all' ? 'white' : 'var(--foreground)'
                }}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('custom')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: dateFilterMode === 'custom' ? 'var(--primary)' : 'transparent',
                  color: dateFilterMode === 'custom' ? 'white' : 'var(--foreground)'
                }}
              >
                Specific Day
              </button>
            </div>
          </div>

          {dateFilterMode === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date:</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          )}

          {activeDateKey && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Viewing Date: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{activeDateKey}</span>
            </div>
          )}
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by customer name or phone..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Customers Table */}
      <div className="table-responsive">
        <table className="mobile-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Pending Amount</th>
              <th style={{ padding: '1rem' }}>Payment Status & Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((c: any) => {
              const pendingToSettle = c.pendingAmount > 0 ? c.pendingAmount : (c.daySales > 0 ? c.daySales - c.dayPayments : 0);

              return (
                <tr 
                  key={c.id} 
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }}
                  className="hover-row"
                >
                  {/* Name column */}
                  <td data-label="Name" style={{ padding: '1rem', fontWeight: 500 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        textAlign: 'left',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                      title="Click to view complete ledger"
                    >
                      {c.name}
                    </button>
                    {c.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📞 {c.phone}</div>}
                  </td>

                  {/* Pending Amount column */}
                  <td data-label="Pending Amount" style={{ padding: '1rem', color: c.pendingAmount > 0 ? 'var(--danger)' : c.pendingAmount < 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {c.pendingAmount < 0 
                      ? `Advance: ${formatCurrency(Math.abs(c.pendingAmount))}` 
                      : formatCurrency(c.pendingAmount)}
                  </td>

                  {/* Payment Status & Action column */}
                  <td data-label="Payment Status" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {/* Status Badge */}
                      <span
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: c.statusBg,
                          color: c.statusColor,
                          border: `1px solid ${c.statusColor}30`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {c.status === 'done' && '✓'}
                        {c.status === 'pending' && '⏳'}
                        {c.status === 'partial' && '⚡'}
                        {c.status === 'advance' && '★'}
                        {c.statusLabel}
                      </span>

                      {/* Quick Payment Options Button / Dropdown */}
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {pendingToSettle > 0 ? (
                          <button
                            type="button"
                            className="btn"
                            style={{
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.78rem',
                              background: '#16a34a',
                              color: 'white',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickPaymentSubmit(c.id, pendingToSettle, `Full payment settled (${activeDateKey || 'all time'})`);
                            }}
                            title={`Click to mark full payment done (${formatCurrency(pendingToSettle)})`}
                          >
                            ✓ Pay Full ({formatCurrency(pendingToSettle)})
                          </button>
                        ) : null}

                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.78rem',
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickPayTarget({ customer: c, defaultAmount: pendingToSettle > 0 ? pendingToSettle : 0 });
                            setQuickPayAmount(pendingToSettle > 0 ? String(pendingToSettle) : '');
                          }}
                          title="Give specific amount or record partial payment"
                        >
                          + Give Money
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedCustomers.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button 
            className="btn" 
            style={{ background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)', opacity: page === 1 ? 0.5 : 1 }}
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
          <button 
            className="btn" 
            style={{ background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)', opacity: page === totalPages ? 0.5 : 1 }}
            disabled={page === totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Quick Pay Modal */}
      {quickPayTarget && (
        <div
          onClick={() => setQuickPayTarget(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                Record Payment for {quickPayTarget.customer.name}
              </h3>
              <button
                onClick={() => setQuickPayTarget(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Current Total Debt: <strong style={{ color: 'var(--danger)' }}>{formatCurrency(quickPayTarget.customer.pendingAmount || 0)}</strong>
              {activeDateKey && (
                <div style={{ marginTop: '0.25rem' }}>
                  Recording payment for date: <strong>{activeDateKey}</strong>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuickPaymentSubmit(
                  quickPayTarget.customer.id,
                  parseFloat(quickPayAmount),
                  quickPayNote || `Payment on ${activeDateKey || 'today'}`
                );
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder="Enter amount given..."
                  value={quickPayAmount}
                  onChange={(e) => setQuickPayAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Note / Sender Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cash / UPI / GPay"
                  value={quickPayNote}
                  onChange={(e) => setQuickPayNote(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--border)', color: 'var(--foreground)' }}
                  onClick={() => setQuickPayTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={isSubmittingPayment}
                  style={{ background: '#16a34a', color: 'white' }}
                >
                  {isSubmittingPayment ? 'Saving...' : '✓ Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Ledger Modal / Popup */}
      {selectedCustomer && (
        <div
          onClick={() => setSelectedCustomer(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--background)'
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--foreground)' }}>
                  {selectedCustomer.name}'s Ledger
                </h2>
                {selectedCustomer.phone && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Phone: {selectedCustomer.phone}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    background: '#16a34a',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => {
                    const cust = selectedCustomer;
                    const pending = cust.pendingAmount > 0 ? cust.pendingAmount : 0;
                    setQuickPayTarget({ customer: cust, defaultAmount: pending });
                    setQuickPayAmount(pending > 0 ? String(pending) : '');
                  }}
                >
                  + Add Payment
                </button>

                <Link
                  href={`/customers/${selectedCustomer.id}`}
                  className="btn"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  Full Page ↗
                </Link>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    lineHeight: '1',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.25rem 0.5rem'
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Summary Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div className="card" style={{ padding: '1rem' }}>
                  <div className="stat-label" style={{ fontSize: '0.8rem' }}>Total Purchased</div>
                  <div className="stat-value" style={{ fontSize: '1.35rem', color: 'var(--foreground)' }}>
                    {formatCurrency(selectedCustomer.totalSales || 0)}
                  </div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                  <div className="stat-label" style={{ fontSize: '0.8rem' }}>Total Paid</div>
                  <div className="stat-value" style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>
                    {formatCurrency(selectedCustomer.totalPayments || 0)}
                  </div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                  <div className="stat-label" style={{ fontSize: '0.8rem' }}>
                    {selectedCustomer.pendingAmount < 0 ? 'Total Advance (We Owe)' : 'Remaining Balance'}
                  </div>
                  <div
                    className="stat-value"
                    style={{
                      fontSize: '1.35rem',
                      color: selectedCustomer.pendingAmount > 0 ? 'var(--danger)' : selectedCustomer.pendingAmount < 0 ? 'var(--success)' : 'var(--foreground)'
                    }}
                  >
                    {selectedCustomer.pendingAmount < 0 
                      ? formatCurrency(Math.abs(selectedCustomer.pendingAmount)) 
                      : formatCurrency(selectedCustomer.pendingAmount || 0)}
                  </div>
                </div>
              </div>

              {/* Transactions History */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}
                >
                  Transaction History ({transactions.length})
                </div>

                <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', textAlign: 'left', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Details</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            {formatDate(t.date)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {t.type === 'sale' ? (
                              <span style={{ padding: '0.2rem 0.55rem', background: '#fef2f2', color: 'var(--danger)', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                Sale
                              </span>
                            ) : (
                              <span style={{ padding: '0.2rem 0.55rem', background: '#ecfdf5', color: 'var(--success)', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                Payment
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div>{t.details}</div>
                            {t.image && (
                              <div style={{ marginTop: '0.25rem' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage(t.image);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.8rem',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                >
                                  📷 View {t.imageType}
                                </button>
                              </div>
                            )}
                          </td>
                          <td
                            style={{
                              padding: '0.75rem 1rem',
                              textAlign: 'right',
                              fontWeight: 600,
                              color: t.type === 'sale' ? 'var(--danger)' : 'var(--success)'
                            }}
                          >
                            {t.type === 'sale' ? `+${formatCurrency(t.amount)}` : `-${formatCurrency(t.amount)}`}
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No transaction history available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '0.75rem 1.5rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--background)',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                className="btn"
                style={{ background: 'var(--foreground)', color: 'var(--background)' }}
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              padding: '1rem',
              borderRadius: 'var(--radius)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreviewImage(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕ Close
              </button>
            </div>
            <img
              src={previewImage}
              alt="Receipt or Bill"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-sm)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
