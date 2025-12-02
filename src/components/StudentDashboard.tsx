import React, { useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { parseQRData } from '@/lib/auth-utils';
import { LogOut, Fingerprint, ScanLine, CheckCircle2, XCircle, UserCheck, ArrowLeft, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type StudentState = 'verify' | 'scanning' | 'verifying' | 'success' | 'error';

interface ScanResult {
  classId: string;
  timestamp: Date;
}

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<StudentState>('verify');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFingerprintClick = useCallback(() => {
    setState('verifying');
    
    // Simulate fingerprint verification
    setTimeout(() => {
      setState('scanning');
      setIsScanning(true);
      toast({
        title: 'Identity Verified',
        description: 'You can now scan the QR code',
      });
    }, 1500);
  }, [toast]);

  const handleScan = useCallback((result: any) => {
    if (!result || !result[0]) return;
    
    const data = result[0].rawValue;
    const parsed = parseQRData(data);
    
    if (!parsed) {
      setErrorMessage('Invalid QR code format');
      setState('error');
      setIsScanning(false);
      return;
    }

    // Check if QR is expired (more than 60 seconds old for demo)
    const now = Date.now();
    if (now - parsed.timestamp > 60000) {
      setErrorMessage('This QR code has expired');
      setState('error');
      setIsScanning(false);
      return;
    }

    setScanResult({
      classId: parsed.classId,
      timestamp: new Date(),
    });
    setState('success');
    setIsScanning(false);
    
    toast({
      title: 'Attendance Marked!',
      description: `Successfully marked for ${parsed.classId}`,
    });
  }, [toast]);

  const handleReset = () => {
    setState('verify');
    setIsScanning(false);
    setScanResult(null);
    setErrorMessage('');
  };

  const renderContent = () => {
    switch (state) {
      case 'verify':
        return (
          <Card className="shadow-elevated animate-scale-in">
            <CardHeader className="text-center">
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>
                Verify your identity before scanning
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 py-8">
              <Button
                variant="fingerprint"
                size="icon-xl"
                className="rounded-full"
                onClick={handleFingerprintClick}
              >
                <Fingerprint className="w-12 h-12 text-primary" />
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Tap the fingerprint icon to verify your identity
              </p>
            </CardContent>
          </Card>
        );

      case 'verifying':
        return (
          <Card className="shadow-elevated animate-scale-in">
            <CardHeader className="text-center">
              <CardTitle>Verifying...</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 py-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Fingerprint className="w-12 h-12 text-primary animate-fingerprint" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse-ring" />
              </div>
              <p className="text-sm text-muted-foreground">
                Scanning fingerprint...
              </p>
            </CardContent>
          </Card>
        );

      case 'scanning':
        return (
          <Card className="shadow-elevated animate-scale-in overflow-hidden">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 text-success">
                <UserCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Identity Verified</span>
              </div>
              <CardTitle className="mt-2">Scan QR Code</CardTitle>
              <CardDescription>
                Point your camera at the QR code displayed by faculty
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-square max-h-[400px] bg-foreground/5">
                {isScanning ? (
                  <>
                    <Scanner
                      onScan={handleScan}
                      onError={(error) => console.error(error)}
                      constraints={{
                        facingMode: 'environment',
                      }}
                      styles={{
                        container: {
                          width: '100%',
                          height: '100%',
                        },
                        video: {
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        },
                      }}
                    />
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-12 border-2 border-primary rounded-2xl" />
                      <div className="absolute left-12 right-12 h-0.5 bg-academic-red animate-scan-line" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                    <Camera className="w-16 h-16 text-muted-foreground" />
                    <Button variant="academic" size="lg" onClick={() => setIsScanning(true)}>
                      <ScanLine className="w-4 h-4 mr-2" />
                      Start Scanner
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={handleReset}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="shadow-elevated animate-scale-in border-success/30">
            <CardContent className="flex flex-col items-center space-y-6 py-12">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Attendance Marked!</h2>
                <p className="text-lg font-semibold text-primary">
                  {scanResult?.classId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {scanResult?.timestamp.toLocaleString()}
                </p>
              </div>
              <Button variant="navy" size="lg" onClick={handleReset}>
                Scan Another
              </Button>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="shadow-elevated animate-scale-in border-destructive/30">
            <CardContent className="flex flex-col items-center space-y-6 py-12">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Scan Failed</h2>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              <Button variant="academic" size="lg" onClick={handleReset}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-red flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Student Portal</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-md">
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;
