import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLoanStore } from "@/store/loanStore";
import { User, Search, Building, DollarSign, CreditCard, TrendingUp } from "lucide-react";

const AccountOverview = () => {
  const [searchCustomerId, setSearchCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  const { customers, getCustomerLoans, getRemainingBalance, getEmisLeft, getLoanPayments } = useLoanStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSearch = () => {
    if (!searchCustomerId.trim()) return;
    
    const customer = customers.find(c => 
      c.customerId.toLowerCase() === searchCustomerId.toLowerCase() ||
      c.name.toLowerCase().includes(searchCustomerId.toLowerCase())
    );
    
    if (customer) {
      setSelectedCustomer(customer.customerId);
      setSearchCustomerId(customer.customerId);
    }
  };

  const customer = selectedCustomer ? customers.find(c => c.customerId === selectedCustomer) : null;
  const customerLoans = selectedCustomer ? getCustomerLoans(selectedCustomer) : [];
  
  // Calculate summary metrics
  const totalLoans = customerLoans.length;
  const totalPrincipal = customerLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const totalAmount = customerLoans.reduce((sum, loan) => sum + loan.totalAmount, 0);
  const totalInterest = totalAmount - totalPrincipal;
  
  const totalPaid = customerLoans.reduce((sum, loan) => {
    const payments = getLoanPayments(loan.loanId);
    return sum + payments.reduce((paidSum, payment) => paidSum + payment.amount, 0);
  }, 0);
  
  const totalOutstanding = customerLoans.reduce((sum, loan) => {
    return sum + getRemainingBalance(loan.loanId);
  }, 0);

  const activeLoans = customerLoans.filter(loan => loan.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-info to-primary rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Customer Account Overview</h1>
            <p className="text-white/90">Comprehensive view of customer loan portfolio</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find Customer
          </CardTitle>
          <CardDescription>
            Search by customer ID or name to view their loan portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="customerId">Customer ID or Name</Label>
              <Input
                id="customerId"
                placeholder="Enter customer ID or name"
                value={searchCustomerId}
                onChange={(e) => setSearchCustomerId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={!searchCustomerId.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
          
          {/* Quick Access to All Customers */}
          <div className="mt-4">
            <Label>Quick Access - All Customers</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {customers.map((cust) => (
                <Button
                  key={cust.customerId}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchCustomerId(cust.customerId);
                    setSelectedCustomer(cust.customerId);
                  }}
                  className="text-xs"
                >
                  {cust.name} ({cust.customerId})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Summary */}
      {customer && (
        <div className="grid gap-6">
          {/* Customer Info & Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                <CreditCard className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalLoans}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  <span className="text-success">{activeLoans} active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Principal</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{formatCurrency(totalPrincipal)}</div>
                <p className="text-xs text-muted-foreground">Borrowed amount</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-info">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                <Building className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">{formatCurrency(totalPaid)}</div>
                <p className="text-xs text-muted-foreground">
                  {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <User className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{formatCurrency(totalOutstanding)}</div>
                <p className="text-xs text-muted-foreground">Amount pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
              <CardDescription>
                Account holder details and portfolio summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="text-xl font-bold">{customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-mono text-lg">{customer.customerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Created</p>
                    <p className="font-semibold">
                      {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Loan Value</span>
                      <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-semibold text-warning">{formatCurrency(totalInterest)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Payment Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success rounded-full transition-all"
                            style={{ width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loans Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-secondary" />
                Loan Portfolio
              </CardTitle>
              <CardDescription>
                Detailed view of all loans for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customerLoans.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>EMI Amount</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>EMIs Left</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerLoans.map((loan) => {
                      const amountPaid = getLoanPayments(loan.loanId)
                        .reduce((sum, payment) => sum + payment.amount, 0);
                      const emisLeft = getEmisLeft(loan.loanId);
                      
                      return (
                        <TableRow key={loan.loanId}>
                          <TableCell className="font-mono text-sm">
                            {loan.loanId.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(loan.principalAmount)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(loan.totalAmount)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(loan.monthlyEmi)}
                          </TableCell>
                          <TableCell className="font-semibold text-success">
                            {formatCurrency(amountPaid)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {emisLeft} payments
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No loans found for this customer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Customer Selected */}
      {!customer && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Customer Selected</h3>
              <p>Search for a customer ID or name to view their complete loan portfolio and account overview.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountOverview;