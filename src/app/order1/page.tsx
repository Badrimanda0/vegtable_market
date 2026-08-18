import { getTodayOrder1s, deleteOrder1 } from "../actions";
import Order1Actions from './order1-actions';
import DeleteButton from '../delete-button';

export const dynamic = 'force-dynamic';

export default async function Order1Page() {
  const { orders } = await getTodayOrder1s();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <h1 className="page-title">Today Order</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Today Order</h3>
          <Order1Actions />
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Dailywise Items list</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {orders.map((order: any) => (
            <div key={`order1-${order.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{order.vegetableOption}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {order.numberOfVegetables} vegetables
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(order.date)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <DeleteButton action={async () => { 'use server'; await deleteOrder1(order.id); }} itemType="Order" />
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No orders found for today...</div>
          )}
        </div>
      </div>
    </div>
  );
}
