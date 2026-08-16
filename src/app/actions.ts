'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

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
