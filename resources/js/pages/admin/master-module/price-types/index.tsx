import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { 
    Plus, 
    Search, 
    DollarSign, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight
} from 'lucide-react';
import { Link as InertiaLink, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ConfirmationDialog } from '@/components/admin/ui/confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Module',
        href: '/admin/master',
    },
    {
        title: 'Price Types',
        href: '/admin/price-types',
    },
];

interface PriceType {
    id: number;
    name_en: string;
    name_ar: string;
    is_active: boolean;
    created_at: string;
}

interface PriceTypesIndexProps {
    priceTypes?: {
        data: PriceType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters?: {
        status: string;
    };
}

export default function PriceTypesIndex({ priceTypes, filters }: PriceTypesIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [errorDialog, setErrorDialog] = useState({
        open: false,
        title: '',
        message: ''
    });
    const [confirmationDialog, setConfirmationDialog] = useState({
        open: false,
        title: '',
        description: '',
        onConfirm: () => {}
    });

    const { url } = usePage();

    // Refetch data when navigating back from detail pages
    useEffect(() => {
        const shouldRefresh = localStorage.getItem('admin-price-types-refresh');
        if (shouldRefresh === 'true') {
            localStorage.removeItem('admin-price-types-refresh');
            setTimeout(() => {
                router.reload({ only: ['priceTypes'] });
            }, 100);
        }
    }, [url]);

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
        router.patch(`/admin/price-types/${id}/toggle`, {}, {
            onSuccess: () => {
                localStorage.setItem('admin-price-types-refresh', 'true');
            },
            preserveState: true,
            onError: (errors) => {
                setErrorDialog({
                    open: true,
                    title: "Error",
                    message: Object.values(errors).flat().join(', ')
                });
            },
        });
    };
    const handleDelete = (id: number) => {
        setConfirmationDialog({
            open: true,
            title: 'Delete Price Type',
            description: 'Are you sure you want to delete this price type? This action cannot be undone.',
            onConfirm: () => {
                router.delete(`/admin/price-types/${id}`, {
                    onSuccess: () => {
                        localStorage.setItem('admin-price-types-refresh', 'true');
                    },
                    preserveScroll: true,
                    onError: (errors) => {
                        // Show error dialog for delete errors
                        const errorMessages = Object.values(errors).flat();
                        const errorMessage = errorMessages.join(', ');
                        showErrorDialog('Cannot Delete Price Type', errorMessage);
                    },
                });
            }
        });
    };

    const priceTypesData = priceTypes?.data || [];
    const filteredPriceTypes = priceTypesData.filter(priceType => {
        const matchesSearch = priceType.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            priceType.name_ar.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && priceType.is_active) ||
                            (statusFilter === 'inactive' && !priceType.is_active);
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Price Types Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Price Types</h1>
                            <p className="text-muted-foreground">
                                Manage price type options (Fixed, Negotiable, etc.)
                            </p>
                        </div>
                        <InertiaLink href="/admin/price-types/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Price Type
                            </Button>
                        </InertiaLink>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search price types..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="all">All statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Price Types List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Price Types ({filteredPriceTypes.length})</CardTitle>
                            <CardDescription>
                                Manage price type options for ads
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredPriceTypes.length === 0 ? (
                                <div className="text-center py-8">
                                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No price types found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm || statusFilter 
                                            ? 'Try adjusting your filters to see more results.'
                                            : 'Get started by adding your first price type.'
                                        }
                                    </p>
                                    <InertiaLink href="/admin/price-types/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Price Type
                                        </Button>
                                    </InertiaLink>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredPriceTypes.map((priceType) => (
                                        <div key={priceType.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-2xl">
                                                    <DollarSign className="h-6 w-6 text-orange-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-semibold">{priceType.name_en}</h3>
                                                        <span className="text-muted-foreground">({priceType.name_ar})</span>
                                                        {priceType.is_active ? (
                                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Created {new Date(priceType.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggle(priceType.id)}
                                                >
                                                    {priceType.is_active ? (
                                                        <ToggleRight className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Button>
                                                <InertiaLink href={`/admin/price-types/${priceType.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </InertiaLink>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(priceType.id)}
                                                    className="text-red-600 hover:text-red-800"
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
            {/* <ErrorDialog
                open={errorDialog.open}
                onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}
                title={errorDialog.title}
                message={errorDialog.message}
            /> */}
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

