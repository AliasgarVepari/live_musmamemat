import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { ConfirmationDialog } from '@/components/admin/ui/confirmation-dialog';
import { Input } from '@/components/admin/ui/input';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, router } from '@inertiajs/react';
import { Edit, Plus, Search, Tag, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
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
    status: 'active' | 'inactive';
    sort_order?: number;
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
    const [confirmationDialog, setConfirmationDialog] = useState({
        open: false,
        title: '',
        description: '',
        onConfirm: () => {}
    });
    
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
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            background-color: rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.2s ease-out;
        `;

        dialog.innerHTML = `
            <div style="
                background: white;
                border-radius: 0.5rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                max-width: 28rem;
                width: 100%;
                margin: 1rem;
                animation: slideIn 0.2s ease-out;
            ">
                <div style="padding: 1.5rem;">
                    <div style="display: flex; align-items: center;">
                        <div style="flex-shrink: 0;">
                            <svg style="height: 1.5rem; width: 1.5rem; color: #dc2626;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div style="margin-left: 0.75rem; font-size: 1.125rem; font-weight: 500; color: #111827;">${title}</div>
                    </div>
                    <div style="margin-top: 1.5rem; font-size: 0.875rem; color: #374151;">${message}</div>
                </div>
                <div style="padding: 1.5rem; padding-top: 0; display: flex; justify-content: flex-end;">
                    <button 
                        onclick="this.closest('.error-dialog-overlay').remove()"
                        style="
                            display: inline-flex;
                            align-items: center;
                            padding: 0.5rem 1rem;
                            border: 1px solid transparent;
                            font-size: 0.875rem;
                            font-weight: 500;
                            border-radius: 0.375rem;
                            color: white;
                            background-color: #dc2626;
                            transition: background-color 0.2s;
                            cursor: pointer;
                        "
                        onmouseover="this.style.backgroundColor='#b91c1c'"
                        onmouseout="this.style.backgroundColor='#dc2626'"
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
        router.patch(
            `/admin/categories/${id}/toggle`,
            {},
            {
                preserveState: true,
            },
        );
    };
    const handleDelete = (id: number) => {
        setConfirmationDialog({
            open: true,
            title: 'Delete Category',
            description: 'Are you sure you want to delete this category? This action cannot be undone.',
            onConfirm: () => {
                router.delete(`/admin/categories/${id}`, {
                    preserveScroll: true,
                    onError: (errors) => {
                        // Show error dialog for delete errors
                        const errorMessages = Object.values(errors).flat();
                        const errorMessage = errorMessages.join(', ');
                        showErrorDialog('Cannot Delete Category', errorMessage);
                    },
                });
            }
        });
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
                <Head title="Categories">
                    <style>
                        {`
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            @keyframes slideIn {
                                from { 
                                    opacity: 0; 
                                    transform: translateY(-10px) scale(0.95); 
                                }
                                to { 
                                    opacity: 1; 
                                    transform: translateY(0) scale(1); 
                                }
                            }
                        `}
                    </style>
                </Head>

                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                            <p className="text-muted-foreground">Manage product categories</p>
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

                    {/* Categories List */}
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
                                        <div key={category.id} className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                                    {category.icon_url ? (
                                                        <img
                                                            src={category.icon_url}
                                                            alt={`${category.name_en} icon`}
                                                            className="h-6 w-6 object-contain"
                                                        />
                                                    ) : (
                                                        <Tag className="text-primary h-5 w-5" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-medium">{category.name_en}</h3>
                                                        {getStatusBadge(category.status)}
                                                        {category.sort_order && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Order: {category.sort_order}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                                                        <span>Arabic: {category.name_ar}</span>
                                                        <span>•</span>
                                                        <span>Slug: {category.slug}</span>
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
            </>
            <ConfirmationDialog
                open={confirmationDialog.open}
                onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
                title={confirmationDialog.title}
                description={confirmationDialog.description}
                onConfirm={confirmationDialog.onConfirm}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </AppLayout>
    );
}
function setConfirmationDialog(arg0: { open: boolean; title: string; description: string; onConfirm: () => void; }) {
    throw new Error('Function not implemented.');
}

