import InputError from '@/components/admin/input-error';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Switch } from '@/components/admin/ui/switch';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Tag } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Module',
        href: '/admin/master',
    },
    {
        title: 'Product Conditions',
        href: '/admin/conditions',
    },
    {
        title: 'Create',
        href: '/admin/conditions/create',
    },
];

export default function CreateCondition() {
    const [errorDialog, setErrorDialog] = useState({
        open: false,
        title: '',
        message: '',
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        name_en: '',
        name_ar: '',
        is_active: true,
        sort_order: 0,
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
        post('/admin/conditions', {
            onSuccess: () => {
                reset();
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
                <Head title="Create Product Condition" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <InertiaLink href="/admin/conditions">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </InertiaLink>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create Product Condition</h1>
                            <p className="text-muted-foreground">Add a new product condition option</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Tag className="mr-2 h-5 w-5" />
                                    Condition Details
                                </CardTitle>
                                <CardDescription>Fill in the details to create a new product condition</CardDescription>
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
                                            placeholder="Enter condition name in English"
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
                                            placeholder="أدخل اسم الحالة بالعربية"
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
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Condition
                                                </>
                                            )}
                                        </Button>
                                        <InertiaLink href="/admin/conditions">
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
            {/* <ErrorDialog
                open={errorDialog.open}
                onOpenChange={(open) => setErrorDialog((prev) => ({ ...prev, open }))}
                title={errorDialog.title}
                message={errorDialog.message}
            /> */}
        </AppLayout>
    );
}
