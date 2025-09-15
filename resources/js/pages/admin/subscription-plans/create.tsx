import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { Switch } from '@/components/admin/ui/switch';
import { InputError } from '@/components/admin/ui/input-error';
import { ArrowLeft, Save } from 'lucide-react';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';

export default function CreateSubscriptionPlan() {
    useErrorHandler();

    const { data, setData, post, processing, errors } = useForm({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        price: '',
        billing_cycle: 'monthly' as 'monthly' | 'yearly',
        ad_limit: '',
        featured_ads: '',
        has_unlimited_featured_ads: false,
        priority_support: false,
        analytics: false,
        status: 'active' as 'active' | 'suspended',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/subscription-plans');
    };

    return (
        <AppLayout>
            <Head title="Create Subscription Plan" />
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
                            <h1 className="text-3xl font-bold tracking-tight">Create Subscription Plan</h1>
                            <p className="text-muted-foreground">
                                Create a new subscription plan with features and pricing
                            </p>
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
                                        <Label htmlFor="name_en">Plan Name (English) *</Label>
                                        <Input
                                            id="name_en"
                                            value={data.name_en}
                                            onChange={(e) => setData('name_en', e.target.value)}
                                            placeholder="e.g., Premium Plan"
                                        />
                                        <InputError message={errors.name_en} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name_ar">Plan Name (Arabic) *</Label>
                                        <Input
                                            id="name_ar"
                                            value={data.name_ar}
                                            onChange={(e) => setData('name_ar', e.target.value)}
                                            placeholder="مثال: الخطة المميزة"
                                        />
                                        <InputError message={errors.name_ar} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="29.99"
                                        />
                                        <InputError message={errors.price} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                                        <Select value={data.billing_cycle} onValueChange={(value: 'monthly' | 'yearly') => setData('billing_cycle', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.billing_cycle} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value: 'active' | 'suspended') => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Features & Limits */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Features & Limits</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ad_limit">Posts Allowance *</Label>
                                        <Input
                                            id="ad_limit"
                                            type="number"
                                            min="0"
                                            value={data.ad_limit}
                                            onChange={(e) => setData('ad_limit', e.target.value)}
                                            placeholder="100"
                                        />
                                        <InputError message={errors.ad_limit} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="featured_ads">Featured Posts Allowance *</Label>
                                        <Input
                                            id="featured_ads"
                                            type="number"
                                            min="0"
                                            value={data.featured_ads}
                                            onChange={(e) => setData('featured_ads', e.target.value)}
                                            placeholder="10"
                                        />
                                        <InputError message={errors.featured_ads} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="has_unlimited_featured_ads"
                                            checked={data.has_unlimited_featured_ads}
                                            onCheckedChange={(checked) => setData('has_unlimited_featured_ads', checked)}
                                        />
                                        <Label htmlFor="has_unlimited_featured_ads">
                                            Unlimited featured posts
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="analytics"
                                            checked={data.analytics}
                                            onCheckedChange={(checked) => setData('analytics', checked)}
                                        />
                                        <Label htmlFor="analytics">
                                            Analytics access
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="priority_support"
                                            checked={data.priority_support}
                                            onCheckedChange={(checked) => setData('priority_support', checked)}
                                        />
                                        <Label htmlFor="priority_support">
                                            Priority support
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Descriptions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Descriptions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="description_en">Description (English) *</Label>
                                    <textarea
                                        id="description_en"
                                        value={data.description_en}
                                        onChange={(e) => setData('description_en', e.target.value)}
                                        placeholder="Describe the benefits and features of this plan..."
                                        className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <InputError message={errors.description_en} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description_ar">Description (Arabic) *</Label>
                                    <textarea
                                        id="description_ar"
                                        value={data.description_ar}
                                        onChange={(e) => setData('description_ar', e.target.value)}
                                        placeholder="اوصف فوائد وميزات هذه الخطة..."
                                        className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <InputError message={errors.description_ar} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Plan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </>
        </AppLayout>
    );
}
