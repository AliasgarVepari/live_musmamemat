import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface KuwaitPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const KuwaitPhoneInput = ({ value, onChange, placeholder, className }: KuwaitPhoneInputProps) => {
  const { language, t } = useLanguage();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formatDisplay = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format as XXXX XXXX for display if we have enough digits
    if (digits.length >= 4) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
    }
    return digits;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Handle paste events with +965 prefix
    if (input.startsWith('+965')) {
      input = input.slice(4);
    }
    
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Limit to 8 digits
    const limitedDigits = digits.slice(0, 8);
    
    // Update display value with formatting
    setDisplayValue(formatDisplay(limitedDigits));
    
    // Call onChange with raw digits
    onChange(limitedDigits);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // On focus, show unformatted value for easier editing
    setDisplayValue(value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // On blur, show formatted value
    setDisplayValue(formatDisplay(value));
  };

  const isValid = value.length === 8;
  const hasError = value.length > 0 && !isValid;

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Badge variant="secondary" className="text-xs font-mono bg-muted text-muted-foreground">
            +965
          </Badge>
        </div>
        <Input
          type="tel"
          dir="ltr"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pl-16 font-mono ${hasError ? 'border-destructive' : ''} ${className}`}
          maxLength={9} // Allow for space formatting
        />
      </div>
      {hasError && (
        <p className={`text-xs text-destructive ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('auth.phoneError')}
        </p>
      )}
    </div>
  );
};