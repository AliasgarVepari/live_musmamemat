import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/user/ui/card";
import { Input } from "@/components/user/ui/input";
import { Textarea } from "@/components/user/ui/textarea";
import { Label } from "@/components/user/ui/label";
import { Button } from "@/components/user/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/user/ui/select";
import { Switch } from "@/components/user/ui/switch";
import { SellFormData } from "@/pages/user/SellWizard";
import { Upload, X, Image as ImageIcon, AlertCircle, Plus, Check } from "lucide-react";

interface ProductDetailsProps {
  formData: SellFormData;
  updateFormData: (data: Partial<SellFormData>) => void;
  isSubmitting?: boolean;
}

interface Option {
  id: number;
  name_en: string;
  name_ar: string;
}

export const ProductDetails = ({ formData, updateFormData, isSubmitting = false }: ProductDetailsProps) => {
  const { language, t } = useLanguage();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug: Log form data changes
  useEffect(() => {
    console.log('ProductDetails formData changed:', formData);
  }, [formData]);
  
  // State for bullet points
  const [bulletPointsEn, setBulletPointsEn] = useState<string[]>([]);
  const [bulletPointsAr, setBulletPointsAr] = useState<string[]>([]);
  const [newBulletEn, setNewBulletEn] = useState('');
  const [newBulletAr, setNewBulletAr] = useState('');
  
  // API data
  const [conditions, setConditions] = useState<Option[]>([]);
  const [governorates, setGovernorates] = useState<Option[]>([]);
  const [priceTypes, setPriceTypes] = useState<Option[]>([]);

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [conditionsRes, governoratesRes, priceTypesRes] = await Promise.all([
          fetch('/api/user/conditions'),
          fetch('/api/user/governorates'),
          fetch('/api/user/price-types')
        ]);

        const [conditionsData, governoratesData, priceTypesData] = await Promise.all([
          conditionsRes.json(),
          governoratesRes.json(),
          priceTypesRes.json()
        ]);

        // Handle different response structures
        setConditions(conditionsData.conditions || conditionsData || []);
        setGovernorates(governoratesData.governorates || governoratesData || []);
        setPriceTypes(priceTypesData.priceTypes || priceTypesData.price_types || priceTypesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays on error to prevent map errors
        setConditions([]);
        setGovernorates([]);
        setPriceTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Restore bullet points from form data when component mounts or form data changes
  useEffect(() => {
    if (formData.product_details_en) {
      const points = formData.product_details_en.split('\n').filter(point => point.trim());
      setBulletPointsEn(points);
    }
    if (formData.product_details_ar) {
      const points = formData.product_details_ar.split('\n').filter(point => point.trim());
      setBulletPointsAr(points);
    }
  }, [formData.product_details_en, formData.product_details_ar]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files);
    const currentImages = formData.images || [];
    const maxImages = 10; // Will be determined by subscription in Step 3
    
    if (currentImages.length + newImages.length <= maxImages) {
      // Convert new images to base64 for storage
      const base64Images = await Promise.all(
        newImages.map(file => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }))
      );
      
      updateFormData({ images: [...currentImages, ...base64Images] });
    }
  };

  const removeImage = (index: number) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title_en':
        if (!value || value.trim().length < 3) {
          newErrors.title_en = language === 'ar' ? 'العنوان الإنجليزي مطلوب (3 أحرف على الأقل)' : 'English title is required (minimum 3 characters)';
        } else {
          delete newErrors.title_en;
        }
        break;
      case 'title_ar':
        if (!value || value.trim().length < 3) {
          newErrors.title_ar = language === 'ar' ? 'العنوان العربي مطلوب (3 أحرف على الأقل)' : 'Arabic title is required (minimum 3 characters)';
        } else {
          delete newErrors.title_ar;
        }
        break;
      case 'description_en':
        if (!value || value.trim().length < 10) {
          newErrors.description_en = language === 'ar' ? 'الوصف الإنجليزي مطلوب (10 أحرف على الأقل)' : 'English description is required (minimum 10 characters)';
        } else {
          delete newErrors.description_en;
        }
        break;
      case 'description_ar':
        if (!value || value.trim().length < 10) {
          newErrors.description_ar = language === 'ar' ? 'الوصف العربي مطلوب (10 أحرف على الأقل)' : 'Arabic description is required (minimum 10 characters)';
        } else {
          delete newErrors.description_ar;
        }
        break;
      case 'price':
        if (!value || isNaN(Number(value)) || Number(value) < 0) {
          newErrors.price = language === 'ar' ? 'السعر مطلوب ويجب أن يكون رقم صحيح' : 'Price is required and must be a valid number';
        } else {
          delete newErrors.price;
        }
        break;
      case 'condition_id':
        if (!value) {
          newErrors.condition_id = language === 'ar' ? 'حالة المنتج مطلوبة' : 'Product condition is required';
        } else {
          delete newErrors.condition_id;
        }
        break;
      case 'governorate_id':
        if (!value) {
          newErrors.governorate_id = language === 'ar' ? 'الموقع مطلوب' : 'Location is required';
        } else {
          delete newErrors.governorate_id;
        }
        break;
      case 'price_type_id':
        if (!value) {
          newErrors.price_type_id = language === 'ar' ? 'نوع السعر مطلوب' : 'Price type is required';
        } else {
          delete newErrors.price_type_id;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: any) => {
    console.log('ProductDetails handleInputChange:', field, value);
    updateFormData({ [field]: value });
    validateField(field, value);
  };

  // Bullet points functions
  const addBulletPoint = (language: 'en' | 'ar') => {
    const newBullet = language === 'en' ? newBulletEn : newBulletAr;
    if (newBullet.trim()) {
      if (language === 'en') {
        const updated = [...bulletPointsEn, newBullet.trim()];
        setBulletPointsEn(updated);
        setNewBulletEn('');
        updateFormData({ product_details_en: updated.join('\n') });
      } else {
        const updated = [...bulletPointsAr, newBullet.trim()];
        setBulletPointsAr(updated);
        setNewBulletAr('');
        updateFormData({ product_details_ar: updated.join('\n') });
      }
    }
  };

  const removeBulletPoint = (index: number, language: 'en' | 'ar') => {
    if (language === 'en') {
      const updated = bulletPointsEn.filter((_, i) => i !== index);
      setBulletPointsEn(updated);
      updateFormData({ product_details_en: updated.join('\n') });
    } else {
      const updated = bulletPointsAr.filter((_, i) => i !== index);
      setBulletPointsAr(updated);
      updateFormData({ product_details_ar: updated.join('\n') });
    }
  };

  const getOptionName = (option: Option) => {
    return language === 'ar' ? option.name_ar : option.name_en;
  };

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Product Title - English */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'عنوان المنتج (إنجليزي)' : 'Product Title (English)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input
              value={formData.title_en || ''}
              onChange={(e) => handleInputChange('title_en', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل عنوان المنتج بالإنجليزية' : 'Enter product title in English'}
              className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.title_en ? 'border-red-500' : ''}`}
            />
            {errors.title_en && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.title_en}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Title - Arabic */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'عنوان المنتج (عربي)' : 'Product Title (Arabic)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input
              value={formData.title_ar || ''}
              onChange={(e) => handleInputChange('title_ar', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل عنوان المنتج بالعربية' : 'Enter product title in Arabic'}
              className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.title_ar ? 'border-red-500' : ''}`}
              dir="rtl"
            />
            {errors.title_ar && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.title_ar}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description - English */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'وصف المنتج (إنجليزي)' : 'Product Description (English)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              value={formData.description_en || ''}
              onChange={(e) => handleInputChange('description_en', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل وصف المنتج بالإنجليزية' : 'Enter product description in English'}
              className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.description_en ? 'border-red-500' : ''}`}
              rows={4}
            />
            {errors.description_en && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.description_en}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description - Arabic */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'وصف المنتج (عربي)' : 'Product Description (Arabic)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              value={formData.description_ar || ''}
              onChange={(e) => handleInputChange('description_ar', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل وصف المنتج بالعربية' : 'Enter product description in Arabic'}
              className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.description_ar ? 'border-red-500' : ''}`}
              rows={4}
              dir="rtl"
            />
            {errors.description_ar && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.description_ar}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Details - English */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'تفاصيل المنتج (إنجليزي)' : 'Product Details (English)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bullet Points List */}
            <div className="space-y-2">
              {bulletPointsEn.map((point, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="flex-1 text-sm">{point}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBulletPoint(index, 'en')}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Add New Bullet Point */}
            <div className="flex gap-2">
              <Input
                value={newBulletEn}
                onChange={(e) => setNewBulletEn(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل تفصيل جديد' : 'Enter new detail'}
                className="flex-1 border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600"
                onKeyPress={(e) => e.key === 'Enter' && addBulletPoint('en')}
              />
          <Button
                type="button"
                onClick={() => addBulletPoint('en')}
                className="bg-brand-red-600 hover:bg-brand-red-700"
                disabled={!newBulletEn.trim()}
              >
                <Plus className="h-4 w-4" />
          </Button>
        </div>

            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'يمكنك إضافة تفاصيل مثل المواصفات، الأبعاد، الماركة، إلخ' : 'Add details like specifications, dimensions, brand, etc.'}
            </p>
                </div>
        </CardContent>
      </Card>

      {/* Product Details - Arabic */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'تفاصيل المنتج (عربي)' : 'Product Details (Arabic)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bullet Points List */}
            <div className="space-y-2">
              {bulletPointsAr.map((point, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className={`flex-1 text-sm ${language === 'ar' ? 'font-arabic' : ''}`}>{point}</span>
                <Button
                    type="button"
                    variant="ghost"
                  size="sm"
                    onClick={() => removeBulletPoint(index, 'ar')}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
            
            {/* Add New Bullet Point */}
            <div className="flex gap-2">
              <Input
                value={newBulletAr}
                onChange={(e) => setNewBulletAr(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل تفصيل جديد' : 'Enter new detail'}
                className="flex-1 border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600"
                dir="rtl"
                onKeyPress={(e) => e.key === 'Enter' && addBulletPoint('ar')}
              />
              <Button
                type="button"
                onClick={() => addBulletPoint('ar')}
                className="bg-brand-red-600 hover:bg-brand-red-700"
                disabled={!newBulletAr.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar' ? 'يمكنك إضافة تفاصيل مثل المواصفات، الأبعاد، الماركة، إلخ' : 'Add details like specifications, dimensions, brand, etc.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Price and Condition Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
              {language === 'ar' ? 'السعر' : 'Price'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
          <Input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder={language === 'ar' ? 'أدخل السعر' : 'Enter price'}
                className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.price ? 'border-red-500' : ''}`}
                min="0"
                step="0.01"
              />
              {errors.price && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.price}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card>
          <CardHeader>
            <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
              {language === 'ar' ? 'حالة المنتج' : 'Product Condition'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select
                value={formData.condition_id?.toString() || ''}
                onValueChange={(value) => handleInputChange('condition_id', parseInt(value))}
              >
                <SelectTrigger className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.condition_id ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={language === 'ar' ? 'اختر حالة المنتج' : 'Select condition'} />
                </SelectTrigger>
                <SelectContent>
                  {conditions && conditions.length > 0 ? conditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id.toString()}>
                      {getOptionName(condition)}
                    </SelectItem>
                  )) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.condition_id && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.condition_id}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>

      {/* Location and Price Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
              {language === 'ar' ? 'الموقع' : 'Location'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select
                value={formData.governorate_id?.toString() || ''}
                onValueChange={(value) => handleInputChange('governorate_id', parseInt(value))}
              >
                <SelectTrigger className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.governorate_id ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الموقع' : 'Select location'} />
                </SelectTrigger>
                <SelectContent>
                  {governorates && governorates.length > 0 ? governorates.map((governorate) => (
                    <SelectItem key={governorate.id} value={governorate.id.toString()}>
                      {getOptionName(governorate)}
                    </SelectItem>
                  )) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.governorate_id && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.governorate_id}</span>
                </div>
              )}
        </div>
          </CardContent>
        </Card>

        {/* Price Type */}
        <Card>
          <CardHeader>
            <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
              {language === 'ar' ? 'نوع السعر' : 'Price Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select
                value={formData.price_type_id?.toString() || ''}
                onValueChange={(value) => handleInputChange('price_type_id', parseInt(value))}
              >
                <SelectTrigger className={`border-brand-red-200 focus:border-brand-red-600 focus:ring-brand-red-600 ${errors.price_type_id ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={language === 'ar' ? 'اختر نوع السعر' : 'Select price type'} />
              </SelectTrigger>
              <SelectContent>
                  {priceTypes && priceTypes.length > 0 ? priceTypes.map((priceType) => (
                    <SelectItem key={priceType.id} value={priceType.id.toString()}>
                      {getOptionName(priceType)}
                  </SelectItem>
                  )) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  )}
              </SelectContent>
            </Select>
              {errors.price_type_id && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className={language === 'ar' ? 'font-arabic' : ''}>{errors.price_type_id}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </div>

      {/* Negotiable Switch */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'السعر قابل للتفاوض' : 'Price Negotiable'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="negotiable"
              checked={formData.is_negotiable || false}
              onCheckedChange={(checked) => handleInputChange('is_negotiable', checked)}
            />
            <Label htmlFor="negotiable" className={language === 'ar' ? 'font-arabic' : ''}>
              {language === 'ar' ? 'السعر قابل للتفاوض' : 'Price is negotiable'}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Images Upload */}
      <Card>
        <CardHeader>
          <CardTitle className={language === 'ar' ? 'font-arabic' : ''}>
            {language === 'ar' ? 'صور المنتج' : 'Product Images'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : (!formData.images || formData.images.length === 0)
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className={`mx-auto h-12 w-12 mb-4 ${
              (!formData.images || formData.images.length === 0) 
                ? 'text-amber-500' 
                : 'text-muted-foreground'
            }`} />
            <p className={`text-lg font-medium mb-2 ${language === 'ar' ? 'font-arabic' : ''} ${
              (!formData.images || formData.images.length === 0) 
                ? 'text-amber-700' 
                : ''
            }`}>
              {language === 'ar' ? 'اسحب الصور هنا أو انقر للرفع' : 'Drag images here or click to upload'}
            </p>
            <p className={`text-sm text-muted-foreground mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar' ? 'PNG, JPG, GIF حتى 5MB لكل صورة' : 'PNG, JPG, GIF up to 5MB each'}
            </p>
            <input
              type="file"
              multiple
              accept=".jpeg,.jpg,.png,.gif"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <Button asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                {language === 'ar' ? 'اختر الصور' : 'Choose Images'}
              </label>
          </Button>
        </div>

        {/* Image Validation Message */}
        {(!formData.images || formData.images.length === 0) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className={language === 'ar' ? 'font-arabic' : ''}>
              {language === 'ar' ? 'يجب رفع صورة واحدة على الأقل' : 'At least one image is required'}
            </span>
          </div>
        )}

          {/* Image Preview */}
          {formData.images && formData.images.length > 0 && (
            <div className="mt-6">
              <h4 className={`text-sm font-medium mb-3 ${language === 'ar' ? 'font-arabic' : ''}`}>
                {language === 'ar' ? 'الصور المرفوعة' : 'Uploaded Images'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => {
                  // Handle both File objects and base64 strings (from localStorage)
                  const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;
                  return (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback for invalid images
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className={`text-lg font-medium ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
            </p>
            <p className={`text-sm text-muted-foreground text-center ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar' ? 'يرجى الانتظار بينما نقوم بحفظ إعلانك' : 'Please wait while we save your listing'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};