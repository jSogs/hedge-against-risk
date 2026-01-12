import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sliders, CalendarDays, Wallet } from "lucide-react";
import {
  planningWindows,
  exposureRanges,
  riskStyles,
  RiskStyle,
} from "@/components/onboarding/onboarding-data";

interface HedgingPreferencesProps {
  planningWindow: string;
  setPlanningWindow: (val: string) => void;
  exposureRange: number[];
  setExposureRange: (val: number[]) => void;
  hedgeBudget: string;
  setHedgeBudget: (val: string) => void;
  riskStyle: RiskStyle;
  setRiskStyle: (val: RiskStyle) => void;
}

export function HedgingPreferences({
  planningWindow,
  setPlanningWindow,
  exposureRange,
  setExposureRange,
  hedgeBudget,
  setHedgeBudget,
  riskStyle,
  setRiskStyle,
}: HedgingPreferencesProps) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sliders className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Hedging Strategy</CardTitle>
            <CardDescription className="text-sm">
              Configure how Probable recommends protection strategies
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Planning Horizon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Planning Horizon
            </Label>
            <span className="text-xs font-medium text-primary">
              {planningWindows.find(w => w.id === planningWindow)?.label}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {planningWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => setPlanningWindow(window.id)}
                className={cn(
                  "h-10 rounded-lg text-xs font-medium transition-colors border",
                  planningWindow === window.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted/50"
                )}
              >
                {window.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exposure Slider */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center justify-between">
            <span>Estimated Monthly Exposure</span>
            <span className="text-primary font-semibold">
              {exposureRanges[exposureRange[0]]?.label}
            </span>
          </Label>
          <div className="pt-2 px-1">
            <Slider
              value={exposureRange}
              onValueChange={setExposureRange}
              max={3}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wide mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Critical</span>
            </div>
          </div>
        </div>

        {/* Budget Input */}
        <div className="space-y-2">
          <Label htmlFor="hedge-budget" className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Monthly Hedge Budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
            <Input
              id="hedge-budget"
              type="number"
              value={hedgeBudget}
              onChange={(e) => setHedgeBudget(e.target.value)}
              className="pl-8 h-11 font-mono text-base"
              min="0"
              step="100"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum amount you're willing to spend on hedging per month
          </p>
        </div>

        {/* Risk Style Grid */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Risk Appetite</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {riskStyles.map((style) => {
              const isSelected = riskStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setRiskStyle(style.id as RiskStyle)}
                  className={cn(
                    "p-3.5 rounded-lg border text-left transition-colors",
                    isSelected
                      ? "border-primary/50 bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-sm font-semibold capitalize",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {style.label}
                    </span>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

