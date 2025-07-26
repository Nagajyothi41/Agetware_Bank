import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLoanStore } from "@/store/loanStore";
import { DollarSign, Calculator, CheckCircle } from "lucide-react";

const LoanForm = () => {
  const [customerId, setCustomerId] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPeriod, setLoanPeriod] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { createLoan, customers } = useLoanStore();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateLoanDetails = () => {
    const principal = parseFloat(loanAmount);
    const years = parseFloat(loanPeriod);
    const rate = parseFloat(interestRate);
    
    if (!principal || !years || !rate) return null;
    
    // Simple Interest: I = P * N * R
    const totalInterest = principal * years * (rate / 100);
    const totalAmount = principal + totalInterest;
    const monthlyEmi = totalAmount / (years * 12);
    
    return {
      principal,
      totalInterest,
      totalAmount,
      monthlyEmi
    };
  };

  const loanDetails = calculateLoanDetails();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !loanAmount || !loanPeriod || !interestRate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const loanId = createLoan(
        customerId,
        parseFloat(loanAmount),
        parseFloat(loanPeriod),
        parseFloat(interestRate)
      );
      
      toast({
        title: "Loan Created Successfully",
        description: `Loan ID: ${loanId.slice(0, 8)}... has been processed`,
        variant: "default"
      });
      
      // Reset form
      setCustomerId("");
      setLoanAmount("");
      setLoanPeriod("");
      setInterestRate("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create loan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Create New Loan</h1>
            <p className="text-white/90">Process loan applications with simple interest calculation</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Loan Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Loan Application
            </CardTitle>
            <CardDescription>
              Enter loan details to process the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customerId} value={customer.customerId}>
                        {customer.name} ({customer.customerId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  min="1000"
                  step="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Loan Period (Years)</Label>
                <Input
                  id="period"
                  type="number"
                  placeholder="5"
                  value={loanPeriod}
                  onChange={(e) => setLoanPeriod(e.target.value)}
                  min="1"
                  max="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Interest Rate (% per year)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="10.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  min="1"
                  max="50"
                  step="0.1"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCalculating || !loanDetails}
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <Calculator className="mr-2 h-4 w-4 animate-spin" />
                    Processing Loan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Loan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loan Calculation Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-secondary" />
              Loan Calculation
            </CardTitle>
            <CardDescription>
              Preview of loan terms and calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loanDetails ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Principal Amount</span>
                    <span className="font-semibold">{formatCurrency(loanDetails.principal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Interest</span>
                    <span className="font-semibold text-warning">{formatCurrency(loanDetails.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total Amount</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(loanDetails.totalAmount)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly EMI</span>
                    <span className="font-bold text-xl text-secondary">{formatCurrency(loanDetails.monthlyEmi)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    For {loanPeriod} years ({parseInt(loanPeriod || "0") * 12} payments)
                  </p>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-info/5 rounded border border-info/20">
                  <p className="font-medium text-info mb-1">Calculation Method:</p>
                  <p>Simple Interest: I = P × N × R</p>
                  <p>Total Amount = Principal + Interest</p>
                  <p>Monthly EMI = Total Amount ÷ (Years × 12)</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Enter loan details to see calculation</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanForm;