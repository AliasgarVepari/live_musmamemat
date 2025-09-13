import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Apple } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OTPModal } from "./OTPModal";
import { KuwaitPhoneInput } from "./KuwaitPhoneInput";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const { language, t } = useLanguage();
  const { login, loginWithSocial, signup, pendingUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  
  // Login form
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone.length !== 8 || loginPassword.length < 6) {
      toast({
        title: t('auth.error'),
        description: t('auth.invalidCredentials'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(loginPhone, loginPassword);
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.loginFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'apple' | 'google') => {
    setIsLoading(true);
    try {
      await loginWithSocial(provider);
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.loginFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName.trim() || signupPhone.length !== 8 || signupPassword.length < 6) {
      toast({
        title: t('auth.error'),
        description: t('auth.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast({
        title: t('auth.error'),
        description: t('auth.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: t('auth.error'),
        description: t('auth.agreeTerms'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        fullName: signupName,
        phone: signupPhone,
        password: signupPassword,
      });
      setShowOTP(true);
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.signupFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    onSuccess();
    onClose();
  };

  const handleOTPBack = () => {
    setShowOTP(false);
  };

  if (showOTP && pendingUser) {
    return (
      <OTPModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleOTPSuccess}
        onBack={handleOTPBack}
        phoneNumber={pendingUser.phoneE164}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className={`text-center text-luxury-black ${
            language === 'ar' ? 'font-arabic' : 'font-serif'
          }`}>
            {t('auth.welcome')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className={language === 'ar' ? 'font-arabic' : ''}>
              {t('auth.login')}
            </TabsTrigger>
            <TabsTrigger value="signup" className={language === 'ar' ? 'font-arabic' : ''}>
              {t('auth.signup')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-phone" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.phone')}
                </Label>
                <KuwaitPhoneInput
                  value={loginPhone}
                  onChange={setLoginPhone}
                  placeholder={t('auth.phonePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.password')}
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={language === 'ar' ? 'font-arabic' : ''}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className={language === 'ar' ? 'font-arabic' : ''}>{t('auth.continue')}</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`bg-background px-2 text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {t('auth.orContinueWith')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={isLoading}
                >
                  <Apple className="mr-2 h-4 w-4" />
                  Apple
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.fullName')}
                </Label>
                <Input
                  id="signup-name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className={language === 'ar' ? 'font-arabic' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.phone')}
                </Label>
                <KuwaitPhoneInput
                  value={signupPhone}
                  onChange={setSignupPhone}
                  placeholder={t('auth.phonePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.password')}
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={language === 'ar' ? 'font-arabic' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.confirmPassword')}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  className={language === 'ar' ? 'font-arabic' : ''}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className={`text-sm ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('auth.agreeToTerms')}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-luxury-black text-luxury-white hover:bg-luxury-gold hover:text-luxury-black"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className={language === 'ar' ? 'font-arabic' : ''}>{t('auth.createAccount')}</span>
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className={`text-xs text-center text-muted-foreground mt-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('auth.demoDisclaimer')}
        </p>
      </DialogContent>
    </Dialog>
  );
};