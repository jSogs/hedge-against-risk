import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationCombobox } from "@/components/ui/location-combobox";
import { industries } from "@/components/onboarding/onboarding-data";
import { cn } from "@/lib/utils";
import { Building2, MapPin, FileText } from "lucide-react";

interface RiskIdentityProps {
  isBusiness: boolean;
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
}

export function RiskIdentity({
  isBusiness,
  name,
  setName,
  description,
  setDescription,
  industry,
  setIndustry,
  location,
  setLocation,
}: RiskIdentityProps) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{isBusiness ? "Business Profile" : "Personal Profile"}</CardTitle>
            <CardDescription className="text-sm">
              {isBusiness ? "Basic details about your business" : "Your location and context"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isBusiness && (
          <div className="space-y-2">
            <Label htmlFor="company-name" className="text-sm font-medium">Company Name</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Logistics"
              className="h-11"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <div className="[&>button]:pl-9 [&>button]:h-11">
              <LocationCombobox
                value={location}
                onChange={setLocation}
                placeholder="Search location..."
              />
            </div>
          </div>
        </div>

        {isBusiness && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Industry</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {industries.map((ind) => {
                const Icon = ind.icon;
                const isSelected = industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                      isSelected
                        ? "border-primary/50 bg-primary/10 text-primary" 
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{ind.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {isBusiness ? "Business Description (Optional)" : "Additional Context (Optional)"}
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isBusiness ? "Describe your operations, revenue model, or key activities..." : "Any relevant details about your financial situation..."}
            className="min-h-[100px] resize-none"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

