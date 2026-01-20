import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle, Search, Home, LayoutDashboard, User } from 'lucide-react';
import probableLogo from '@/assets/probable3.png';
import { Card } from '@/components/ui/card';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/onboarding');
    }
  }, [user, authLoading, navigate]);

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setSuccess(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNeedsConfirmation(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // If not yet confirmed, show password confirmation
    if (!needsConfirmation) {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      const hasLetter = /[A-Za-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (password.length < 8 || !hasLetter || !hasNumber) {
        setError('Password must be at least 8 characters, containing letters & digits');
        return;
      }
      setNeedsConfirmation(true);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;

      if (data.user && !data.session) {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mock Background Component
  const MockBackground = () => (
    <div className="absolute inset-0 flex flex-col pointer-events-none select-none opacity-40">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center px-6 gap-6 bg-background">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/20 rounded-lg" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="h-9 flex-1 max-w-xl mx-auto bg-muted/30 rounded-lg flex items-center px-3 gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
      
      {/* Body */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-4 flex flex-col gap-4 bg-muted/5">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/20 w-full" />
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8 space-y-8 bg-background">
          {/* Hero */}
          <div className="space-y-4 max-w-2xl mx-auto text-center mt-12">
            <div className="h-12 w-3/4 bg-primary/10 rounded-lg mx-auto" />
            <div className="h-4 w-1/2 bg-muted/40 rounded mx-auto" />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="h-4 w-2/3 bg-muted rounded" />
                <div className="h-3 w-full bg-muted/30 rounded" />
                <div className="h-3 w-4/5 bg-muted/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Layer with Mock UI */}
      <MockBackground />

      {/* Blur Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background/70 to-primary/10 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
      
      {/* Centered Modal */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-background/70 backdrop-blur-2xl border border-primary/15 ring-1 ring-white/10 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 text-center space-y-4">
            <div className="flex justify-center mb-2">
              <img src={probableLogo} alt="Probable" className="h-16 w-16" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' 
                ? "Sign in to manage your risk profile"
                : "Sign up to start hedging with Probable"
              }
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 space-y-6">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-green-600 dark:text-green-500">Check your email to confirm your account before signing in.</span>
              </div>
            )}

            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    disabled={needsConfirmation || loading}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    disabled={needsConfirmation || loading}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                {mode === 'signup' && !needsConfirmation && (
                  <p className="text-[11px] text-muted-foreground">
                    Must be at least 8 characters, containing letters & digits
                  </p>
                )}
              </div>

              {mode === 'signup' && needsConfirmation && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      autoComplete="new-password"
                      autoFocus
                      className="pl-10 h-11 bg-background border-border"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : (needsConfirmation ? 'Create Account' : 'Continue')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-2 bg-background hover:bg-muted/50 font-medium border-border"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {mode === 'signin' ? (
                <>Don't have an account? <button type="button" className="text-primary hover:underline font-medium" onClick={switchMode}>Create one</button></>
              ) : (
                <>Already have an account? <button type="button" className="text-primary hover:underline font-medium" onClick={switchMode}>Sign In</button></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
