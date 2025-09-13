import React, { createContext, useContext, useState } from 'react';

interface LanguageContextType {
  language: 'ar' | 'en';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Auth translations
    'auth.welcome': 'مرحباً',
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.phone': 'رقم الهاتف',
    'auth.phonePlaceholder': '12345678',
    'auth.phoneError': 'أدخل رقم كويتي مكون من 8 أرقام',
    'auth.password': 'كلمة المرور',
    'auth.passwordPlaceholder': 'أدخل كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.fullNamePlaceholder': 'أدخل اسمك الكامل',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.confirmPasswordPlaceholder': 'أكد كلمة المرور',
    'auth.agreeToTerms': 'أوافق على الشروط والأحكام',
    'auth.continue': 'متابعة',
    'auth.createAccount': 'إنشاء حساب',
    'auth.orContinueWith': 'أو تابع باستخدام',
    'auth.verifyPhone': 'تحقق من رقم الهاتف',
    'auth.enterOTP': 'أدخل الرمز المكون من 6 أرقام',
    'auth.otpSentTo': 'أرسلنا رمز التحقق إلى:',
    'auth.verify': 'تحقق',
    'auth.didntReceiveCode': 'لم تستلم الرمز؟',
    'auth.resendOTP': 'إعادة إرسال الرمز',
    'auth.resendIn': 'إعادة الإرسال خلال',
    'auth.editPhone': 'تعديل رقم الهاتف',
    'auth.otpResent': 'تم إعادة إرسال الرمز',
    'auth.otpResentDescription': 'تم إرسال رمز تحقق جديد',
    'auth.demoDisclaimer': 'نموذج فقط — لم يتم إنشاء حساب أو رمز حقيقي.',
    'auth.error': 'خطأ',
    'auth.invalidCredentials': 'يرجى التحقق من رقم الهاتف وكلمة المرور',
    'auth.loginFailed': 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    'auth.fillAllFields': 'يرجى ملء جميع الحقول المطلوبة',
    'auth.passwordMismatch': 'كلمات المرور غير متطابقة',
    'auth.agreeTerms': 'يرجى الموافقة على الشروط والأحكام',
    'auth.signupFailed': 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    'auth.invalidOTP': 'يرجى إدخال رمز صحيح مكون من 6 أرقام',
    'auth.verificationFailed': 'فشل التحقق. يرجى المحاولة مرة أخرى.',
    'auth.logout': 'تسجيل الخروج',

    // Header
    'search.placeholder': 'البحث عن المنتجات...',
    'brand.name': 'Live M9memat',
    
    // Hero
    'hero.badge': 'سوق راقي للأشياء المستعملة',
    'hero.title': 'اكتشفي الجمال',
    'hero.subtitle': 'منصة راقية لبيع وشراء المنتجات المستعملة بجودة عالية',
    'hero.cta.shop': 'تسوقي الآن',
    'hero.cta.sell': 'ابدئي البيع',
    
    // Categories
    'categories.title': 'تسوقي حسب الفئة',
    'categories.subtitle': 'اكتشفي مجموعة منتقاة من أفضل القطع المستعملة',
    'category.handbags': 'الحقائب',
    'category.clothing': 'الملابس',
    'category.jewelry': 'المجوهرات',
    'category.beauty': 'الجمال والعناية',
    'category.accessories': 'الإكسسوارات',
    'category.children': 'الأطفال',
    'category.toys': 'الألعاب',
    'category.electronics': 'الإلكترونيات',
    'category.travel': 'السفر',
    'category.home': 'المنزل',
    'category.watches': 'الساعات',
    'category.favorites': 'المفضلة',
    'products.count': 'منتج',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.shop': 'تسوق',
    'nav.payments': 'المدفوعات',
    'nav.cashback': 'كاش باك',
    'nav.account': 'حسابي',
    
