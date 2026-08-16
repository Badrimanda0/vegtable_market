'use client';

import { resetDatabase } from './actions';

export default function ResetButton() {
  return (
    <button 
      onClick={async () => {
        if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
          await resetDatabase();
          alert('Database reset successfully.');
        }
      }} 
      className="btn" 
      style={{ background: 'var(--danger)', color: 'white' }}
    >
      Reset Database
    </button>
  );
}
