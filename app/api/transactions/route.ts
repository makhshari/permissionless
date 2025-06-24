import { NextRequest, NextResponse } from 'next/server';

export interface Transaction {
  id: string;
  walletAddress: string;
  amount: number;
  type: 'spend' | 'repay';
  date: Date;
  dueDate?: Date;
  status: 'pending' | 'repaid' | 'overdue';
}

// In-memory storage for demo purposes
// In production, this would be a database
let transactions: Transaction[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    );
  }

  try {
    const userTransactions = transactions.filter(t => t.walletAddress === walletAddress);
    
    // Check for overdue transactions
    const now = new Date();
    const updatedTransactions = userTransactions.map(t => {
      if (t.type === 'spend' && t.dueDate && t.dueDate < now && t.status === 'pending') {
        return { ...t, status: 'overdue' as const };
      }
      return t;
    });

    // Update the stored transactions
    transactions = transactions.map(t => {
      const updated = updatedTransactions.find(ut => ut.id === t.id);
      return updated || t;
    });

    return NextResponse.json({
      success: true,
      data: updatedTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amount, type } = body;

    if (!walletAddress || !amount || !type) {
      return NextResponse.json(
        { error: 'Wallet address, amount, and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'spend' && type !== 'repay') {
      return NextResponse.json(
        { error: 'Type must be either "spend" or "repay"' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // For spend transactions, check available credit
    if (type === 'spend') {
      const userTransactions = transactions.filter(t => t.walletAddress === walletAddress);
      const totalSpent = userTransactions
        .filter(t => t.type === 'spend' && t.status !== 'repaid')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalRepaid = userTransactions
        .filter(t => t.type === 'repay')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const outstandingBalance = totalSpent - totalRepaid;
      
      // This would typically come from credit score API
      // For now, using a fixed limit of $10,000
      const maxCreditLimit = 10000;
      const availableCredit = Math.max(0, maxCreditLimit - outstandingBalance);

      if (amount > availableCredit) {
        return NextResponse.json(
          { error: `Insufficient credit. Available: $${availableCredit.toLocaleString()}` },
          { status: 400 }
        );
      }
    }

    // For repay transactions, check outstanding balance
    if (type === 'repay') {
      const userTransactions = transactions.filter(t => t.walletAddress === walletAddress);
      const totalSpent = userTransactions
        .filter(t => t.type === 'spend' && t.status !== 'repaid')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalRepaid = userTransactions
        .filter(t => t.type === 'repay')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const outstandingBalance = totalSpent - totalRepaid;

      if (amount > outstandingBalance) {
        return NextResponse.json(
          { error: `Repayment amount exceeds outstanding balance. Outstanding: $${outstandingBalance.toLocaleString()}` },
          { status: 400 }
        );
      }
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      walletAddress,
      amount,
      type,
      date: new Date(),
      dueDate: type === 'spend' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30 days for spend
      status: type === 'spend' ? 'pending' : 'repaid'
    };

    transactions.push(newTransaction);

    return NextResponse.json({
      success: true,
      data: newTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, status } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Transaction ID and status are required' },
        { status: 400 }
      );
    }

    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      status
    };

    return NextResponse.json({
      success: true,
      data: transactions[transactionIndex]
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
} 