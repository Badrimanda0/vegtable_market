import { getCustomers, deleteCustomer } from '../actions';
import NewCustomerForm from './NewCustomerForm';
import CustomerList from './CustomerList';
import Link from 'next/link';
import DeleteButton from '../delete-button';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await getCustomers();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Customers</h1>
      </div>
      
      <div className="page-grid">
        <div>
          <div className="card" style={{ padding: '1rem' }}>
            <CustomerList customers={customers} />
          </div>
        </div>
        
        <div>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Add New Customer</h3>
            <NewCustomerForm />
          </div>
        </div>
      </div>
    </div>
  );
}
