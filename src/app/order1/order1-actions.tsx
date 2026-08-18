'use client';

import { useState } from 'react';
import { createOrder1 } from './../actions';

export default function Order1Actions() {
  const [vegetableOption, setVegetableOption] = useState('');
  const [numberOfVegetables, setNumberOfVegetables] = useState('');
  const [total, setTotal] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const numVeg = parseFloat(numberOfVegetables);
      const totalAmt = parseFloat(total);

      if (!vegetableOption || isNaN(numVeg) || isNaN(totalAmt)) {
        throw new Error('Please fill all fields correctly');
      }

      await createOrder1({
        vegetableOption,
        numberOfVegetables: numVeg,
        total: totalAmt,
        date: date ? new Date(date) : new Date()
      });

      setVegetableOption('');
      setNumberOfVegetables('');
      setTotal('');
      setDate('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}
      
      <div className="form-group">
        <label className="form-label" htmlFor="vegetableOption">Vegetable options</label>
        <input 
          id="vegetableOption"
          type="text" 
          className="form-control"
          placeholder="e.g. Tomato, Onion..."
          value={vegetableOption}
          onChange={(e) => setVegetableOption(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="numberOfVegetables">No. of vegetables</label>
        <input 
          id="numberOfVegetables"
          type="number" 
          className="form-control"
          step="0.01"
          placeholder="0.00"
          value={numberOfVegetables}
          onChange={(e) => setNumberOfVegetables(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="total">Total</label>
        <input 
          id="total"
          type="number" 
          className="form-control"
          step="0.01"
          placeholder="₹ 0.00"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">Date & Time</label>
        <input 
          id="date"
          type="datetime-local" 
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Leave blank to use current time</span>
      </div>

      <button type="submit" className="btn" disabled={isLoading} style={{ marginTop: '0.5rem', width: '100%' }}>
        {isLoading ? 'Adding...' : 'Add Order'}
      </button>
    </form>
  );
}
