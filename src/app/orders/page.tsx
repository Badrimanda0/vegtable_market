import { getOrders, deleteOrder } from "../actions";
import OrderActions from './order-actions';
import DeleteButton from '../delete-button';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const { orders, totalOrders, totalAmount } = await getOrders();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <h1 className="page-title">Purchase Orders</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <h3>Orders Summary</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Orders</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{totalOrders}</div>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Spent</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(totalAmount)}</div>
            </div>
          </div>

          <OrderActions />
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Order History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orders.map((order: any) => (
              <div key={`order-${order.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{order.itemName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>from {order.shopName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.quantity} qty • {formatDate(order.date)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(order.amount)}</div>
                  <DeleteButton action={async () => { 'use server'; await deleteOrder(order.id); }} itemType="Order" />
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No orders found...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
