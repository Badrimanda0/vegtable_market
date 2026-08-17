'use client';

import { useState } from 'react';
import { createCompanyFund, createExpense } from './actions';

export default function ExpenseActions() {
  const [isAddingFund, setIsAddingFund] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsSubmitting(true);
    await createCompanyFund({ amount: parseFloat(amount), description });
    setIsSubmitting(false);
    setIsAddingFund(false);
    setAmount('');
    setDescription('');
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsSubmitting(true);
    await createExpense({ amount: parseFloat(amount), description });
    setIsSubmitting(false);
    setIsAddingExpense(false);
    setAmount('');
    setDescription('');
  };

  if (isAddingFund) {
    return (
      <form onSubmit={handleSubmitFund} className="card" style={{ marginTop: '1rem', background: 'var(--background)' }}>
        <h4 style={{ marginBottom: '1rem' }}>Add Company Fund</h4>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" />
        </div>
        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <input type="text" className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Fund'}</button>
          <button type="button" className="btn" style={{ background: 'var(--border)', color: 'var(--foreground)' }} onClick={() => setIsAddingFund(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  if (isAddingExpense) {
    return (
      <form onSubmit={handleSubmitExpense} className="card" style={{ marginTop: '1rem', background: 'var(--background)' }}>
        <h4 style={{ marginBottom: '1rem' }}>Add Expense</h4>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" />
        </div>
        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <input type="text" className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" className="btn" disabled={isSubmitting} style={{ background: 'var(--danger)' }}>{isSubmitting ? 'Saving...' : 'Save Expense'}</button>
          <button type="button" className="btn" style={{ background: 'var(--border)', color: 'var(--foreground)' }} onClick={() => setIsAddingExpense(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
      <button className="btn" onClick={() => setIsAddingFund(true)} style={{ flex: 1 }}>+ Add Fund</button>
      <button className="btn" onClick={() => setIsAddingExpense(true)} style={{ flex: 1, background: 'var(--danger)', color: 'white' }}>- Add Expense</button>
    </div>
  );
}
