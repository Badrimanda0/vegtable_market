'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';
import { formatDateKey, parseDateKey } from '@/lib/date-utils';

export async function getDashboardStats() {
  const [sales, payments] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true, commission: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } })
  ]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySales = await prisma.sale.aggregate({
    where: { date: { gte: today } },
    _sum: { totalAmount: true }
  });

  const totalSales = sales._sum.totalAmount || 0;
  const totalReceived = payments._sum.amount || 0;
  const totalCommission = sales._sum.commission || 0;
  
  return {
    todaySales: todaySales._sum.totalAmount || 0,
    totalSales,
    totalReceived,
    totalCommission,
    pendingDebt: totalSales - totalReceived
  };
}

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    include: {
      sales: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return customers.map((c: any) => {
    const totalSales = c.sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const totalPayments = c.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    return {
      ...c,
      totalSales,
      totalPayments,
      pendingAmount: totalSales - totalPayments
    };
  });
}

export async function getCustomerLedger(id: number) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: { orderBy: { date: 'asc' } },
      payments: { orderBy: { date: 'asc' } }
    }
  });
  
  if (!customer) return null;
  
  const totalSales = customer.sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
  const totalPayments = customer.payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  return {
    customer,
    totalSales,
    totalPayments,
    pendingAmount: totalSales - totalPayments
  };
}

export async function createCustomer(data: { name: string; phone?: string; shopName?: string; createdAt?: Date }) {
  const customer = await prisma.customer.create({ data });
  revalidatePath('/customers');
  revalidatePath('/sales/new');
  revalidatePath('/payments/new');
  return customer;
}

export async function createSale(formData: FormData) {
  let billImageUrl: string | null = null;
  const billImage = formData.get('billImage') as File | null;
  
  if (billImage && billImage.size > 0) {
    const buffer = Buffer.from(await billImage.arrayBuffer());
    const mimeType = billImage.type || 'image/jpeg';
    billImageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  const data = {
    customerId: parseInt(formData.get('customerId') as string),
    vegetable: formData.get('vegetable') as string,
    quantityKg: parseFloat(formData.get('quantityKg') as string),
    ratePerKg: parseFloat(formData.get('ratePerKg') as string),
    totalAmount: parseFloat(formData.get('totalAmount') as string),
    commission: parseFloat(formData.get('commission') as string) || 0,
    date: formData.get('date') ? new Date(formData.get('date') as string) : new Date(),
    billImage: billImageUrl,
  };

  const sale = await prisma.sale.create({ data });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${data.customerId}`);
  return sale;
}

export async function createPayment(formData: FormData) {
  let receiptImageUrl: string | null = null;
  const receiptImage = formData.get('receiptImage') as File | null;
  
  if (receiptImage && receiptImage.size > 0) {
    const buffer = Buffer.from(await receiptImage.arrayBuffer());
    const mimeType = receiptImage.type || 'image/jpeg';
    receiptImageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  const data = {
    customerId: parseInt(formData.get('customerId') as string),
    amount: parseFloat(formData.get('amount') as string),
    date: formData.get('date') ? new Date(formData.get('date') as string) : new Date(),
    receiptImage: receiptImageUrl,
    senderName: formData.get('senderName') as string | null,
  };

  const payment = await prisma.payment.create({ data });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${data.customerId}`);
  return payment;
}



export async function getDailyReports() {
  const [sales, payments, expenses, companyFunds, orders, order1s] = await Promise.all([
    prisma.sale.findMany(),
    prisma.payment.findMany(),
    prisma.expense.findMany(),
    prisma.companyFund.findMany(),
    prisma.order.findMany(),
    prisma.order1.findMany()
  ]);

  const reports: Record<string, {
    date: Date;
    dateKey: string;
    totalSales: number;
    salesCount: number;
    totalCommission: number;
    totalReceived: number;
    paymentsCount: number;
    totalExpenses: number;
    expensesCount: number;
    totalFunds: number;
    fundsCount: number;
    totalOrders: number;
    ordersCount: number;
    order1sCount: number;
    totalActivities: number;
    pendingGenerated: number;
  }> = {};

  const initReport = (key: string, rawDate: Date) => {
    if (!reports[key]) {
      const { date } = parseDateKey(key);
      reports[key] = {
        date: isNaN(date.getTime()) ? new Date(rawDate) : date,
        dateKey: key,
        totalSales: 0,
        salesCount: 0,
        totalCommission: 0,
        totalReceived: 0,
        paymentsCount: 0,
        totalExpenses: 0,
        expensesCount: 0,
        totalFunds: 0,
        fundsCount: 0,
        totalOrders: 0,
        ordersCount: 0,
        order1sCount: 0,
        totalActivities: 0,
        pendingGenerated: 0
      };
    }
    return reports[key];
  };

  for (const sale of sales) {
    const key = formatDateKey(sale.date);
    const r = initReport(key, sale.date);
    r.totalSales += sale.totalAmount;
    r.salesCount += 1;
    r.totalCommission += (sale.commission || 0);
    r.pendingGenerated += sale.totalAmount;
    r.totalActivities += 1;
  }

  for (const payment of payments) {
    const key = formatDateKey(payment.date);
    const r = initReport(key, payment.date);
    r.totalReceived += payment.amount;
    r.paymentsCount += 1;
    r.pendingGenerated -= payment.amount;
    r.totalActivities += 1;
  }

  for (const exp of expenses) {
    const key = formatDateKey(exp.date);
    const r = initReport(key, exp.date);
    r.totalExpenses += exp.amount;
    r.expensesCount += 1;
    r.totalActivities += 1;
  }

  for (const fund of companyFunds) {
    const key = formatDateKey(fund.date);
    const r = initReport(key, fund.date);
    r.totalFunds += fund.amount;
    r.fundsCount += 1;
    r.totalActivities += 1;
  }

  for (const order of orders) {
    const key = formatDateKey(order.date);
    const r = initReport(key, order.date);
    r.totalOrders += order.amount;
    r.ordersCount += 1;
    r.totalActivities += 1;
  }

  for (const o1 of order1s) {
    const key = formatDateKey(o1.date);
    const r = initReport(key, o1.date);
    r.order1sCount += 1;
    r.totalActivities += 1;
  }

  return Object.values(reports).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getDailyActivityDetails(dateKey: string) {
  const { year, month, day, date } = parseDateKey(dateKey);
  const targetKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const [sales, payments, expenses, companyFunds, orders, order1s] = await Promise.all([
    prisma.sale.findMany({
      include: { customer: true },
      orderBy: { date: 'desc' }
    }),
    prisma.payment.findMany({
      include: { customer: true },
      orderBy: { date: 'desc' }
    }),
    prisma.expense.findMany({
      orderBy: { date: 'desc' }
    }),
    prisma.companyFund.findMany({
      orderBy: { date: 'desc' }
    }),
    prisma.order.findMany({
      orderBy: { date: 'desc' }
    }),
    prisma.order1.findMany({
      orderBy: { date: 'desc' }
    })
  ]);

  const daySales = sales.filter(s => formatDateKey(s.date) === targetKey);
  const dayPayments = payments.filter(p => formatDateKey(p.date) === targetKey);
  const dayExpenses = expenses.filter(e => formatDateKey(e.date) === targetKey);
  const dayFunds = companyFunds.filter(f => formatDateKey(f.date) === targetKey);
  const dayOrders = orders.filter(o => formatDateKey(o.date) === targetKey);
  const dayOrder1s = order1s.filter(o => formatDateKey(o.date) === targetKey);

  const totalSales = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalBoxes = daySales.reduce((sum, s) => sum + (s.commission || 0), 0);
  const totalReceived = dayPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFunds = dayFunds.reduce((sum, f) => sum + f.amount, 0);
  const totalOrdersAmount = dayOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalOrder1Boxes = dayOrder1s.reduce((sum, o) => sum + (o.numberOfVegetables || 0), 0);

  const totalActivities = daySales.length + dayPayments.length + dayExpenses.length + dayFunds.length + dayOrders.length + dayOrder1s.length;
  const pendingGenerated = totalSales - totalReceived;
  const netCashFlow = totalReceived + totalFunds - totalExpenses;

  // Build unified chronological timeline
  const timeline: Array<{
    id: string;
    type: 'sale' | 'payment' | 'expense' | 'fund' | 'order' | 'order1';
    title: string;
    subtitle: string;
    amount?: number;
    badge: string;
    badgeColor: string;
    badgeBg: string;
    date: Date;
    details: any;
  }> = [];

  daySales.forEach(s => {
    timeline.push({
      id: `sale-${s.id}`,
      type: 'sale',
      title: `Sale: ${s.customer?.name || 'Customer'}`,
      subtitle: `${s.quantityKg} KG ${s.vegetable} @ ₹${s.ratePerKg}${s.commission ? ` • ${s.commission} Boxes` : ''}`,
      amount: s.totalAmount,
      badge: 'Sale',
      badgeColor: '#b91c1c',
      badgeBg: '#fef2f2',
      date: s.date,
      details: s,
    });
  });

  dayPayments.forEach(p => {
    timeline.push({
      id: `pay-${p.id}`,
      type: 'payment',
      title: `Payment: ${p.customer?.name || 'Customer'}`,
      subtitle: p.senderName ? `Sender: ${p.senderName}` : 'Direct Payment Received',
      amount: p.amount,
      badge: 'Payment',
      badgeColor: '#15803d',
      badgeBg: '#ecfdf5',
      date: p.date,
      details: p,
    });
  });

  dayExpenses.forEach(e => {
    timeline.push({
      id: `exp-${e.id}`,
      type: 'expense',
      title: `Expense: ${e.description || 'General Expense'}`,
      subtitle: `Recorded on ${new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      amount: e.amount,
      badge: 'Expense',
      badgeColor: '#c2410c',
      badgeBg: '#fff7ed',
      date: e.date,
      details: e,
    });
  });

  dayFunds.forEach(f => {
    timeline.push({
      id: `fund-${f.id}`,
      type: 'fund',
      title: `Company Fund Deposit`,
      subtitle: f.description || 'Fund Deposit',
      amount: f.amount,
      badge: 'Fund',
      badgeColor: '#1d4ed8',
      badgeBg: '#eff6ff',
      date: f.date,
      details: f,
    });
  });

  dayOrders.forEach(o => {
    timeline.push({
      id: `order-${o.id}`,
      type: 'order',
      title: `Order: ${o.shopName}`,
      subtitle: `${o.quantity} ${o.itemName}`,
      amount: o.amount,
      badge: 'Order',
      badgeColor: '#7e22ce',
      badgeBg: '#faf5ff',
      date: o.date,
      details: o,
    });
  });

  dayOrder1s.forEach(o1 => {
    timeline.push({
      id: `order1-${o1.id}`,
      type: 'order1',
      title: `Daily Item: ${o1.vegetableOption}`,
      subtitle: `${o1.numberOfVegetables} Boxes / Count`,
      badge: 'Daily Item',
      badgeColor: '#0e7490',
      badgeBg: '#ecfeff',
      date: o1.date,
      details: o1,
    });
  });

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    date,
    dateKey: targetKey,
    summary: {
      totalSales,
      salesCount: daySales.length,
      totalBoxes,
      totalReceived,
      paymentsCount: dayPayments.length,
      totalExpenses,
      expensesCount: dayExpenses.length,
      totalFunds,
      fundsCount: dayFunds.length,
      totalOrders: totalOrdersAmount,
      ordersCount: dayOrders.length,
      order1sCount: dayOrder1s.length,
      totalOrder1Boxes,
      totalActivities,
      pendingGenerated,
      netCashFlow
    },
    sales: daySales,
    payments: dayPayments,
    expenses: dayExpenses,
    companyFunds: dayFunds,
    orders: dayOrders,
    order1s: dayOrder1s,
    timeline
  };
}

export async function resetDatabase() {
  await prisma.sale.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customer.deleteMany();
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
}

export async function deleteCustomer(id: number) {
  // Delete related records first
  await prisma.sale.deleteMany({ where: { customerId: id } });
  await prisma.payment.deleteMany({ where: { customerId: id } });
  await prisma.customer.delete({ where: { id } });
  
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
}

export async function deleteSale(id: number, customerId: number) {
  await prisma.sale.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${customerId}`);
}

export async function deletePayment(id: number, customerId: number) {
  await prisma.payment.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${customerId}`);
}

export async function updateCustomer(id: number, data: { name: string; phone?: string; shopName?: string; createdAt?: Date }) {
  const customer = await prisma.customer.update({ where: { id }, data });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  return customer;
}

export async function updateSale(id: number, data: { vegetable: string; quantityKg: number; ratePerKg: number; totalAmount: number; commission: number; date?: Date }) {
  const sale = await prisma.sale.update({ where: { id }, data });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${sale.customerId}`);
  return sale;
}

export async function updatePayment(id: number, data: { amount: number; date?: Date }) {
  const payment = await prisma.payment.update({ where: { id }, data });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${payment.customerId}`);
  return payment;
}

export async function getRecentBills() {
  return prisma.sale.findMany({
    where: { billImage: { not: null } },
    orderBy: { date: 'desc' },
    take: 6,
    include: { customer: true }
  });
}

export async function getImagesGroupedByDate() {
  const sales = await prisma.sale.findMany({
    where: { billImage: { not: null } },
    include: { customer: true },
    orderBy: { date: 'desc' }
  });

  const payments = await prisma.payment.findMany({
    where: { receiptImage: { not: null } },
    include: { customer: true },
    orderBy: { date: 'desc' }
  });

  const grouped: Record<string, any[]> = {};

  const formatDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  sales.forEach(sale => {
    const key = formatDate(sale.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: `sale-${sale.id}`,
      type: 'sale',
      image: sale.billImage,
      customerName: sale.customer.name,
      date: sale.date,
      amount: sale.totalAmount,
    });
  });

  payments.forEach(payment => {
    const key = formatDate(payment.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: `payment-${payment.id}`,
      type: 'payment',
      image: payment.receiptImage,
      customerName: payment.customer.name,
      date: payment.date,
      amount: payment.amount,
    });
  });

  // Sort groups by date descending
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  return sortedDates.map(dateKey => {
    // Sort items within each date by time descending
    const items = grouped[dateKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
      dateString: dateKey,
      items
    };
  });
}

// --- Expenses & Funds ---

export async function getExpenseStats() {
  const [funds, expenses] = await Promise.all([
    prisma.companyFund.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } })
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayExpenses, monthExpenses] = await Promise.all([
    prisma.expense.aggregate({
      where: { date: { gte: today } },
      _sum: { amount: true }
    }),
    prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true }
    })
  ]);

  const totalFunds = funds._sum.amount || 0;
  const totalExpenses = expenses._sum.amount || 0;

  return {
    totalFunds,
    totalExpenses,
    remainingBalance: totalFunds - totalExpenses,
    todayExpenses: todayExpenses._sum.amount || 0,
    monthExpenses: monthExpenses._sum.amount || 0
  };
}

export async function createCompanyFund(data: { amount: number; description?: string }) {
  const fund = await prisma.companyFund.create({ data });
  revalidatePath('/');
  revalidatePath('/reports');
  revalidatePath('/expenses');
  return fund;
}

export async function createExpense(data: { amount: number; description?: string }) {
  const expense = await prisma.expense.create({ data });
  revalidatePath('/');
  revalidatePath('/reports');
  revalidatePath('/expenses');
  return expense;
}

export async function getRecentExpensesAndFunds() {
  const [funds, expenses] = await Promise.all([
    prisma.companyFund.findMany({ orderBy: { date: 'desc' }, take: 5 }),
    prisma.expense.findMany({ orderBy: { date: 'desc' }, take: 5 })
  ]);
  return { funds, expenses };
}

export async function deleteCompanyFund(id: number) {
  await prisma.companyFund.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/reports');
  revalidatePath('/expenses');
}

export async function deleteExpense(id: number) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/reports');
  revalidatePath('/expenses');
}

// --- Orders ---

export async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { date: 'desc' }
  });
  
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

  return { orders, totalOrders, totalAmount };
}

export async function createOrder(data: { shopName: string; itemName: string; quantity: number; amount: number; date?: Date }) {
  const order = await prisma.order.create({ data });
  revalidatePath('/orders');
  revalidatePath('/reports');
  return order;
}

export async function deleteOrder(id: number) {
  await prisma.order.delete({ where: { id } });
  revalidatePath('/orders');
  revalidatePath('/reports');
}

// --- Order 1 ---

export async function getTodayOrder1s() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await prisma.order1.findMany({
    where: {
      date: {
        gte: today,
      },
    },
    orderBy: { date: 'desc' }
  });

  return { orders };
}

export async function getAllOrder1s() {
  const orders = await prisma.order1.findMany({
    orderBy: { date: 'desc' }
  });

  return { orders };
}

export async function createOrder1(data: { vegetableOption: string; numberOfVegetables: number; date?: Date }) {
  const order = await prisma.order1.create({ data });
  revalidatePath('/order1');
  revalidatePath('/reports');
  return order;
}

export async function deleteOrder1(id: number) {
  await prisma.order1.delete({ where: { id } });
  revalidatePath('/order1');
  revalidatePath('/reports');
}
