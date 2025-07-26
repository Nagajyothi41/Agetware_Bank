import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLoanStore } from "@/store/loanStore";
import { FileText, Search, Calendar, DollarSign, CreditCard } from "lucide-react";

const LedgerView = () => {
  const [searchLoanId, setSearchLoanId] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  
  const { loans, getLoanById, getLoanPayments, getRemainingBalance, getEmisLeft, customers } = useLoanStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = () => {
    if (!searchLoanId.trim()) return;
    
    const loan = getLoanById(searchLoanId);
    if (loan) {
      setSelectedLoan(searchLoanId);
    } else {
      // Try to find by partial match
      const foundLoan = loans.find(l => l.loanId.toLowerCase().includes(searchLoanId.toLowerCase()));
      if (foundLoan) {
        setSelectedLoan(foundLoan.loanId);
        setSearchLoanId(foundLoan.loanId);
      }
    }
  };

  const loan = selectedLoan ? getLoanById(selectedLoan) : null;
  const payments = selectedLoan ? getLoanPayments(selectedLoan) : [];
  const remainingBalance = selectedLoan ? getRemainingBalance(selectedLoan) : 0;
  const emisLeft = selectedLoan ? getEmisLeft(selectedLoan) : 0;
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const customer = loan ? customers.find(c => c.customerId === loan.customerId) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-info rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Loan Ledger</h1>
            <p className="text-white/90">View comprehensive loan transaction history</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find Loan
          </CardTitle>
          <CardDescription>
            Enter loan ID to view detailed transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="loanId">Loan ID</Label>
              <Input
                id="loanId"
                placeholder="Enter full or partial loan ID"
                value={searchLoanId}
                onChange={(e) => setSearchLoanId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={!searchLoanId.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
          
          {/* Quick Access to Recent Loans */}
          <div className="mt-4">
            <Label>Quick Access - Recent Loans</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {loans.slice(-5).reverse().map((recentLoan) => (
                <Button
                  key={recentLoan.loanId}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchLoanId(recentLoan.loanId);
                    setSelectedLoan(recentLoan.loanId);
                  }}
                  className="text-xs"
                >
                  #{recentLoan.loanId.slice(0, 8)}... ({recentLoan.customerId})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      {loan && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Loan Information
              </CardTitle>
              <CardDescription>
                Comprehensive loan details and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Loan ID</p>
                  <p className="font-mono text-sm">{loan.loanId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{customer?.name || loan.customerId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Principal</p>
                  <p className="font-semibold">{formatCurrency(loan.principalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-semibold">{loan.interestRate}% per year</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Period</p>
                  <p className="font-semibold">{loan.loanPeriodYears} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {loan.status}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(loan.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-success">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance Amount</span>
                  <span className="font-semibold text-warning">{formatCurrency(remainingBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly EMI</span>
                  <span className="font-semibold">{formatCurrency(loan.monthlyEmi)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">EMIs Left</span>
                  <Badge variant="outline">{emisLeft} payments</Badge>
                </div>
              </div>

              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Created: {formatDate(loan.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-secondary" />
                Payment Summary
              </CardTitle>
              <CardDescription>
                Transaction overview and payment statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="font-bold text-xl text-success">{payments.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                    <p className="text-sm text-muted-foreground">EMI Payments</p>
                    <p className="font-bold text-xl text-info">
                      {payments.filter(p => p.paymentType === 'EMI').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-muted-foreground">Lump Sum</p>
                    <p className="font-bold text-xl text-warning">
                      {payments.filter(p => p.paymentType === 'LUMP_SUM').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="font-bold text-xl text-primary">
                      {Math.round((totalPaid / loan.totalAmount) * 100)}%
                    </p>
                  </div>
                </div>

                {payments.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Latest Payment</p>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {formatCurrency(payments[payments.length - 1].amount)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {payments[payments.length - 1].paymentType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(payments[payments.length - 1].paymentDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      {loan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-info" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Complete payment history for this loan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Running Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment, index) => {
                    const runningPaid = payments.slice(0, index + 1).reduce((sum, p) => sum + p.amount, 0);
                    const runningBalance = loan.totalAmount - runningPaid;
                    
                    return (
                      <TableRow key={payment.paymentId}>
                        <TableCell className="font-medium">
                          {formatDate(payment.paymentDate)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.paymentId.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.paymentType === 'EMI' ? 'default' : 'secondary'}>
                            {payment.paymentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(runningBalance)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No payments recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Loan Selected */}
      {!loan && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Loan Selected</h3>
              <p>Search for a loan ID to view detailed transaction history and ledger information.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LedgerView;