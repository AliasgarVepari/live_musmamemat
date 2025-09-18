import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { Switch } from '@/components/admin/ui/switch';
import { Textarea } from '@/components/admin/ui/textarea';
import { InputError } from '@/components/admin/ui/input-error';
import { ArrowLeft, Save } from 'lucide-react';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';

interface Ad {
    id: number;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    product_details_en: string;
    product_details_ar: string;
    price: number | string;
    status: 'draft' | 'active' | 'inactive' | 'expired' | 'sold' | 'delete';
    is_featured: boolean;
    is_negotiable: boolean;
    is_approved: boolean | null;
    reject_reason?: string | null;
    delete_reason?: string;
    user: {
        id: number;
        name_en: string;
        name_ar: string;
        email: string;
    };
    category: {
        id: number;
        name_en: string;
        name_ar: string;
    };
    priceType?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    condition?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    governorate?: {
        id: number;
        name_en: string;
        name_ar: string;
    } | null;
    adImages: Array<{
        id: number;
        url: string;
        is_primary: boolean;
    }>;
}

interface Category {
    id: number;
    name_en: string;
    name_ar: string;
}

interface Governorate {
    id: number;
    name_en: string;
    name_ar: string;
}

interface PriceType {
    id: number;
    name_en: string;
    name_ar: string;
}

interface Condition {
    id: number;
    name_en: string;
    name_ar: string;
}

interface EditAdProps {
    ad: Ad;
    categories: Category[];
    governorates: Governorate[];
    priceTypes: PriceType[];
    conditions: Condition[];
}

export default function EditAd({ ad, categories, governorates, priceTypes, conditions }: EditAdProps) {
    useErrorHandler();

    const { data, setData, put, processing, errors } = useForm({
        title_en: ad.title_en,
        title_ar: ad.title_ar,
        description_en: ad.description_en,
        description_ar: ad.description_ar,
        product_details_en: ad.product_details_en || '',
        product_details_ar: ad.product_details_ar || '',
        price: ad.price.toString(),
        price_type_id: ad.priceType?.id.toString() || '',
        condition_id: ad.condition?.id.toString() || '',
        governorate_id: ad.governorate?.id.toString() || '',
        category_id: ad.category.id.toString(),
        status: ad.status,
        is_featured: ad.is_featured,
        is_negotiable: ad.is_negotiable,
        is_approved: ad.is_approved,
        delete_reason: ad.delete_reason || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/ads/${ad.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Ad: ${ad.title_en}`} />
            <>
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Ad</h1>
                            <p className="text-muted-foreground">Update ad information and settings</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title_en">Title (English) *</Label>
                                        <Input
                                            id="title_en"
                                            value={data.title_en}
                                            onChange={(e) => setData('title_en', e.target.value)}
                                            placeholder="Enter ad title in English"
                                        />
                                        <InputError message={errors.title_en} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="title_ar">Title (Arabic) *</Label>
                                        <Input
                                            id="title_ar"
                                            value={data.title_ar}
                                            onChange={(e) => setData('title_ar', e.target.value)}
                                            placeholder="Enter ad title in Arabic"
                                        />
                                        <InputError message={errors.title_ar} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description_en">Description (English) *</Label>
                                        <Textarea
                                            id="description_en"
                                            value={data.description_en}
                                            onChange={(e) => setData('description_en', e.target.value)}
                                            placeholder="Enter ad description in English"
                                            rows={4}
                                        />
                                        <InputError message={errors.description_en} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description_ar">Description (Arabic) *</Label>
                                        <Textarea
                                            id="description_ar"
                                            value={data.description_ar}
                                            onChange={(e) => setData('description_ar', e.target.value)}
                                            placeholder="Enter ad description in Arabic"
                                            rows={4}
                                        />
                                        <InputError message={errors.description_ar} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="product_details_en">Product Details (English)</Label>
                                        <Textarea
                                            id="product_details_en"
                                            value={data.product_details_en}
                                            onChange={(e) => setData('product_details_en', e.target.value)}
                                            placeholder="Enter product details in English"
                                            rows={4}
                                        />
                                        <InputError message={errors.product_details_en} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="product_details_ar">Product Details (Arabic)</Label>
                                        <Textarea
                                            id="product_details_ar"
                                            value={data.product_details_ar}
                                            onChange={(e) => setData('product_details_ar', e.target.value)}
                                            placeholder="Enter product details in Arabic"
                                            rows={4}
                                        />
                                        <InputError message={errors.product_details_ar} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing & Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing & Category</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.price} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price_type_id">Price Type *</Label>
                                        <Select value={data.price_type_id} onValueChange={(value) => setData('price_type_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priceTypes.map((priceType) => (
                                                    <SelectItem key={priceType.id} value={priceType.id.toString()}>
                                                        {priceType.name_en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.price_type_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category_id">Category *</Label>
                                        <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name_en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.category_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="condition_id">Condition *</Label>
                                        <Select value={data.condition_id} onValueChange={(value) => setData('condition_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {conditions.map((condition) => (
                                                    <SelectItem key={condition.id} value={condition.id.toString()}>
                                                        {condition.name_en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.condition_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="governorate_id">Governorate *</Label>
                                        <Select value={data.governorate_id} onValueChange={(value) => setData('governorate_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {governorates.map((governorate) => (
                                                    <SelectItem key={governorate.id} value={governorate.id.toString()}>
                                                        {governorate.name_en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.governorate_id} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status & Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value: 'draft' | 'active' | 'inactive' | 'expired' | 'sold' | 'delete') => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                            <SelectItem value="delete">Deleted</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_featured">Featured Ad</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Mark this ad as featured
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_featured"
                                                checked={data.is_featured}
                                                onCheckedChange={(checked) => setData('is_featured', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_negotiable">Negotiable Price</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow price negotiation
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_negotiable"
                                                checked={data.is_negotiable}
                                                onCheckedChange={(checked) => setData('is_negotiable', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_approved">Approved</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Mark this ad as approved
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_approved"
                                                checked={data.is_approved}
                                                onCheckedChange={(checked) => setData('is_approved', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="delete_reason">Delete Reason</Label>
                                        <Textarea
                                            id="delete_reason"
                                            value={data.delete_reason}
                                            onChange={(e) => setData('delete_reason', e.target.value)}
                                            placeholder="Enter reason for deletion (if applicable)"
                                            rows={3}
                                        />
                                        <InputError message={errors.delete_reason} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Information (Read-only) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ad Owner Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Name (English)</Label>
                                        <p className="text-sm">{ad.user.name_en}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Name (Arabic)</Label>
                                        <p className="text-sm">{ad.user.name_ar}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                        <p className="text-sm">{ad.user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </>
        </AppLayout>
    );
}
