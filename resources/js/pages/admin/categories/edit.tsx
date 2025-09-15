import IconPicker, { IconPreview } from '@/components/admin/icon-picker';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import { InputError } from '@/components/admin/ui/input-error';
import { Label } from '@/components/admin/ui/label';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Tag, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Category {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    icon_url?: string | null;
    icon_name?: string | null;
    status: 'active' | 'inactive';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/admin/categories',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function EditCategory() {
    const { props } = usePage<{ category: Category }>();
    const category = props.category;

    const { data, setData, put, processing, errors, reset } = useForm({
        name_en: category?.name_en ?? '',
        name_ar: category?.name_ar ?? '',
        icon: null as File | null,
        icon_name: category?.icon_name ?? '',
        status: (category?.status ?? 'active') as 'active' | 'inactive',
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // initial preview is existing icon
    const existingIconUrl = useMemo(() => category?.icon_url ?? null, [category]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('icon', file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const removeFile = () => {
        setData('icon', null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        const input = document.getElementById('icon') as HTMLInputElement | null;
        if (input) input.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/categories/${category.id}`, {
            forceFormData: true,
            onSuccess: () => reset('icon'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Category" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <InertiaLink href="/admin/categories">
                            <ArrowLeft className="h-4 w-4" />
                        </InertiaLink>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                        <p className="text-muted-foreground">Update the category details</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Tag className="mr-2 h-5 w-5" />
                            Category Information
                        </CardTitle>
                        <CardDescription>Change the fields you want and save</CardDescription>
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
                                            onChange={(iconName) => setData('icon_name', iconName || '')}
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

                                {/* Status (radio with green when active) */}
                                <div className="space-y-2">
                                    <Label>Status *</Label>
                                    <div className="flex items-center gap-6">
                                        <label className={`inline-flex items-center gap-2 ${data.status === 'active' ? 'text-green-600' : ''}`}>
                                            <input
                                                type="radio"
                                                name="status"
                                                value="active"
                                                checked={data.status === 'active'}
                                                onChange={() => setData('status', 'active')}
                                                className="h-4 w-4 text-green-600 focus:ring-green-600"
                                            />
                                            <span>Active</span>
                                        </label>
                                        <label className={`inline-flex items-center gap-2 ${data.status === 'inactive' ? 'text-red-600' : ''}`}>
                                            <input
                                                type="radio"
                                                name="status"
                                                value="inactive"
                                                checked={data.status === 'inactive'}
                                                onChange={() => setData('status', 'inactive')}
                                                className="h-4 w-4 text-red-600 focus:ring-red-600"
                                            />
                                            <span>Inactive</span>
                                        </label>
                                    </div>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            {/* Icon Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="icon">Category Icon</Label>
                                <div className="space-y-4">
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
                                                <p className="text-xs text-gray-500">PNG, JPG, JPEG or WEBP (2MB after compression)</p>
                                            </div>
                                            <input id="icon" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>
                                    {/* Preview */}
                                    {(previewUrl || existingIconUrl) && (
                                        <div className="relative inline-block">
                                            <div className="flex items-center space-x-4 rounded-lg border bg-gray-50 p-4">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-white">
                                                    {previewUrl ? (
                                                        <img src={previewUrl} alt="Preview" className="h-12 w-12 object-contain" />
                                                    ) : existingIconUrl ? (
                                                        <img src={existingIconUrl} alt="Existing Icon" className="h-12 w-12 object-contain" />
                                                    ) : (
                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                {data.icon && (
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{data.icon.name}</p>
                                                        <p className="text-xs text-gray-500">{(data.icon.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                )}
                                                {previewUrl && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={removeFile}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.icon as unknown as string} />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <InertiaLink href="/admin/categories">Cancel</InertiaLink>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
