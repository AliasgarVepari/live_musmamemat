import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Switch } from '@/components/admin/ui/switch';
import InputError from '@/components/admin/input-error';
import { ArrowLeft, DollarSign, Save } from 'lucide-react';
import { Link as InertiaLink, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Module',
        href: '/admin/master',
    },
    {
        title: 'Price Types',
        href: '/admin/price-types',
    },
    {
        title: 'Edit',
        href: '/admin/price-types/edit',
    },
];

interface PriceType {
    id: number;
    name_en: string;
    name_ar: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface EditPriceTypeProps {
    priceType: PriceType;
}

export default function EditPriceType({ priceType }: EditPriceTypeProps) {
    const { data, setData, put, processing, errors } = useForm({
        name_en: priceType.name_en,
        name_ar: priceType.name_ar,
        is_active: priceType.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/price-types/${priceType.id}`, {
            onSuccess: () => {
                localStorage.setItem('admin-price-types-refresh', 'true');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Edit Price Type" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                localStorage.setItem('admin-price-types-refresh', 'true');
                                router.visit('/admin/price-types', { 
                                    method: 'get',
                                    preserveState: false,
                                    preserveScroll: false
                                });
                            }}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Price Type</h1>
                            <p className="text-muted-foreground">
                                Update price type information
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Price Type Details
                                </CardTitle>
                                <CardDescription>
                                    Update the price type information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* English Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name_en">English Name</Label>
                                        <Input
                                            id="name_en"
                                            type="text"
                                            value={data.name_en}
                                            onChange={(e) => setData('name_en', e.target.value)}
                                            placeholder="Enter price type name in English"
                                            required
                                        />
                                        <InputError message={errors.name_en} />
                                    </div>

                                    {/* Arabic Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name_ar">Arabic Name</Label>
                                        <Input
                                            id="name_ar"
                                            type="text"
                                            value={data.name_ar}
                                            onChange={(e) => setData('name_ar', e.target.value)}
                                            placeholder="أدخل نوع السعر بالعربية"
                                            required
                                        />
                                        <InputError message={errors.name_ar} />
                                    </div>

                                    {/* Active Status */}
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex items-center space-x-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Price Type
                                                </>
                                            )}
                                        </Button>
                                        <InertiaLink href="/admin/price-types">
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </InertiaLink>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        </AppLayout>
    );
}
