import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { FileUpload } from '@/components/admin/ui/file-upload';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, X } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
    },
    {
        title: 'Create Banner',
        href: '/admin/banners/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        image_en: null as File | null,
        image_ar: null as File | null,
        position: 'top' as 'top' | 'bottom',
        status: 'active' as 'active' | 'inactive',
    });

    const [previewEn, setPreviewEn] = useState<string | null>(null);
    const [previewAr, setPreviewAr] = useState<string | null>(null);

    useErrorHandler();

    const handleImageChange = (file: File | null, type: 'en' | 'ar') => {
        if (type === 'en') {
            setData('image_en', file);
            
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewEn(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewEn(null);
            }
        } else {
            setData('image_ar', file);
            
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewAr(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewAr(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/admin/banners', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Banner" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Banner</h1>
                        <p className="text-gray-600">Add a new banner to the site</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* English Image Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>English Banner Image</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="image_en">English Image *</Label>
                                    <FileUpload onFileSelect={(file) => handleImageChange(file, 'en')} accept=".png,.jpg,.jpeg,.gif,.svg" className="mt-1" />
                                    {errors.image_en && <p className="mt-1 text-sm text-red-600">{errors.image_en}</p>}
                                </div>

                                {/* English Image Preview */}
                                {previewEn && (
                                    <div className="space-y-2">
                                        <Label>English Preview</Label>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={previewEn} alt="English banner preview" className="h-full w-full object-cover" />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setData('image_en', null);
                                                setPreviewEn(null);
                                            }}
                                            className="w-full"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Remove English Image
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Arabic Image Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Arabic Banner Image</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="image_ar">Arabic Image *</Label>
                                    <FileUpload onFileSelect={(file) => handleImageChange(file, 'ar')} accept=".png,.jpg,.jpeg,.gif,.svg" className="mt-1" />
                                    {errors.image_ar && <p className="mt-1 text-sm text-red-600">{errors.image_ar}</p>}
                                </div>

                                {/* Arabic Image Preview */}
                                {previewAr && (
                                    <div className="space-y-2">
                                        <Label>Arabic Preview</Label>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={previewAr} alt="Arabic banner preview" className="h-full w-full object-cover" />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setData('image_ar', null);
                                                setPreviewAr(null);
                                            }}
                                            className="w-full"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Remove Arabic Image
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Banner Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Banner Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="position">Position *</Label>
                                    <Select value={data.position} onValueChange={(value: 'top' | 'bottom') => setData('position', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="top">Top</SelectItem>
                                            <SelectItem value="bottom">Bottom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !data.image_en || !data.image_ar}>
                            {processing ? 'Creating...' : 'Create Banner'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
