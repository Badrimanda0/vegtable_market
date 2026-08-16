'use client';
import { useState } from 'react';
import Link from 'next/link';
import DeleteButton from '../delete-button';
import { deleteCustomer } from '../actions';

export default function CustomerList({ customers }: { customers: any[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
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
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem' }}>Pending Amount</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td data-label="Name" style={{ padding: '1rem', fontWeight: 500 }}>
                  <Link href={`/customers/${c.id}`} style={{ color: 'var(--primary)' }}>{c.name}</Link>
                </td>
                <td data-label="Phone" style={{ padding: '1rem' }}>{c.phone || '-'}</td>
                <td data-label="Pending Amount" style={{ padding: '1rem', color: c.pendingAmount > 0 ? 'var(--danger)' : c.pendingAmount < 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {c.pendingAmount < 0 ? `Advance: ${formatCurrency(Math.abs(c.pendingAmount))}` : formatCurrency(c.pendingAmount)}
                </td>
                <td data-label="Actions" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/customers/${c.id}`} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Ledger</Link>
                    <Link href={`/customers/${c.id}/edit`} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--foreground)' }}>Edit</Link>
                    <DeleteButton action={deleteCustomer.bind(null, c.id)} itemType="Customer" />
                  </div>
                </td>
              </tr>
            ))}
            {paginatedCustomers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td>
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
    </div>
  );
}