    // Selling Wizard
    'sell.wizard.title': 'إنشاء إعلان جديد',
    'sell.wizard.step': 'الخطوة',
    'sell.wizard.of': 'من',
    'sell.wizard.back': 'السابق',
    'sell.wizard.continue': 'التالي',
    'sell.wizard.submit': 'إرسال',
    'sell.step1.title': 'اختاري الفئة',
    'sell.step1.title.subtitle': 'اختاري الفئة المناسبة لمنتجك',
    'sell.step2.title': 'تفاصيل المنتج',
    'sell.step2.title.subtitle': 'أضيفي تفاصيل وصور منتجك',
    'sell.step3.title': 'اختاري باقة',
    'sell.step3.title.subtitle': 'اختاري الباقة المناسبة لإعلانك',
    'sell.step4.title': 'تم الإرسال',
    'sell.step4.title.subtitle': 'تم إرسال إعلانك بنجاح',
    'sell.category.selected': 'الفئة المختارة',
    'sell.details.images': 'الصور',
    'sell.details.drag-drop': 'اسحبي الصور هنا أو اضغطي لاختيارها',
    'sell.details.select-images': 'اختيار الصور',
    'sell.details.title': 'عنوان المنتج',
    'sell.details.title.placeholder': 'مثال: حقيبة شانيل كلاسيكية',
    'sell.details.description': 'الوصف',
    'sell.details.description.placeholder': 'اكتبي وصفاً مفصلاً عن المنتج...',
    'sell.details.condition': 'الحالة',
    'sell.details.condition.placeholder': 'اختاري حالة المنتج',
    'sell.details.price': 'السعر (د.ك)',
    'sell.details.location': 'الموقع',
    'sell.details.location.placeholder': 'مثال: الجهراء، الكويت',
    'sell.details.category': 'الفئة',
    'sell.details.change-category': 'تغيير الفئة',
    'sell.condition.new': 'جديد',
    'sell.condition.like-new': 'مثل الجديد',
    'sell.condition.good': 'جيد',
    'sell.condition.fair': 'مقبول',
    'sell.subscription.free.name': 'باقة مجانية',
    'sell.subscription.free.price': 'مجاناً',
    'sell.subscription.silver.name': 'باقة فضية',
    'sell.subscription.silver.price': '10 د.ك/شهر',
    'sell.subscription.gold.name': 'باقة ذهبية',
    'sell.subscription.gold.price': '25 د.ك/شهر',
    'sell.subscription.popular': 'الأكثر شعبية',
    'sell.subscription.image-limit': 'حد الصور',
    'sell.subscription.image-limit-exceeded': 'عدد الصور يتجاوز الحد المسموح',
    'sell.subscription.current-images': 'الصور الحالية',
    'sell.subscription.selected': 'مختارة',
    'sell.subscription.select': 'اختيار',
    'sell.subscription.free.feature1': '3 إعلانات مجانية',
    'sell.subscription.free.feature2': 'مدة عرض 30 يوم',
    'sell.subscription.free.feature3': 'ظهور عادي',
    'sell.subscription.silver.feature1': '10 إعلانات شهرياً',
    'sell.subscription.silver.feature2': 'مدة عرض 60 يوم',
    'sell.subscription.silver.feature3': 'ظهور محسن',
    'sell.subscription.silver.feature4': 'دعم أولوية',
    'sell.subscription.gold.feature1': 'إعلانات غير محدودة',
    'sell.subscription.gold.feature2': 'ظهور في الصفحة الرئيسية',
    'sell.subscription.gold.feature3': 'أولوية في البحث',
    'sell.subscription.gold.feature4': 'تمييز بالذهبي',
    'sell.subscription.gold.feature5': 'دعم مخصص 24/7',
    'sell.success.title': 'تم إرسال إعلانك بنجاح!',
    'sell.success.message': 'تم إرسال إعلانك للمراجعة من قبل فريق الإدارة. ستصلك رسالة تأكيد عند الموافقة على الإعلان.',
    'sell.success.next-steps': 'الخطوات التالية:',
    'sell.success.step1': 'مراجعة إدارية (1-2 يوم عمل)',
    'sell.success.step2': 'إشعار بالموافقة أو طلب تعديل',
    'sell.success.step3': 'نشر الإعلان وبدء العرض',
    'sell.success.view-listings': 'مشاهدة إعلاناتي',
    'sell.success.create-another': 'إنشاء إعلان آخر',
    
