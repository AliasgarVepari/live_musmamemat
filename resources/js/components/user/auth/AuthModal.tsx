import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/user/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/user/ui/tabs";
import { Button } from "@/components/user/ui/button";
import { Input } from "@/components/user/ui/input";
import { Label } from "@/components/user/ui/label";
import { Checkbox } from "@/components/user/ui/checkbox";
import { Loader2, Apple, AlertCircle } from "lucide-react";
import apple from "@/assets/user/Apple_logo_black.svg";
import { useToast } from "@/hooks/user/use-toast";
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

  // Validation errors
  const [loginErrors, setLoginErrors] = useState<{
    phone?: string;
    password?: string;
    general?: string;
  }>({});
  
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  // Clear errors when switching tabs
  useEffect(() => {
    setLoginErrors({});
    setSignupErrors({});
  }, [activeTab]);

  // Validation functions
  const validateLoginForm = () => {
    const errors: typeof loginErrors = {};
    
    if (!loginPhone.trim()) {
      errors.phone = t('auth.phoneRequired');
    } else if (loginPhone.length !== 8) {
      errors.phone = t('auth.phoneInvalid');
    }
    
    if (!loginPassword.trim()) {
      errors.password = t('auth.passwordRequired');
    } else if (loginPassword.length < 6) {
      errors.password = t('auth.passwordMinLength');
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = () => {
    const errors: typeof signupErrors = {};
    
    if (!signupName.trim()) {
      errors.name = t('auth.nameRequired');
    } else if (signupName.trim().length < 2) {
      errors.name = t('auth.nameMinLength');
    }
    
    if (!signupPhone.trim()) {
      errors.phone = t('auth.phoneRequired');
    } else if (signupPhone.length !== 8) {
      errors.phone = t('auth.phoneInvalid');
    }
    
    if (!signupPassword.trim()) {
      errors.password = t('auth.passwordRequired');
    } else if (signupPassword.length < 6) {
      errors.password = t('auth.passwordMinLength');
    }
    
    if (!confirmPassword.trim()) {
      errors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (signupPassword !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordMismatch');
    }
    
    if (!agreeTerms) {
      errors.terms = t('auth.agreeTermsRequired');
    }
    
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setLoginErrors({});
    
    // Validate form
    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(loginPhone, loginPassword);
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.loginFailed');
      
      // Check if it's a specific field error (like wrong credentials)
      if (errorMessage.includes('credentials') || errorMessage.includes('password') || errorMessage.includes('phone')) {
        setLoginErrors({
          general: errorMessage
        });
      } else {
        setLoginErrors({
          general: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'apple' | 'google') => {
    setIsLoading(true);
    try {
      loginWithSocial(provider);
      // Don't call onSuccess() and onClose() here since loginWithSocial redirects the page
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.loginFailed'),
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setSignupErrors({});
    
    // Validate form
    if (!validateSignupForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup({
        fullName: signupName,
        phone: signupPhone,
        password: signupPassword,
      });
      
      // Show OTP notification
      toast({
        title: t('auth.otpSent'),
        description: `OTP: ${result.otp} (Demo - expires in 10 minutes)`,
        variant: "default",
      });
      
      setShowOTP(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.signupFailed');
      
      // Check if it's a specific field error (like phone already exists)
      if (errorMessage.includes('phone') && errorMessage.includes('already')) {
        setSignupErrors({
          phone: errorMessage
        });
      } else if (errorMessage.includes('name') || errorMessage.includes('fullName')) {
        setSignupErrors({
          name: errorMessage
        });
      } else if (errorMessage.includes('password')) {
        setSignupErrors({
          password: errorMessage
        });
      } else {
        setSignupErrors({
          general: errorMessage
        });
      }
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

  // Field change handlers with real-time validation
  const handleLoginPhoneChange = (value: string) => {
    setLoginPhone(value);
    if (loginErrors.phone) {
      setLoginErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
    if (loginErrors.password) {
      setLoginErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleSignupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupName(e.target.value);
    if (signupErrors.name) {
      setSignupErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleSignupPhoneChange = (value: string) => {
    setSignupPhone(value);
    if (signupErrors.phone) {
      setSignupErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSignupPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupPassword(e.target.value);
    if (signupErrors.password) {
      setSignupErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (signupErrors.confirmPassword) {
      setSignupErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleTermsChange = (checked: boolean) => {
    setAgreeTerms(checked);
    if (signupErrors.terms) {
      setSignupErrors(prev => ({ ...prev, terms: undefined }));
    }
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
              {/* General error message */}
              {loginErrors.general && (
                <div className="flex items-center space-x-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{loginErrors.general}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-phone" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.phone')}
                </Label>
                <KuwaitPhoneInput
                  value={loginPhone}
                  onChange={handleLoginPhoneChange}
                  placeholder={t('auth.phonePlaceholder')}
                  className={loginErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {loginErrors.phone && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{loginErrors.phone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.password')}
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={handleLoginPasswordChange}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={`${language === 'ar' ? 'font-arabic' : ''} ${loginErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {loginErrors.password && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{loginErrors.password}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-red-600 text-white hover:bg-brand-red-700 hover:shadow-glow transition-all duration-300 font-semibold py-3"
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
                  className="border-brand-red-200 hover:border-brand-red-600 hover:bg-brand-red-50 transition-all duration-300"
                >
                  <img src={apple} alt="Apple" className="mr-2 h-5 w-4" />
                  Apple
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="border-brand-red-200 hover:border-brand-red-600 hover:bg-brand-red-50 transition-all duration-300"
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
              {/* General error message */}
              {signupErrors.general && (
                <div className="flex items-center space-x-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{signupErrors.general}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-name" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.fullName')}
                </Label>
                <Input
                  id="signup-name"
                  value={signupName}
                  onChange={handleSignupNameChange}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className={`${language === 'ar' ? 'font-arabic' : ''} ${signupErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {signupErrors.name && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{signupErrors.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.phone')}
                </Label>
                <KuwaitPhoneInput
                  value={signupPhone}
                  onChange={handleSignupPhoneChange}
                  placeholder={t('auth.phonePlaceholder')}
                  className={signupErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {signupErrors.phone && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{signupErrors.phone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.password')}
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={handleSignupPasswordChange}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={`${language === 'ar' ? 'font-arabic' : ''} ${signupErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {signupErrors.password && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{signupErrors.password}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className={language === 'ar' ? 'font-arabic' : ''}>
                  {t('auth.confirmPassword')}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  className={`${language === 'ar' ? 'font-arabic' : ''} ${signupErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {signupErrors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{signupErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={handleTermsChange}
                    className={signupErrors.terms ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="terms" className={`text-sm ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {t('auth.agreeToTerms')}
                  </Label>
                </div>
                {signupErrors.terms && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{signupErrors.terms}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-red-600 text-white hover:bg-brand-red-700 hover:shadow-glow transition-all duration-300 font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className={language === 'ar' ? 'font-arabic' : ''}>{t('auth.createAccount')}</span>
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
                  className="border-brand-red-200 hover:border-brand-red-600 hover:bg-brand-red-50 transition-all duration-300"
                >
                  <Apple className="mr-2 h-4 w-4" />
                  Apple
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="border-brand-red-200 hover:border-brand-red-600 hover:bg-brand-red-50 transition-all duration-300"
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
        </Tabs>

        <p className={`text-xs text-center text-muted-foreground mt-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('auth.demoDisclaimer')}
        </p>
      </DialogContent>
    </Dialog>
  );
};