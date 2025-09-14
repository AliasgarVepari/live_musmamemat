import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { 
    Plus, 
    Search, 
    Tag, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight
} from 'lucide-react';
import { Link as InertiaLink, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Module',
        href: '/admin/master',
    },
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

    // Function to show error dialog
    const showErrorDialog = (title: string, message: string) => {
        // Check if dialog already exists
        const existingDialog = document.querySelector('.error-dialog-overlay');
        if (existingDialog) {
            existingDialog.remove();
        }

        // Create error dialog element
        const dialog = document.createElement('div');
        dialog.className = 'error-dialog-overlay';
        dialog.innerHTML = `
            <div class="error-dialog-content">
                <div class="error-dialog-header">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <svg class="error-dialog-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div class="error-dialog-title">${title}</div>
                    </div>
                    <div class="error-dialog-message">${message}</div>
                </div>
                <div class="error-dialog-footer p-6 pt-0">
                    <button 
                        onclick="this.closest('.error-dialog-overlay').remove()"
                        class="error-dialog-button"
                    >
                        OK
                    </button>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(dialog);

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        }, 10000);
    };

    const handleToggle = (id: number) => {
        router.patch(`/admin/categories/${id}/toggle`, {}, {
            preserveState: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/admin/categories/${id}`, {
                onError: (errors) => {
                    // Show error dialog for delete errors
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    showErrorDialog('Cannot Delete Category', errorMessage);
                },
            });
        }
    };

    const categoriesData = categories?.data || [];
    const filteredCategories = categoriesData.filter(category => {
        const matchesSearch = category.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            category.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            category.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && category.status === 'active') ||
                            (statusFilter === 'inactive' && category.status === 'inactive');
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Categories" />

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                            <p className="text-muted-foreground">
                                Manage product categories
                            </p>
                        </div>
                        <Button asChild>
                            <InertiaLink href="/admin/categories/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </InertiaLink>
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>
                                Filter categories by name or status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories ({filteredCategories.length})</CardTitle>
                            <CardDescription>
                                A list of all categories in the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredCategories.length === 0 ? (
                                <div className="text-center py-8">
                                    <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {searchTerm || statusFilter !== 'all' 
                                            ? 'Try adjusting your search or filter criteria.'
                                            : 'Get started by creating a new category.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredCategories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                    <Tag className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-medium">{category.name_en}</h3>
                                                        {getStatusBadge(category.status)}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <span>Arabic: {category.name_ar}</span>
                                                        <span>•</span>
                                                        <span>Slug: {category.slug}</span>
                                                        {category.icon_url && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Icon: {category.icon_url}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggle(category.id)}
                                                >
                                                    {category.status === 'active' ? (
                                                        <ToggleRight className="h-4 w-4" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
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
            </>
        </AppLayout>
    );
}
