import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Loan {
  loanId: string;
  customerId: string;
  principalAmount: number;
  totalAmount: number;
  interestRate: number;
  loanPeriodYears: number;
  monthlyEmi: number;
  status: 'ACTIVE' | 'PAID_OFF';
  createdAt: string;
}

export interface Payment {
  paymentId: string;
  loanId: string;
  amount: number;
  paymentType: 'EMI' | 'LUMP_SUM';
  paymentDate: string;
}

export interface Customer {
  customerId: string;
  name: string;
  createdAt: string;
}

interface LoanStore {
  loans: Loan[];
  payments: Payment[];
  customers: Customer[];
  
  // Loan operations
  createLoan: (customerId: string, loanAmount: number, loanPeriodYears: number, interestRate: number) => string;
  
  // Payment operations
  recordPayment: (loanId: string, amount: number, paymentType: 'EMI' | 'LUMP_SUM') => string | null;
  
  // Query operations
  getLoanById: (loanId: string) => Loan | undefined;
  getCustomerLoans: (customerId: string) => Loan[];
  getLoanPayments: (loanId: string) => Payment[];
  getRemainingBalance: (loanId: string) => number;
  getEmisLeft: (loanId: string) => number;
  
  // Customer operations
  addCustomer: (name: string) => string;
  getCustomer: (customerId: string) => Customer | undefined;
}

export const useLoanStore = create<LoanStore>((set, get) => ({
  loans: [],
  payments: [],
  customers: [
    { customerId: 'CUST001', name: 'John Doe', createdAt: new Date().toISOString() },
    { customerId: 'CUST002', name: 'Jane Smith', createdAt: new Date().toISOString() },
    { customerId: 'CUST003', name: 'Robert Johnson', createdAt: new Date().toISOString() },
  ],

  createLoan: (customerId: string, loanAmount: number, loanPeriodYears: number, interestRate: number) => {
    const loanId = uuidv4();
    
    // Calculate using Simple Interest: I = P * N * R
    const totalInterest = loanAmount * loanPeriodYears * (interestRate / 100);
    const totalAmount = loanAmount + totalInterest;
    const monthlyEmi = totalAmount / (loanPeriodYears * 12);
    
    const newLoan: Loan = {
      loanId,
      customerId,
      principalAmount: loanAmount,
      totalAmount,
      interestRate,
      loanPeriodYears,
      monthlyEmi,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    
    set(state => ({
      loans: [...state.loans, newLoan]
    }));
    
    return loanId;
  },

  recordPayment: (loanId: string, amount: number, paymentType: 'EMI' | 'LUMP_SUM') => {
    const loan = get().getLoanById(loanId);
    if (!loan) return null;
    
    const remainingBalance = get().getRemainingBalance(loanId);
    if (amount > remainingBalance) return null; // Payment exceeds balance
    
    const paymentId = uuidv4();
    const newPayment: Payment = {
      paymentId,
      loanId,
      amount,
      paymentType,
      paymentDate: new Date().toISOString(),
    };
    
    set(state => {
      const updatedPayments = [...state.payments, newPayment];
      const newRemainingBalance = remainingBalance - amount;
      
      // Update loan status if fully paid
      const updatedLoans = state.loans.map(l => 
        l.loanId === loanId && newRemainingBalance <= 0
          ? { ...l, status: 'PAID_OFF' as const }
          : l
      );
      
      return {
        payments: updatedPayments,
        loans: updatedLoans
      };
    });
    
    return paymentId;
  },

  getLoanById: (loanId: string) => {
    return get().loans.find(loan => loan.loanId === loanId);
  },

  getCustomerLoans: (customerId: string) => {
    return get().loans.filter(loan => loan.customerId === customerId);
  },

  getLoanPayments: (loanId: string) => {
    return get().payments.filter(payment => payment.loanId === loanId);
  },

  getRemainingBalance: (loanId: string) => {
    const loan = get().getLoanById(loanId);
    if (!loan) return 0;
    
    const totalPaid = get().getLoanPayments(loanId)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return loan.totalAmount - totalPaid;
  },

  getEmisLeft: (loanId: string) => {
    const loan = get().getLoanById(loanId);
    if (!loan) return 0;
    
    const remainingBalance = get().getRemainingBalance(loanId);
    return Math.ceil(remainingBalance / loan.monthlyEmi);
  },

  addCustomer: (name: string) => {
    const customerId = `CUST${String(get().customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      customerId,
      name,
      createdAt: new Date().toISOString(),
    };
    
    set(state => ({
      customers: [...state.customers, newCustomer]
    }));
    
    return customerId;
  },

  getCustomer: (customerId: string) => {
    return get().customers.find(customer => customer.customerId === customerId);
  },
}));