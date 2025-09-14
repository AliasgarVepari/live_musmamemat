import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { InputError } from '@/components/admin/ui/input-error';
import { ArrowLeft, Tag } from 'lucide-react';
import { Link as InertiaLink } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Module',
        href: '/admin/master',
    },
    {
        title: 'Categories',
        href: '/admin/categories',
    },
    {
        title: 'Edit',
        href: '/admin/categories/edit',
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

interface EditCategoryProps {
    category: Category;
}

export default function EditCategory({ category }: EditCategoryProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name_en: category.name_en,
        name_ar: category.name_ar,
        icon_url: category.icon_url || '',
        status: category.status,
    });

    // Use global error handler
    useErrorHandler();

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/categories/${category.id}`, {
            onSuccess: () => {
                // Form will be reset automatically on success
            },
            onError: (errors) => {
                // Show error dialog for validation errors
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                showErrorDialog('Validation Error', errorMessage);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Edit Category" />

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <InertiaLink href="/admin/categories">
                                <ArrowLeft className="h-4 w-4" />
                            </InertiaLink>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                            <p className="text-muted-foreground">
                                Update category information
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Tag className="mr-2 h-5 w-5" />
                                Category Information
                            </CardTitle>
                            <CardDescription>
                                Update the category details below
                            </CardDescription>
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

                                    {/* Icon URL */}
                                    <div className="space-y-2">
                                        <Label htmlFor="icon_url">Icon URL</Label>
                                        <Input
                                            id="icon_url"
                                            type="url"
                                            value={data.icon_url}
                                            onChange={(e) => setData('icon_url', e.target.value)}
                                            placeholder="https://example.com/icon.png"
                                            className={errors.icon_url ? 'border-destructive' : ''}
                                        />
                                        <InputError message={errors.icon_url} />
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        <InputError message={errors.status} />
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <InertiaLink href="/admin/categories">
                                            Cancel
                                        </InertiaLink>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing ? 'Updating...' : 'Update Category'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </>
        </AppLayout>
    );
}
