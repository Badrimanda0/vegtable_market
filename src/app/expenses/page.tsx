import { getExpenseStats, getRecentExpensesAndFunds, deleteCompanyFund, deleteExpense } from "../actions";
import ExpenseActions from '../expense-actions';
import DeleteButton from '../delete-button';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const expenseStats = await getExpenseStats();
  const { funds, expenses } = await getRecentExpensesAndFunds();

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
      <h1 className="page-title">Funds & Expenses</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <h3>Company Funds & Expenses</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Received</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatCurrency(expenseStats.totalFunds)}</div>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Spent</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(expenseStats.totalExpenses)}</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Today's Expense</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatCurrency(expenseStats.todayExpenses)}</div>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Balance Available</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: expenseStats.remainingBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatCurrency(expenseStats.remainingBalance)}
              </div>
            </div>
          </div>

          <ExpenseActions />
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {funds.map(fund => (
              <div key={`fund-${fund.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>+ {formatCurrency(fund.amount)} (Fund)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(fund.date)} {fund.description && `- ${fund.description}`}</div>
                </div>
                <DeleteButton action={async () => { 'use server'; await deleteCompanyFund(fund.id); }} itemType="Fund" />
              </div>
            ))}
            {expenses.map(expense => (
              <div key={`exp-${expense.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--danger)' }}>- {formatCurrency(expense.amount)} (Expense)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(expense.date)} {expense.description && `- ${expense.description}`}</div>
                </div>
                <DeleteButton action={async () => { 'use server'; await deleteExpense(expense.id); }} itemType="Expense" />
              </div>
            ))}
            {funds.length === 0 && expenses.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No recent history...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
