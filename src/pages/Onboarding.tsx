import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Building2, User, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ProfileType = 'person' | 'business';
type RiskStyle = 'conservative' | 'balanced' | 'opportunistic';

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Agriculture',
  'Energy',
  'Entertainment',
  'Other',
];

const regions = [
  'US',
  'EU',
  'UK',
  'Asia',
  'Latin America',
  'Middle East',
  'Africa',
  'Oceania',
];

export default function Onboarding() {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [region, setRegion] = useState('');
  const [riskStyle, setRiskStyle] = useState<RiskStyle>('balanced');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTypeSelect = (type: ProfileType) => {
    setProfileType(type);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileType) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        profile_type: profileType,
        region: region,
        industry: profileType === 'business' ? industry : null,
        risk_style: riskStyle,
        profile_json: { name },
      });

      if (error) throw error;

      toast({
        title: 'Profile created!',
        description: 'Welcome to Hedge AI.',
      });
      navigate('/home');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create profile',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'type') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        
        <div className="w-full max-w-2xl relative space-y-8">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Welcome to Hedge</h1>
            <p className="text-muted-foreground">
              Tell us a bit about yourself so we can personalize your experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="glass cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleTypeSelect('person')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Individual</CardTitle>
                <CardDescription>
                  I want to hedge personal risks like weather, travel, or events.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="glass cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleTypeSelect('business')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Business</CardTitle>
                <CardDescription>
                  I want to hedge business risks like supply chain, regulations, or markets.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      
      <Card className="w-full max-w-md relative glass">
        <CardHeader>
          <button
            onClick={() => setStep('type')}
            className="text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            ← Back
          </button>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            {profileType === 'business'
              ? 'Tell us about your business'
              : 'Tell us about yourself'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                {profileType === 'business' ? 'Company Name' : 'Full Name'}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={profileType === 'business' ? 'Acme Inc.' : 'John Doe'}
                required
              />
            </div>

            {profileType === 'business' && (
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={region} onValueChange={setRegion} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((reg) => (
                    <SelectItem key={reg} value={reg}>
                      {reg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Risk Tolerance</Label>
              <RadioGroup
                value={riskStyle}
                onValueChange={(v) => setRiskStyle(v as RiskStyle)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="conservative" id="conservative" />
                  <Label htmlFor="conservative" className="flex-1 cursor-pointer">
                    <span className="font-medium">Conservative</span>
                    <p className="text-sm text-muted-foreground">Prioritize protection over returns</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="flex-1 cursor-pointer">
                    <span className="font-medium">Balanced</span>
                    <p className="text-sm text-muted-foreground">Balance between protection and opportunity</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="opportunistic" id="opportunistic" />
                  <Label htmlFor="opportunistic" className="flex-1 cursor-pointer">
                    <span className="font-medium">Opportunistic</span>
                    <p className="text-sm text-muted-foreground">Seek opportunities with managed risk</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
