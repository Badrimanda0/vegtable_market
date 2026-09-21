'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

export default function CustomerList({ customers }: { customers: any[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else if (selectedCustomer) {
          setSelectedCustomer(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, selectedCustomer]);

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

  const filteredCustomers = customers.filter((c) => {
    const searchStr = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(searchStr) ||
      (c.phone && c.phone.toLowerCase().includes(searchStr))
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Combine and sort transactions for the selected customer
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
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
        />
      </div>

      <div className="table-responsive">
        <table className="mobile-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Pending Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((c: any) => (
              <tr 
                key={c.id} 
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                onClick={() => setSelectedCustomer(c)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--background)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td data-label="Name" style={{ padding: '1rem', fontWeight: 500 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(c);
                    }}
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
                  >
                    {c.name}
                  </button>
                  {c.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📞 {c.phone}</div>}
                </td>
                <td data-label="Pending Amount" style={{ padding: '1rem', color: c.pendingAmount > 0 ? 'var(--danger)' : c.pendingAmount < 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {c.pendingAmount < 0 ? `Advance: ${formatCurrency(Math.abs(c.pendingAmount))}` : formatCurrency(c.pendingAmount)}
                </td>
              </tr>
            ))}
            {paginatedCustomers.length === 0 && (
              <tr>
                <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
