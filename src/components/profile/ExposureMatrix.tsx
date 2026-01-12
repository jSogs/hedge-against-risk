import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ShieldAlert } from "lucide-react";
import { costExposures, budgetImpacts, debtExposures } from "@/components/onboarding/onboarding-data";

interface ExposureMatrixProps {
  isBusiness: boolean;
  selectedExposures: string[];
  toggleExposure: (id: string) => void;
  selectedDebt: string[];
  toggleDebt: (id: string) => void;
}

export function ExposureMatrix({
  isBusiness,
  selectedExposures,
  toggleExposure,
  selectedDebt,
  toggleDebt,
}: ExposureMatrixProps) {
  const items = isBusiness ? costExposures : budgetImpacts;

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Risk Exposures</CardTitle>
            <CardDescription className="text-sm">
              Select the factors that could impact your financial stability
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            What are you most exposed to?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedExposures.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleExposure(item.id)}
                  className={cn(
                    "relative flex items-start gap-3 p-3.5 rounded-lg border transition-all text-left",
                    isSelected 
                      ? "border-primary/50 bg-primary/5" 
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {isSelected ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm block">{item.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight line-clamp-2">
                      {isBusiness ? (item as any).description : "Impacts monthly budget stability"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {!isBusiness && (
          <div className="space-y-3 pt-3 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground">
              Outstanding debts or liabilities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {debtExposures.map((debt) => {
                const Icon = debt.icon;
                const isSelected = selectedDebt.includes(debt.id);
                return (
                  <button
                    key={debt.id}
                    onClick={() => toggleDebt(debt.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                      isSelected
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 mb-1.5" />
                    <span className="text-xs font-medium text-center">{debt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
