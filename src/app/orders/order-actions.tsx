'use client';

import { useState } from 'react';
import { createOrder } from '../actions';

export default function OrderActions() {
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [shopName, setShopName] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !itemName || !amount) return;
    setIsSubmitting(true);
    await createOrder({
      shopName,
      itemName,
      quantity: parseFloat(quantity) || 1,
      amount: parseFloat(amount)
    });
    setIsSubmitting(false);
    setIsAddingOrder(false);
    setShopName('');
    setItemName('');
    setQuantity('');
    setAmount('');
  };

  if (isAddingOrder) {
    return (
      <form onSubmit={handleSubmit} className="card" style={{ marginTop: '1rem', background: 'var(--background)' }}>
        <h4 style={{ marginBottom: '1rem' }}>Add New Order</h4>
        <div className="form-group">
          <label className="form-label">Shop Name</label>
          <input type="text" className="form-control" value={shopName} onChange={e => setShopName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Item Name</label>
          <input type="text" className="form-control" value={itemName} onChange={e => setItemName(e.target.value)} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input type="number" className="form-control" value={quantity} onChange={e => setQuantity(e.target.value)} min="0.01" step="0.01" />
          </div>
          <div className="form-group">
            <label className="form-label">Total Amount (₹)</label>
            <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" className="btn" disabled={isSubmitting} style={{ background: 'var(--success)' }}>{isSubmitting ? 'Saving...' : 'Save Order'}</button>
          <button type="button" className="btn" style={{ background: 'var(--border)', color: 'var(--foreground)' }} onClick={() => setIsAddingOrder(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div style={{ display: 'flex', marginTop: '1.5rem' }}>
      <button className="btn" onClick={() => setIsAddingOrder(true)} style={{ flex: 1, background: 'var(--success)', color: 'white' }}>+ Add New Order</button>
    </div>
  );
}
