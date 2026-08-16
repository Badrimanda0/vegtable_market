import { getCustomers } from '../../actions';
import PaymentForm from './PaymentForm';

export const dynamic = 'force-dynamic';

export default async function NewPaymentPage() {
  const customers = await getCustomers();
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="page-title">Receive Payment</h1>
      <div className="card">
        <PaymentForm customers={customers} />
      </div>
    </div>
  );
}
