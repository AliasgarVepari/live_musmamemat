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
    ToggleRight,
    GripVertical
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
        title: 'Product Conditions',
        href: '/admin/conditions',
    },
];

interface Condition {
    id: number;
    name_en: string;
    name_ar: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

interface ConditionsIndexProps {
    conditions?: {
        data: Condition[];
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

export default function ConditionsIndex({ conditions, filters }: ConditionsIndexProps) {
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
        router.patch(`/admin/conditions/${id}/toggle`, {}, {
            preserveState: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this condition?')) {
            router.delete(`/admin/conditions/${id}`, {
                onError: (errors) => {
                    // Show error dialog for delete errors
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    showErrorDialog('Cannot Delete Condition', errorMessage);
                },
            });
        }
    };

    const conditionsData = conditions?.data || [];
    const filteredConditions = conditionsData.filter(condition => {
        const matchesSearch = condition.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            condition.name_ar.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && condition.is_active) ||
                            (statusFilter === 'inactive' && !condition.is_active);
        return matchesSearch && matchesStatus;
    });

    // Sort by sort_order
    const sortedConditions = [...filteredConditions].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Product Conditions Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Product Conditions</h1>
                            <p className="text-muted-foreground">
                                Manage product condition options (New, Used, etc.)
                            </p>
                        </div>
                        <InertiaLink href="/admin/conditions/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Condition
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
                                            placeholder="Search conditions..."
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

                    {/* Conditions List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Conditions ({sortedConditions.length})</CardTitle>
                            <CardDescription>
                                Manage product condition options for ads
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {sortedConditions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No conditions found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm || statusFilter 
                                            ? 'Try adjusting your filters to see more results.'
                                            : 'Get started by adding your first condition.'
                                        }
                                    </p>
                                    <InertiaLink href="/admin/conditions/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Condition
                                        </Button>
                                    </InertiaLink>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sortedConditions.map((condition) => (
                                        <div key={condition.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-2xl">
                                                    <GripVertical className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-semibold">{condition.name_en}</h3>
                                                        <span className="text-muted-foreground">({condition.name_ar})</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            Order: {condition.sort_order}
                                                        </Badge>
                                                        {condition.is_active ? (
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
                                                        Created {new Date(condition.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggle(condition.id)}
                                                >
                                                    {condition.is_active ? (
                                                        <ToggleRight className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Button>
                                                <InertiaLink href={`/admin/conditions/${condition.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </InertiaLink>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(condition.id)}
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
        </AppLayout>
    );
}
