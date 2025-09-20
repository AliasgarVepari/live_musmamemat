import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link as InertiaLink, router } from '@inertiajs/react';
import { Edit, MapPin, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Module',
        href: '/admin/master',
    },
    {
        title: 'Governorates',
        href: '/admin/governorates',
    },
];

interface Governorate {
    id: number;
    name_en: string;
    name_ar: string;
    is_active: boolean;
    created_at: string;
}

interface GovernoratesIndexProps {
    governorates?: {
        data: Governorate[];
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

export default function GovernoratesIndex({ governorates, filters }: GovernoratesIndexProps) {
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
        router.patch(
            `/admin/governorates/${id}/toggle`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this governorate?')) {
            router.delete(`/admin/governorates/${id}`, {
                preserveScroll: true,
                onError: (errors) => {
                    // Show error dialog for delete errors
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    showErrorDialog('Cannot Delete Governorate', errorMessage);
                },
            });
        }
    };

    const governoratesData = governorates?.data || [];
    const filteredGovernorates = governoratesData.filter((governorate) => {
        const matchesSearch =
            governorate.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            governorate.name_ar.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || (statusFilter === 'active' && governorate.is_active) || (statusFilter === 'inactive' && !governorate.is_active);
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Governorates Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Governorates</h1>
                            <p className="text-muted-foreground">Manage Kuwait governorates for location selection</p>
                        </div>
                        <InertiaLink href="/admin/governorates/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Governorate
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
                                        <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
                                        <Input
                                            placeholder="Search governorates..."
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
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="all">All statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Governorates List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Governorates ({filteredGovernorates.length})</CardTitle>
                            <CardDescription>Manage Kuwait governorates for location selection</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredGovernorates.length === 0 ? (
                                <div className="py-8 text-center">
                                    <MapPin className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                    <h3 className="mb-2 text-lg font-semibold">No governorates found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm || statusFilter
                                            ? 'Try adjusting your filters to see more results.'
                                            : 'Get started by adding your first governorate.'}
                                    </p>
                                    <InertiaLink href="/admin/governorates/create">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Governorate
                                        </Button>
                                    </InertiaLink>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredGovernorates.map((governorate) => (
                                        <div
                                            key={governorate.id}
                                            className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="text-2xl">
                                                    <MapPin className="h-6 w-6 text-green-500" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-semibold">{governorate.name_en}</h3>
                                                        <span className="text-muted-foreground">({governorate.name_ar})</span>
                                                        {governorate.is_active ? (
                                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Inactive</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">
                                                        Created {new Date(governorate.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleToggle(governorate.id)}>
                                                    {governorate.is_active ? (
                                                        <ToggleRight className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Button>
                                                <InertiaLink href={`/admin/governorates/${governorate.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </InertiaLink>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(governorate.id)}
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