    // Footer
    'footer.description': 'منصة راقية لبيع وشراء المنتجات المستعملة بجودة عالية في الكويت',
    'footer.quicklinks': 'روابط سريعة',
    'footer.contact': 'اتصل بنا',
    'footer.menu': 'القائمة',
    'footer.status': 'حالة الطلب',
    'footer.about': 'من نحن',
    'footer.branches': 'الفروع',
    'footer.location': 'الكويت، مدينة الكويت',
    'footer.rights': '© 2024 Live M9memat - جميع الحقوق محفوظة'
  },
  en: {
    // Auth translations
    'auth.welcome': 'Welcome',
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.phone': 'Phone Number',
    'auth.phonePlaceholder': '12345678',
    'auth.phoneError': 'Enter an 8-digit Kuwait number',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.fullName': 'Full Name',
    'auth.fullNamePlaceholder': 'Enter your full name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.agreeToTerms': 'I agree to the Terms & Conditions',
    'auth.continue': 'Continue',
    'auth.createAccount': 'Create Account',
    'auth.orContinueWith': 'or continue with',
    'auth.verifyPhone': 'Verify Phone Number',
    'auth.enterOTP': 'Enter 6-digit code',
    'auth.otpSentTo': 'We sent a verification code to:',
    'auth.verify': 'Verify',
    'auth.didntReceiveCode': "Didn't receive the code?",
    'auth.resendOTP': 'Resend Code',
    'auth.resendIn': 'Resend in',
    'auth.editPhone': 'Edit phone number',
    'auth.otpResent': 'Code Resent',
    'auth.otpResentDescription': 'A new verification code has been sent',
    'auth.demoDisclaimer': 'Demo only — no real account or OTP is created.',
    'auth.error': 'Error',
    'auth.invalidCredentials': 'Please check your phone number and password',
    'auth.loginFailed': 'Login failed. Please try again.',
    'auth.fillAllFields': 'Please fill in all required fields',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.agreeTerms': 'Please agree to the Terms & Conditions',
    'auth.signupFailed': 'Sign up failed. Please try again.',
    'auth.invalidOTP': 'Please enter a valid 6-digit code',
    'auth.verificationFailed': 'Verification failed. Please try again.',
    'auth.logout': 'Sign Out',

    // Header
    'search.placeholder': 'Search products...',
    'brand.name': 'Live M9memat',
    
    // Hero
    'hero.badge': 'Luxury Pre-owned Marketplace',
    'hero.title': 'Discover Elegance',
    'hero.subtitle': 'Where luxury meets sustainability in Kuwait\'s premier pre-owned marketplace',
    'hero.cta.shop': 'Shop Now',
    'hero.cta.sell': 'Start Selling',
    
    // Categories
    'categories.title': 'Shop by Category',
    'categories.subtitle': 'Discover our curated collection of premium pre-owned items',
    'category.handbags': 'Handbags',
    'category.clothing': 'Clothing',
    'category.jewelry': 'Jewelry',
    'category.beauty': 'Beauty & Care',
    'category.accessories': 'Accessories',
    'category.children': 'Children',
    'category.toys': 'Toys & Games',
    'category.electronics': 'Electronics',
    'category.travel': 'Travel',
    'category.home': 'Home & Furniture',
    'category.watches': 'Watches',
    'category.favorites': 'Favorites',
    'products.count': 'Products',
    
    // Navigation
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.payments': 'Payments',
    'nav.cashback': 'Cashback',
    'nav.account': 'Account',
    
    // Selling Wizard
    'sell.wizard.title': 'Create New Listing',
    'sell.wizard.step': 'Step',
    'sell.wizard.of': 'of',
    'sell.wizard.back': 'Back',
    'sell.wizard.continue': 'Continue',
    'sell.wizard.submit': 'Submit',
    'sell.step1.title': 'Select Category',
    'sell.step1.title.subtitle': 'Choose the appropriate category for your item',
    'sell.step2.title': 'Product Details',
    'sell.step2.title.subtitle': 'Add details and photos of your item',
    'sell.step3.title': 'Choose Package',
    'sell.step3.title.subtitle': 'Select the right package for your listing',
    'sell.step4.title': 'Submitted',
    'sell.step4.title.subtitle': 'Your listing has been submitted successfully',
    'sell.category.selected': 'Selected Category',
    'sell.details.images': 'Images',
    'sell.details.drag-drop': 'Drag images here or click to select',
    'sell.details.select-images': 'Select Images',
    'sell.details.title': 'Product Title',
    'sell.details.title.placeholder': 'e.g., Classic Chanel Handbag',
    'sell.details.description': 'Description',
    'sell.details.description.placeholder': 'Write a detailed description of your item...',
    'sell.details.condition': 'Condition',
    'sell.details.condition.placeholder': 'Select item condition',
    'sell.details.price': 'Price (KD)',
    'sell.details.location': 'Location',
    'sell.details.location.placeholder': 'e.g., Jahra, Kuwait',
    'sell.details.category': 'Category',
    'sell.details.change-category': 'Change Category',
    'sell.condition.new': 'New',
    'sell.condition.like-new': 'Like New',
    'sell.condition.good': 'Good',
    'sell.condition.fair': 'Fair',
    'sell.subscription.free.name': 'Free Plan',
    'sell.subscription.free.price': 'Free',
    'sell.subscription.silver.name': 'Silver Plan',
    'sell.subscription.silver.price': '10 KD/month',
    'sell.subscription.gold.name': 'Gold Plan',
    'sell.subscription.gold.price': '25 KD/month',
    'sell.subscription.popular': 'Most Popular',
    'sell.subscription.image-limit': 'Image limit',
    'sell.subscription.image-limit-exceeded': 'Image count exceeds the limit',
    'sell.subscription.current-images': 'Current images',
    'sell.subscription.selected': 'Selected',
    'sell.subscription.select': 'Select',
    'sell.subscription.free.feature1': '3 free listings',
    'sell.subscription.free.feature2': '30-day listing duration',
    'sell.subscription.free.feature3': 'Standard visibility',
    'sell.subscription.silver.feature1': '10 listings per month',
    'sell.subscription.silver.feature2': '60-day listing duration',
    'sell.subscription.silver.feature3': 'Enhanced visibility',
    'sell.subscription.silver.feature4': 'Priority support',
    'sell.subscription.gold.feature1': 'Unlimited listings',
    'sell.subscription.gold.feature2': 'Homepage featuring',
    'sell.subscription.gold.feature3': 'Top search priority',
    'sell.subscription.gold.feature4': 'Gold badge highlighting',
    'sell.subscription.gold.feature5': 'Dedicated 24/7 support',
    'sell.success.title': 'Listing Submitted Successfully!',
    'sell.success.message': 'Your listing has been submitted for admin review. You will receive a confirmation message once approved.',
    'sell.success.next-steps': 'Next Steps:',
    'sell.success.step1': 'Admin review (1-2 business days)',
    'sell.success.step2': 'Approval notification or modification request',
    'sell.success.step3': 'Listing goes live and starts appearing',
    'sell.success.view-listings': 'View My Listings',
    'sell.success.create-another': 'Create Another Listing',
    
    // Footer
    'footer.description': 'Kuwait\'s premier luxury pre-owned marketplace',
    'footer.quicklinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.menu': 'Menu',
    'footer.status': 'Order Status',
    'footer.about': 'About Us',
    'footer.branches': 'Branches',
    'footer.location': 'Kuwait City, Kuwait',
    'footer.rights': '© 2024 Live M9memat - All rights reserved'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('preferred-language');
    return (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'ar' ? 'en' : 'ar';
      localStorage.setItem('preferred-language', newLang);
      return newLang;
    });
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === 'ar' ? 'rtl' : 'ltr'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};