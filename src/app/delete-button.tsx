'use client';

import { useTransition } from 'react';

type DeleteButtonProps = {
  action: () => Promise<void>;
  itemType: string;
};

export default function DeleteButton({ action, itemType }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      startTransition(async () => {
        await action();
        alert(`${itemType} deleted successfully.`);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="btn"
      style={{ background: 'var(--danger)', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
