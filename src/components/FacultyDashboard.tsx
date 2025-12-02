import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { generateQRData } from '@/lib/auth-utils';
import { LogOut, QrCode, Timer, Eye, BookOpen, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FacultyDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [classId, setClassId] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealTimeLeft, setRevealTimeLeft] = useState(0);

  // Main timer countdown
  useEffect(() => {
    if (!qrData || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsBlurred(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData, timeLeft]);

  // Reveal timer countdown
  useEffect(() => {
    if (!isRevealed || revealTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setRevealTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRevealed(false);
          setIsBlurred(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRevealed, revealTimeLeft]);

  const handleGenerateQR = useCallback(() => {
    if (!classId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a course code',
        variant: 'destructive',
      });
      return;
    }

    const data = generateQRData(classId);
    setQrData(data);
    setTimeLeft(15);
    setIsBlurred(false);
    setIsRevealed(false);
    
    toast({
      title: 'QR Generated',
      description: `Session started for ${classId.toUpperCase()}`,
    });
  }, [classId, toast]);

  const handleReveal = () => {
    setIsRevealed(true);
    setIsBlurred(false);
    setRevealTimeLeft(5);
  };

  const handleRegenerateQR = () => {
    const data = generateQRData(classId);
    setQrData(data);
    setTimeLeft(15);
    setIsBlurred(false);
    setIsRevealed(false);
    
    toast({
      title: 'QR Regenerated',
      description: 'New session started',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-navy flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Faculty Portal</h1>
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6 animate-fade-in">
          {/* Course Input Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Generate Attendance Session
              </CardTitle>
              <CardDescription>
                Enter the course code to generate a QR for students to scan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classId">Course Code / Class ID</Label>
                <Input
                  id="classId"
                  placeholder="e.g., CS301, ECE205"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value.toUpperCase())}
                  className="text-lg font-mono uppercase h-12"
                  maxLength={10}
                />
              </div>
              <Button 
                variant="navy" 
                size="xl" 
                className="w-full"
                onClick={handleGenerateQR}
              >
                <QrCode className="w-5 h-5 mr-2" />
                Generate Session QR
              </Button>
            </CardContent>
          </Card>

          {/* QR Display Card */}
          {qrData && (
            <Card className="shadow-elevated animate-scale-in">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">
                  Session: {classId.toUpperCase()}
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Timer className={`w-4 h-4 ${timeLeft > 0 && !isBlurred ? 'text-success' : 'text-destructive'}`} />
                  <span className={`font-mono text-2xl font-bold ${
                    timeLeft > 5 ? 'text-success' : timeLeft > 0 ? 'text-academic-red' : 'text-destructive'
                  }`}>
                    {isRevealed ? revealTimeLeft : timeLeft}s
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {/* QR Code Container */}
                <div className={`relative p-6 bg-card rounded-xl border-2 border-border transition-all duration-300 ${
                  isBlurred && !isRevealed ? 'blur-qr' : 'unblur-qr'
                }`}>
                  <QRCodeSVG 
                    value={qrData} 
                    size={220}
                    level="H"
                    includeMargin
                    bgColor="hsl(0, 0%, 100%)"
                    fgColor="hsl(210, 30%, 25%)"
                  />
                </div>

                {/* Timer Progress */}
                <div className="w-full max-w-[260px]">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                        timeLeft > 5 ? 'bg-success' : 'bg-academic-red'
                      }`}
                      style={{ width: `${(isRevealed ? revealTimeLeft / 5 : timeLeft / 15) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full max-w-[260px]">
                  {isBlurred && !isRevealed && (
                    <Button 
                      variant="academic" 
                      size="lg"
                      className="flex-1"
                      onClick={handleReveal}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal (5s)
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                    onClick={handleRegenerateQR}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>

                {isBlurred && !isRevealed && (
                  <p className="text-sm text-muted-foreground text-center">
                    QR code is blurred for security. Click reveal to show temporarily.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
