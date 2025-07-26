import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building, CreditCard, FileText, User, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: Building,
      description: "Overview"
    },
    { 
      path: "/lend", 
      label: "New Loan", 
      icon: DollarSign,
      description: "Create Loan"
    },
    { 
      path: "/payment", 
      label: "Payment", 
      icon: CreditCard,
      description: "Record Payment"
    },
    { 
      path: "/ledger", 
      label: "Ledger", 
      icon: FileText,
      description: "View Transactions"
    },
    { 
      path: "/overview", 
      label: "Accounts", 
      icon: User,
      description: "Customer Overview"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Banking Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center space-x-4 px-6">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Agetware Bank</h1>
              <p className="text-xs text-muted-foreground">Lending System</p>
            </div>
          </div>
          
          <nav className="flex flex-1 items-center justify-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "h-10 px-4 text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-2">
            <div className="text-right text-sm">
              <p className="font-medium text-foreground">Banking Portal</p>
              <p className="text-xs text-muted-foreground">Secure Session</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;