import IconPicker, { IconPreview } from '@/components/admin/icon-picker';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import { InputError } from '@/components/admin/ui/input-error';
import { Label } from '@/components/admin/ui/label';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, useForm } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Tag, Upload, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/admin/categories',
    },
    {
        title: 'Create',
        href: '/admin/categories/create',
    },
];

export default function CreateCategory() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name_en: '',
        name_ar: '',
        icon: null as File | null,
        icon_name: '',
        status: 'active' as 'active' | 'inactive',
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Use global error handler
    useErrorHandler();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('icon', file);

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeFile = () => {
        setData('icon', null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        // Reset file input
        const fileInput = document.getElementById('icon') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/categories', {
            onSuccess: () => {
                reset();
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }
            },
            forceFormData: true, // Important for file uploads
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <InertiaLink href="/admin/categories">
                            <ArrowLeft className="h-4 w-4" />
                        </InertiaLink>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
                        <p className="text-muted-foreground">Add a new product category</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Tag className="mr-2 h-5 w-5" />
                            Category Information
                        </CardTitle>
                        <CardDescription>Enter the category details below</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* English Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name_en">English Name *</Label>
                                    <Input
                                        id="name_en"
                                        type="text"
                                        value={data.name_en}
                                        onChange={(e) => setData('name_en', e.target.value)}
                                        placeholder="Enter category name in English"
                                        className={errors.name_en ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.name_en} />
                                </div>

                                {/* Arabic Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name_ar">Arabic Name *</Label>
                                    <Input
                                        id="name_ar"
                                        type="text"
                                        value={data.name_ar}
                                        onChange={(e) => setData('name_ar', e.target.value)}
                                        placeholder="Enter category name in Arabic"
                                        className={errors.name_ar ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.name_ar} />
                                </div>

                                {/* Icon (Lucide) */}
                                <div className="space-y-2">
                                    <Label htmlFor="icon_name">Icon (Lucide)</Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="icon_name"
                                            type="text"
                                            placeholder="e.g. ShoppingBag"
                                            value={data.icon_name}
                                            onChange={(e) => setData('icon_name', e.target.value)}
                                            className="flex-1"
                                        />
                                        <IconPicker
                                            value={data.icon_name}
                                            onChange={(name: string | null) => setData('icon_name', name || '')}
                                            trigger={
                                                <Button type="button" variant="outline">
                                                    <div className="flex items-center gap-2">
                                                        <IconPreview name={data.icon_name} className="h-4 w-4" />
                                                        <span>Pick</span>
                                                    </div>
                                                </Button>
                                            }
                                            title="Select a Lucide icon"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            {/* Icon Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="icon">Category Icon</Label>
                                <div className="space-y-4">
                                    {/* File Input */}
                                    <div className="flex w-full items-center justify-center">
                                        <label
                                            htmlFor="icon"
                                            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                                <Upload className="mb-2 h-8 w-8 text-gray-500" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, JPEG or WEBP (MAX. 2MB after compression)</p>
                                            </div>
                                            <input id="icon" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>

                                    {/* Preview */}
                                    {previewUrl && (
                                        <div className="relative inline-block">
                                            <div className="flex items-center space-x-4 rounded-lg border bg-gray-50 p-4">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-white">
                                                    <img src={previewUrl} alt="Preview" className="h-12 w-12 object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{data.icon?.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {data.icon ? `${(data.icon.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={removeFile}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* No file selected */}
                                    {!previewUrl && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <ImageIcon className="h-4 w-4" />
                                            <span>No icon selected</span>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.icon} />
                                <p className="text-muted-foreground text-xs">
                                    Images larger than 2MB will be automatically compressed. Supported formats: JPG, JPEG, PNG, WEBP
                                </p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" asChild>
                                    <InertiaLink href="/admin/categories">Cancel</InertiaLink>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
