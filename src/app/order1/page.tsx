import { getAllOrder1s } from "../actions";
import Order1Actions from './order1-actions';
import Order1List from './Order1List';

export const dynamic = 'force-dynamic';

export default async function Order1Page() {
  const { orders } = await getAllOrder1s();

  return (
    <div>
      <h1 className="page-title">Today Order</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Today Order</h3>
          <Order1Actions />
        </div>
      </div>

      <Order1List orders={orders} />
    </div>
  );
}
