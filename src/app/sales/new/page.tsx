import { getCustomers, getAllSales } from '../../actions';
import SaleForm from './SaleForm';
import SalesList from './SalesList';

export const dynamic = 'force-dynamic';

export default async function NewSalePage() {
  const [customers, sales] = await Promise.all([
    getCustomers(),
    getAllSales()
  ]);
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="page-title">Record a Sale</h1>
      
      <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <SaleForm customers={customers} />
      </div>

      <SalesList sales={sales} />
    </div>
  );
}

