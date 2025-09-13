import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/user/ui/card";
import { Input } from "@/components/user/ui/input";
import { Textarea } from "@/components/user/ui/textarea";
import { Label } from "@/components/user/ui/label";
import { Button } from "@/components/user/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/user/ui/select";
import { SellFormData } from "./SellWizard";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ProductDetailsProps {
  formData: SellFormData;
  updateFormData: (data: Partial<SellFormData>) => void;
}

const conditions = [
  { value: 'new', labelKey: 'sell.condition.new' },
  { value: 'like-new', labelKey: 'sell.condition.like-new' },
  { value: 'good', labelKey: 'sell.condition.good' },
  { value: 'fair', labelKey: 'sell.condition.fair' },
];

export const ProductDetails = ({ formData, updateFormData }: ProductDetailsProps) => {
  const { language, t } = useLanguage();
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files);
    const currentImages = formData.images || [];
    const maxImages = 10; // Will be determined by subscription in Step 3
    
    if (currentImages.length + newImages.length <= maxImages) {
      updateFormData({ images: [...currentImages, ...newImages] });
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

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Images Upload */}
      <Card className="p-6">
        <Label className={`text-sm font-medium text-luxury-black mb-3 block ${
          language === 'ar' ? 'font-arabic' : ''
        }`}>
          {t('sell.details.images')} *
        </Label>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-luxury-gold bg-luxury-ivory/50' : 'border-border'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground stroke-[1.5]" />
          <p className={`text-muted-foreground mb-2 ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t('sell.details.drag-drop')}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                handleImageUpload(target.files);
              };
              input.click();
            }}
          >
            <span className={language === 'ar' ? 'font-arabic' : ''}>{t('sell.details.select-images')}</span>
          </Button>
        </div>

        {/* Image Preview */}
        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Product Information */}
      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="title" className={`text-sm font-medium text-luxury-black ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t('sell.details.title')} *
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder={t('sell.details.title.placeholder')}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description" className={`text-sm font-medium text-luxury-black ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t('sell.details.description')} *
          </Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder={t('sell.details.description.placeholder')}
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className={`text-sm font-medium text-luxury-black ${
              language === 'ar' ? 'font-arabic' : ''
            }`}>
              {t('sell.details.condition')} *
            </Label>
            <Select value={formData.condition} onValueChange={(value) => updateFormData({ condition: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('sell.details.condition.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    <span className={language === 'ar' ? 'font-arabic' : ''}>{t(condition.labelKey)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price" className={`text-sm font-medium text-luxury-black ${
              language === 'ar' ? 'font-arabic' : ''
            }`}>
              {t('sell.details.price')} *
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ''}
              onChange={(e) => updateFormData({ price: e.target.value })}
              placeholder="0.00"
              className="mt-1"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location" className={`text-sm font-medium text-luxury-black ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t('sell.details.location')} *
          </Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => updateFormData({ location: e.target.value })}
            placeholder={t('sell.details.location.placeholder')}
            className="mt-1"
          />
        </div>
      </Card>

      {/* Category Display */}
      <Card className="p-4 bg-luxury-ivory/50">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium text-luxury-black ${
            language === 'ar' ? 'font-arabic' : ''
          }`}>
            {t('sell.details.category')}: {formData.category ? t(`category.${formData.category}`) : ''}
          </span>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <span className={language === 'ar' ? 'font-arabic' : ''}>{t('sell.details.change-category')}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};