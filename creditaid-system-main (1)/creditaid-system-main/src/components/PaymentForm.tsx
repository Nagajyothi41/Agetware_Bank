import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLoanStore } from "@/store/loanStore";
import { CreditCard, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

const PaymentForm = () => {
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"EMI" | "LUMP_SUM">("EMI");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { loans, recordPayment, getLoanById, getRemainingBalance, getEmisLeft } = useLoanStore();
  const { toast } = useToast();

  const selectedLoan = selectedLoanId ? getLoanById(selectedLoanId) : null;
  const remainingBalance = selectedLoanId ? getRemainingBalance(selectedLoanId) : 0;
  const emisLeft = selectedLoanId ? getEmisLeft(selectedLoanId) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const activeLoans = loans.filter(loan => loan.status === 'ACTIVE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLoanId || !paymentAmount) {
      toast({
        title: "Validation Error",
        description: "Please select a loan and enter payment amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (amount > remainingBalance) {
      toast({
        title: "Payment Exceeds Balance",
        description: `Payment amount cannot exceed remaining balance of ${formatCurrency(remainingBalance)}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const paymentId = recordPayment(selectedLoanId, amount, paymentType);
      
      if (paymentId) {
        const newRemainingBalance = remainingBalance - amount;
        const isFullyPaid = newRemainingBalance <= 0;
        
        toast({
          title: "Payment Recorded Successfully",
          description: isFullyPaid 
            ? "Loan has been fully paid off!" 
            : `Payment of ${formatCurrency(amount)} recorded. Remaining: ${formatCurrency(newRemainingBalance)}`,
          variant: "default"
        });
        
        // Reset form
        setPaymentAmount("");
        if (isFullyPaid) {
          setSelectedLoanId("");
        }
      } else {
        toast({
          title: "Payment Failed",
          description: "Unable to process payment. Please try again.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestedEmiAmount = selectedLoan ? selectedLoan.monthlyEmi : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-secondary to-secondary-light rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Record Payment</h1>
            <p className="text-white/90">Process EMI and lump sum payments</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-secondary" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Select loan and enter payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan">Select Loan</Label>
                <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an active loan" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLoans.map((loan) => (
                      <SelectItem key={loan.loanId} value={loan.loanId}>
                        <div className="flex items-center justify-between w-full">
                          <span>Loan #{loan.loanId.slice(0, 8)}... ({loan.customerId})</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatCurrency(getRemainingBalance(loan.loanId))} remaining
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeLoans.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active loans available</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select value={paymentType} onValueChange={(value: "EMI" | "LUMP_SUM") => setPaymentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMI">Monthly EMI</SelectItem>
                    <SelectItem value="LUMP_SUM">Lump Sum Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  max={remainingBalance}
                  step="1"
                />
                {selectedLoan && paymentType === "EMI" && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentAmount(suggestedEmiAmount.toString())}
                    >
                      Use EMI Amount: {formatCurrency(suggestedEmiAmount)}
                    </Button>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isProcessing || !selectedLoanId || !paymentAmount}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Record Payment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Loan Summary
            </CardTitle>
            <CardDescription>
              Current loan status and payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLoan ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Loan ID</span>
                    <span className="font-mono text-sm">{selectedLoan.loanId.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Customer</span>
                    <span className="font-semibold">{selectedLoan.customerId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Original Amount</span>
                    <span className="font-semibold">{formatCurrency(selectedLoan.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly EMI</span>
                    <span className="font-semibold">{formatCurrency(selectedLoan.monthlyEmi)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Remaining Balance</span>
                    <span className="font-bold text-xl text-warning">{formatCurrency(remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">EMIs Left</span>
                    <Badge variant="outline" className="text-xs">
                      {emisLeft} payments
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-info/5 border border-info/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-info" />
                    <span className="text-sm font-medium text-info">Payment Options</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• EMI: Regular monthly installment</p>
                    <p>• Lump Sum: Partial or full early payment</p>
                    <p>• Early payments reduce remaining EMIs</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a loan to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentForm;