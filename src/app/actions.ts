'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

export async function createSale(data: { customerId: number; vegetable: string; quantityKg: number; ratePerKg: number; totalAmount: number; commission: number; date?: Date }) {
  const sale = await prisma.sale.create({ data });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${data.customerId}`);
  return sale;
}

export async function createPayment(data: { customerId: number; amount: number; date?: Date }) {
  const payment = await prisma.payment.create({ data });
  revalidatePath('/');
  revalidatePath('/customers');
  revalidatePath('/reports');
  revalidatePath(`/customers/${data.customerId}`);
  return payment;
}

export async function getDailyReports() {
  const sales = await prisma.sale.findMany();
  const payments = await prisma.payment.findMany();

  const reports: Record<string, { date: Date; totalSales: number; totalCommission: number; totalReceived: number; pendingGenerated: number }> = {};

  const formatDate = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  };

  for (const sale of sales) {
    const key = formatDate(sale.date);
    if (!reports[key]) reports[key] = { date: new Date(key), totalSales: 0, totalCommission: 0, totalReceived: 0, pendingGenerated: 0 };
    reports[key].totalSales += sale.totalAmount;
    reports[key].totalCommission += sale.commission;
    reports[key].pendingGenerated += sale.totalAmount;
  }

  for (const payment of payments) {
    const key = formatDate(payment.date);
    if (!reports[key]) reports[key] = { date: new Date(key), totalSales: 0, totalCommission: 0, totalReceived: 0, pendingGenerated: 0 };
    reports[key].totalReceived += payment.amount;
    reports[key].pendingGenerated -= payment.amount;
  }

  return Object.values(reports).sort((a, b) => b.date.getTime() - a.date.getTime());
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
