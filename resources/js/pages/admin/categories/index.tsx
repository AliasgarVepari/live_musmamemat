import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { ErrorDialog } from '@/components/admin/ui/error-dialog';
import { Input } from '@/components/admin/ui/input';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, router } from '@inertiajs/react';
import { Edit, Image as ImageIcon, Plus, Search, Tag, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/admin/categories',
    },
];

interface Category {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    icon_url?: string;
    icon_temp_url?: string;
    icon_name?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

interface CategoriesIndexProps {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters?: {
        search: string;
        status: string;
    };
}

export default function CategoriesIndex({ categories, filters }: CategoriesIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [errorDialog, setErrorDialog] = useState({
        open: false,
        title: '',
        message: '',
    });

    const handleToggle = (id: number) => {
        router.patch(
            `/admin/categories/${id}/toggle`,
            {},
            {
                preserveState: true,
                onError: (errors) => {
                    setErrorDialog({
                        open: true,
                        title: 'Error',
                        message: Object.values(errors).flat().join(', '),
                    });
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/admin/categories/${id}`, {
                onError: (errors) => {
                    setErrorDialog({
                        open: true,
                        title: 'Cannot Delete Category',
                        message: Object.values(errors).flat().join(', '),
                    });
                },
            });
        }
    };

    const categoriesData = categories?.data || [];
    const filteredCategories = categoriesData.filter((category) => {
        const matchesSearch =
            category.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && category.status === 'active') ||
            (statusFilter === 'inactive' && category.status === 'inactive');
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Inactive
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground">Manage product categories for your marketplace</p>
                    </div>
                    <InertiaLink href="/admin/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </InertiaLink>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Search & Filter</CardTitle>
                        <CardDescription>Filter categories by name or status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search categories..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Categories ({filteredCategories.length})</CardTitle>
                        <CardDescription>A list of all categories in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredCategories.length === 0 ? (
                            <div className="py-8 text-center">
                                <Tag className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories found</h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Get started by creating a new category.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                                                {category.icon_name ? (
                                                    <IconPreview name={category.icon_name} className="text-primary h-6 w-6" />
                                                ) : category.icon_url ? (
                                                    <img
                                                        src={category.icon_temp_url || category.icon_url}
                                                        alt={category.name_en}
                                                        className="h-8 w-8 object-contain"
                                                        referrerPolicy="no-referrer"
                                                        crossOrigin="anonymous"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <ImageIcon
                                                    className={`text-primary h-5 w-5 ${category.icon_name || category.icon_url ? 'hidden' : ''}`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-medium">{category.name_en}</h3>
                                                    {getStatusBadge(category.status)}
                                                </div>
                                                <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                                                    <span>Arabic: {category.name_ar}</span>
                                                    <span>•</span>
                                                    <span>Slug: {category.slug}</span>
                                                    {category.icon_url && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-600">Has Icon</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleToggle(category.id)}>
                                                {category.status === 'active' ? (
                                                    <ToggleRight className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                )}
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <InertiaLink href={`/admin/categories/${category.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </InertiaLink>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(category.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ErrorDialog
                open={errorDialog.open}
                onOpenChange={(open) => setErrorDialog((prev) => ({ ...prev, open }))}
                title={errorDialog.title}
                message={errorDialog.message}
            />
        </AppLayout>
    );
}
