import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { detectUserRole } from '@/lib/auth-utils';
import { GraduationCap, Loader2, Mail, Lock, UserCheck, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const detectedRole = detectUserRole(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = isLogin 
      ? await login(email, password)
      : await register(email, password);

    setIsLoading(false);

    if (!result.success) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: isLogin ? 'Welcome back!' : 'Account created!',
        description: `Logged in as ${detectedRole}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl gradient-navy flex items-center justify-center shadow-glow-navy">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">AttendEase</h1>
        <p className="text-muted-foreground mt-1">IIIT Pune Attendance System</p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md shadow-elevated animate-scale-in">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to access your dashboard' 
              : 'Register with your IIIT Pune email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@iiitp.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
              {email && detectedRole && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md ${
                  detectedRole === 'faculty' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-secondary/10 text-secondary'
                }`}>
                  {detectedRole === 'faculty' ? (
                    <BookOpen className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span className="font-medium capitalize">
                    {detectedRole} account detected
                  </span>
                </div>
              )}
              {email && !detectedRole && (
                <p className="text-xs text-destructive px-1">
                  Use faculty@iiitp.ac.in or 123456789@cse.iiitp.ac.in
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="navy"
              size="lg"
              className="w-full"
              disabled={isLoading || !detectedRole}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Register" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer info */}
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-sm">
        Faculty: Use your @iiitp.ac.in email<br />
        Students: Use your roll number @cse/ece.iiitp.ac.in
      </p>
    </div>
  );
};

export default AuthForm;
