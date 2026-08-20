'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DeleteButton from '../../delete-button';
import { deleteSale } from '../../actions';

type SaleWithCustomer = {
  id: number;
  customerId: number;
  vegetable: string;
  quantityKg: number;
  ratePerKg: number;
  totalAmount: number;
  commission: number;
  date: Date | string;
  billImage: string | null;
  customer: {
    id: number;
    name: string;
    phone: string | null;
    shopName: string | null;
  };
};

export default function SalesList({ sales }: { sales: SaleWithCustomer[] }) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageByDate, setPageByDate] = useState<Record<string, number>>({});
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTitle = (dateVal: string | Date) => {
    const d = new Date(dateVal);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const formatted = new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);

    if (isToday) return `Today - ${formatted}`;
    if (isYesterday) return `Yesterday - ${formatted}`;
    return formatted;
  };

  const formatTime = (dateVal: string | Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(dateVal));
  };

  const getDateKey = (dateVal: string | Date) => {
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Group sales by Day
  const groupedSales = useMemo(() => {
    const groups: Record<string, { dateObj: Date; dateTitle: string; items: SaleWithCustomer[]; totalAmount: number; totalKg: number; totalBoxes: number }> = {};

    sales.forEach(sale => {
      const key = getDateKey(sale.date);
      if (!groups[key]) {
        groups[key] = {
          dateObj: new Date(sale.date),
          dateTitle: formatDateTitle(sale.date),
          items: [],
          totalAmount: 0,
          totalKg: 0,
          totalBoxes: 0
        };
      }
      groups[key].items.push(sale);
      groups[key].totalAmount += sale.totalAmount;
      groups[key].totalKg += sale.quantityKg;
      groups[key].totalBoxes += (sale.commission || 0);
    });

    return groups;
  }, [sales]);

  // Sorted date keys
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedSales).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedSales]);

  // Check if a sale item matches the search query
  const itemMatchesSearch = (item: SaleWithCustomer, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const customerName = (item.customer?.name || '').toLowerCase();
    const shopName = (item.customer?.shopName || '').toLowerCase();
    const vegetable = (item.vegetable || '').toLowerCase();
    const amount = (item.totalAmount || 0).toString();
    const rate = (item.ratePerKg || 0).toString();
    const qty = (item.quantityKg || 0).toString();
    const boxes = (item.commission || 0).toString();
    const time = formatTime(item.date).toLowerCase();
    const dateTitle = formatDateTitle(item.date).toLowerCase();

    return (
      customerName.includes(q) ||
      shopName.includes(q) ||
      vegetable.includes(q) ||
      amount.includes(q) ||
      rate.includes(q) ||
      qty.includes(q) ||
      boxes.includes(q) ||
      time.includes(q) ||
      dateTitle.includes(q)
    );
  };

  // Filter groups
  const filteredDateKeys = useMemo(() => {
    return sortedDateKeys.filter(key => {
      if (selectedDateKey !== 'all' && key !== selectedDateKey) {
        return false;
      }
      if (!searchTerm.trim()) return true;

      const group = groupedSales[key];
      return group.items.some(item => itemMatchesSearch(item, searchTerm));
    });
  }, [sortedDateKeys, selectedDateKey, searchTerm, groupedSales]);

  const toggleCollapse = (key: string) => {
    setCollapsedDates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getPage = (key: string) => pageByDate[key] || 1;
  const setPage = (key: string, page: number) => {
    setPageByDate(prev => ({
      ...prev,
      [key]: page
    }));
  };

  // Overall summary for the filtered view
  const overallSummary = useMemo(() => {
    let count = 0;
    let totalAmt = 0;
    let totalKg = 0;
    let totalBoxes = 0;

    filteredDateKeys.forEach(key => {
      const group = groupedSales[key];
      const items = searchTerm.trim()
        ? group.items.filter(item => itemMatchesSearch(item, searchTerm))
        : group.items;

      count += items.length;
      items.forEach(i => {
        totalAmt += i.totalAmount;
        totalKg += i.quantityKg;
        totalBoxes += (i.commission || 0);
      });
    });

    return { count, totalAmt, totalKg, totalBoxes };
  }, [filteredDateKeys, groupedSales, searchTerm]);

  return (
    <div style={{ marginTop: '2.5rem' }}>
      {/* Control Panel: Date Dropdown, Search, and Page Size */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
              Sales History
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Select a date or use pagination to easily browse daily sales records
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: 'var(--background)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sales: </span>
              <strong>{overallSummary.count}</strong>
            </div>
            <div style={{ background: '#ecfdf5', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid #bbf7d0', fontSize: '0.85rem', color: '#15803d' }}>
              <span>Total: </span>
              <strong>{formatCurrency(overallSummary.totalAmt)}</strong>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Date Selector Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              📅 Select Date:
            </label>
            <select
              value={selectedDateKey}
              onChange={(e) => {
                setSelectedDateKey(e.target.value);
                setPageByDate({});
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              <option value="all">📁 All Dates ({sales.length} total sales)</option>
              {sortedDateKeys.map(key => {
                const grp = groupedSales[key];
                return (
                  <option key={key} value={key}>
                    📅 {grp.dateTitle} ({grp.items.length} sales - {formatCurrency(grp.totalAmount)})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              🔍 Search Sale:
            </label>
            <input
              type="text"
              placeholder="Search customer, vegetable, ₹ amount..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageByDate({});
              }}
              className="input"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Rows Per Page */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              📄 Rows Per Page:
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageByDate({});
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                fontSize: '0.9rem'
              }}
            >
              <option value={10}>10 items per page</option>
              <option value={20}>20 items per page</option>
              <option value={50}>50 items per page</option>
              <option value={100}>100 items per page</option>
              <option value={999999}>Show All items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daily Sales List */}
      {filteredDateKeys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No sales found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {searchTerm || selectedDateKey !== 'all' 
              ? 'No sales match the selected date or search term. Try resetting your filters.' 
              : 'Record your first sale using the form above!'}
          </p>
          {(searchTerm || selectedDateKey !== 'all') && (
            <button
              onClick={() => {
                setSelectedDateKey('all');
                setSearchTerm('');
              }}
              className="btn"
              style={{ marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredDateKeys.map(key => {
            const group = groupedSales[key];
            const isCollapsed = !!collapsedDates[key];

            // Filter items in this group
            const allItemsForDate = searchTerm.trim()
              ? group.items.filter(item => itemMatchesSearch(item, searchTerm))
              : group.items;

            // Pagination calculation
            const totalItems = allItemsForDate.length;
            const totalPages = Math.ceil(totalItems / pageSize) || 1;
            const currentPage = Math.min(Math.max(getPage(key), 1), totalPages);
            const startIndex = (currentPage - 1) * pageSize;
            const paginatedItems = allItemsForDate.slice(startIndex, startIndex + pageSize);

            return (
              <div key={key} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {/* Day Header with Toggle & Summary */}
                <div
                  onClick={() => toggleCollapse(key)}
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--background)',
                    borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--foreground)' }}>
                      📅 {group.dateTitle}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)'
                    }}>
                      {totalItems} {totalItems === 1 ? 'sale' : 'sales'}
                    </span>
                  </div>

                  {/* Day Totals */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      KG: <strong style={{ color: 'var(--foreground)' }}>{group.totalKg.toFixed(1)}</strong>
                    </div>
                    {group.totalBoxes > 0 && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Boxes: <strong style={{ color: 'var(--foreground)' }}>{group.totalBoxes}</strong>
                      </div>
                    )}
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#15803d',
                      background: '#ecfdf5',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid #bbf7d0'
                    }}>
                      Day Total: {formatCurrency(group.totalAmount)}
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <>
                    {/* Sales Table */}
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>#</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Vegetable</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Quantity</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rate (₹)</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Amount</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Boxes</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Bill Image</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedItems.map((sale, idx) => (
                            <tr key={`sale-${sale.id}`} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' }}>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                {startIndex + idx + 1}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                                <Link href={`/customers/${sale.customerId}`} style={{ color: 'var(--primary)', textDecoration: 'none' }} className="hover:underline">
                                  {sale.customer.name}
                                </Link>
                                {sale.customer.shopName && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                    {sale.customer.shopName}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{
                                  padding: '0.2rem 0.6rem',
                                  background: '#eff6ff',
                                  color: '#1e40af',
                                  borderRadius: '0.5rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  display: 'inline-block'
                                }}>
                                  {sale.vegetable}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 500 }}>
                                {sale.quantityKg} KG
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                                ₹{sale.ratePerKg}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem' }}>
                                {formatCurrency(sale.totalAmount)}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                {sale.commission > 0 ? (
                                  <span style={{ fontWeight: 600, background: '#f3f4f6', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                    {sale.commission}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>-</span>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {formatTime(sale.date)}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                {sale.billImage ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedImage(sale.billImage)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      color: 'var(--primary)',
                                      fontSize: '0.8rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    📷 View
                                  </button>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                  <Link
                                    href={`/sales/${sale.id}/edit`}
                                    className="btn"
                                    style={{
                                      padding: '0.3rem 0.65rem',
                                      fontSize: '0.75rem',
                                      background: 'var(--foreground)',
                                      color: 'white',
                                      borderRadius: 'var(--radius)'
                                    }}
                                  >
                                    Edit
                                  </Link>
                                  <DeleteButton
                                    action={deleteSale.bind(null, sale.id, sale.customerId)}
                                    itemType="Sale"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                      <div style={{
                        padding: '0.85rem 1.25rem',
                        background: 'var(--surface)',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Showing <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> sales
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button
                            onClick={() => setPage(key, 1)}
                            disabled={currentPage === 1}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.8rem',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              background: currentPage === 1 ? 'var(--background)' : 'var(--surface)',
                              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--foreground)'
                            }}
                          >
                            «
                          </button>

                          <button
                            onClick={() => setPage(key, currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.8rem',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              background: currentPage === 1 ? 'var(--background)' : 'var(--surface)',
                              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--foreground)'
                            }}
                          >
                            ‹ Prev
                          </button>

                          <span style={{ fontSize: '0.85rem', padding: '0 0.5rem', fontWeight: 600 }}>
                            Page {currentPage} of {totalPages}
                          </span>

                          <button
                            onClick={() => setPage(key, currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.8rem',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              background: currentPage === totalPages ? 'var(--background)' : 'var(--surface)',
                              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--foreground)'
                            }}
                          >
                            Next ›
                          </button>

                          <button
                            onClick={() => setPage(key, totalPages)}
                            disabled={currentPage === totalPages}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.8rem',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              background: currentPage === totalPages ? 'var(--background)' : 'var(--surface)',
                              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--foreground)'
                            }}
                          >
                            »
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bill Image Lightbox / Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sale Bill Image</h3>
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: '0.25rem 0.5rem'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ maxHeight: '70vh', overflow: 'auto', textAlign: 'center' }}>
              <img
                src={selectedImage}
                alt="Sale Bill Preview"
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedImage(null)}
                className="btn"
                style={{ padding: '0.5rem 1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
