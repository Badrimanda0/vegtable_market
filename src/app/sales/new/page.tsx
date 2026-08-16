import { getCustomers } from '../../actions';
import SaleForm from './SaleForm';

export const dynamic = 'force-dynamic';

export default async function NewSalePage() {
  const customers = await getCustomers();
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="page-title">Record a Sale</h1>
      <div className="card">
        <SaleForm customers={customers} />
      </div>
    </div>
  );
}
