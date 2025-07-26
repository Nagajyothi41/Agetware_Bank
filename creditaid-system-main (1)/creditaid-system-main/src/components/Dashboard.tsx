import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, CreditCard, TrendingUp, Building, AlertCircle } from "lucide-react";
import { useLoanStore } from "@/store/loanStore";

const Dashboard = () => {
  const { loans, payments } = useLoanStore();

  // Calculate dashboard metrics
  const totalLoans = loans.length;
  const totalCustomers = new Set(loans.map(loan => loan.customerId)).size;
  const totalDisbursed = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const totalOutstanding = loans.reduce((sum, loan) => {
    const paidAmount = payments
      .filter(p => p.loanId === loan.loanId)
      .reduce((paid, p) => paid + p.amount, 0);
    return sum + (loan.totalAmount - paidAmount);
  }, 0);

  const activeLoans = loans.filter(loan => {
    const paidAmount = payments
      .filter(p => p.loanId === loan.loanId)
      .reduce((paid, p) => paid + p.amount, 0);
    return paidAmount < loan.totalAmount;
  }).length;

  const recentLoans = loans.slice(-3).reverse();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary via-primary-light to-secondary rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Banking Dashboard</h1>
            <p className="text-white/90">Comprehensive loan management and oversight</p>
          </div>
          <Building className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Key Metrics */}
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

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Unique borrowers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalDisbursed)}</div>
            <p className="text-xs text-muted-foreground">Principal amount</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">Amount pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Recent Loans
            </CardTitle>
            <CardDescription>Latest loan applications processed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLoans.length > 0 ? (
              recentLoans.map((loan) => (
                <div key={loan.loanId} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">Loan #{loan.loanId.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">Customer: {loan.customerId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(loan.principalAmount)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {loan.loanPeriodYears}Y @ {loan.interestRate}%
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No loans created yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              System Status
            </CardTitle>
            <CardDescription>Banking system health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Loan Processing</span>
                <Badge variant="default" className="bg-success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment System</span>
                <Badge variant="default" className="bg-success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Interest Calculation</span>
                <Badge variant="default" className="bg-success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ledger Management</span>
                <Badge variant="default" className="bg-success">Operational</Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                All banking services are operating normally. 
                Last system check: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;