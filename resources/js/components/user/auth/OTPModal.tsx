import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronLeft, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onBack: () => void;
  phoneNumber: string;
}

export const OTPModal = ({ isOpen, onClose, onSuccess, onBack, phoneNumber }: OTPModalProps) => {
  const { language, t } = useLanguage();
  const { verifyOTP } = useAuth();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Format phone for display (mask middle digits)
  const formatPhoneForDisplay = (phone: string) => {
    if (phone.length === 12 && phone.startsWith('+965')) {
      const local = phone.slice(4);
      return `+965 •••• ••${local.slice(-2)}`;
    }
    return phone;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: t('auth.error'),
        description: t('auth.invalidOTP'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(otp);
      onSuccess();
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.verificationFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    // Simulate resend
    setCountdown(60);
    setCanResend(false);
    setOtp("");
    
    toast({
      title: t('auth.otpResent'),
      description: t('auth.otpResentDescription'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1 h-8 w-8"
            >
              <ChevronLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </Button>
            <DialogTitle className={`text-luxury-black ${language === 'ar' ? 'font-arabic' : 'font-serif'}`}>
              {t('auth.verifyPhone')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className={`text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('auth.otpSentTo')}
            </p>
            <p className={`font-mono text-luxury-black font-semibold ${language === 'ar' ? 'font-arabic' : ''}`}>
              {formatPhoneForDisplay(phoneNumber)}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className={`text-center block ${language === 'ar' ? 'font-arabic' : ''}`}>
                {t('auth.enterOTP')}
              </Label>
              <Input
                id="otp"
                type="tel"
                dir="ltr"
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-wider"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <span className={language === 'ar' ? 'font-arabic' : ''}>{t('auth.verify')}</span>
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('auth.didntReceiveCode')}
            </p>
            
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={!canResend}
              className="text-luxury-black hover:text-luxury-gold"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              <span className={language === 'ar' ? 'font-arabic' : ''}>
                {canResend ? t('auth.resendOTP') : `${t('auth.resendIn')} ${countdown}s`}
              </span>
            </Button>

            <Button
              variant="ghost"
              onClick={onBack}
              className="text-muted-foreground hover:text-luxury-black"
            >
              <span className={language === 'ar' ? 'font-arabic' : ''}>
                {t('auth.editPhone')}
              </span>
            </Button>
          </div>
        </div>

        <p className={`text-xs text-center text-muted-foreground mt-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('auth.demoDisclaimer')}
        </p>
      </DialogContent>
    </Dialog>
  );
};