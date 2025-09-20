import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { FileUpload } from '@/components/admin/ui/file-upload';
import { Label } from '@/components/admin/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
    },
    {
        title: 'Edit Banner',
        href: '/admin/banners/edit',
    },
];

interface Banner {
    id: number;
    image_url_en: string;
    image_url_ar: string;
    position: 'top' | 'bottom';
    status: 'active' | 'inactive' | 'delete';
    is_approved: boolean;
    click_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    banner: Banner;
}

export default function Edit({ banner }: Props) {
    const { data, setData, processing, errors } = useForm({
        image_en: null as File | null,
        image_ar: null as File | null,
        position: banner.position,
        status: banner.status === 'delete' ? 'inactive' : banner.status,
    });

    const [previewEn, setPreviewEn] = useState<string | null>(null);
    const [previewAr, setPreviewAr] = useState<string | null>(null);
    const [showCurrentImageEn, setShowCurrentImageEn] = useState(true);
    const [showCurrentImageAr, setShowCurrentImageAr] = useState(true);

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

        router.post(
            `/admin/banners/${banner.id}`,
            {
                _method: 'put',
                image_en: data.image_en,
                image_ar: data.image_ar,
                position: data.position,
                status: data.status,
            },
            {
                forceFormData: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Banner" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
                        <p className="text-gray-600">Update banner details and settings</p>
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
                                    <Label htmlFor="image_en">New English Image (optional)</Label>
                                    <FileUpload
                                        label="Upload Image"
                                        onFileSelect={(file) => handleImageChange(file, 'en')}
                                        accept=".png,.jpg,.jpeg,.gif,.svg"
                                        className="mt-1"
                                    />
                                    {errors.image_en && <p className="mt-1 text-sm text-red-600">{errors.image_en}</p>}
                                </div>

                                {/* Current English Image */}
                                {showCurrentImageEn && (
                                    <div className="space-y-2">
                                        <Label>Current English Image</Label>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={banner.image_url_en} alt="Current English banner" className="h-full w-full object-cover" />
                                        </div>
                                        <p className="text-center text-sm text-gray-600">To change this image, upload or drag a new image above</p>
                                    </div>
                                )}

                                {/* New English Image Preview */}
                                {previewEn && (
                                    <div className="space-y-2">
                                        <Label>New English Image Preview</Label>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={previewEn} alt="New English banner preview" className="h-full w-full object-cover" />
                                        </div>
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
                                    <Label htmlFor="image_ar">New Arabic Image (optional)</Label>
                                    <FileUpload
                                        label="Upload Image"
                                        onFileSelect={(file) => handleImageChange(file, 'ar')}
                                        accept=".png,.jpg,.jpeg,.gif,.svg"
                                        className="mt-1"
                                    />
                                    {errors.image_ar && <p className="mt-1 text-sm text-red-600">{errors.image_ar}</p>}
                                </div>

                                {/* Current Arabic Image */}
                                {showCurrentImageAr && (
                                    <div className="space-y-2">
                                        <Label>Current Arabic Image</Label>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={banner.image_url_ar} alt="Current Arabic banner" className="h-full w-full object-cover" />
                                        </div>
                                        <p className="text-center text-sm text-gray-600">To change this image, upload or drag a new image above</p>
                                    </div>
                                )}

                                {/* New Arabic Image Preview */}
                                {previewAr && (
                                    <div className="space-y-2">
                                        <Label>New Arabic Image Preview</Label>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={previewAr} alt="New Arabic banner preview" className="h-full w-full object-cover" />
                                        </div>
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                            {/* Banner Stats */}
                            <div className="border-t pt-4">
                                <h4 className="mb-2 font-medium text-gray-900">Banner Statistics</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Clicks:</span>
                                        <span className="ml-2 font-medium">{banner.click_count}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Created:</span>
                                        <span className="ml-2 font-medium">{new Date(banner.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Banner'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
