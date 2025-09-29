import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { Plus, Edit, Eye, Trash2, ToggleRight, ToggleLeft, Crown, BarChart3, Headphones, Users } from 'lucide-react';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';

interface SubscriptionPlan {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    description_en: string;
    description_ar: string;
    price: number | string;
    months_count: number;
    is_lifetime: boolean;
    readable_billing_cycle: string | null;
    ad_limit: number;
    featured_ads: number;
    featured_ads_count: number | null;
    has_unlimited_featured_ads: boolean;
    priority_support: boolean;
    analytics: boolean;
    status: 'active' | 'inactive' | 'delete';
    created_at: string;
    updated_at: string;
    user_subscriptions_count?: number;
}

interface SubscriptionPlansIndexProps {
    plans: SubscriptionPlan[];
}

export default function SubscriptionPlansIndex({ plans }: SubscriptionPlansIndexProps) {
    const [deletingPlan, setDeletingPlan] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // useErrorHandler(); // Disabled to prevent re-triggering of error dialogs

    // Function to show error dialog
    const showErrorDialog = (title: string, message: string) => {
        // Check if dialog already exists
        const existingDialog = document.querySelector('.error-dialog-overlay');
        if (existingDialog) {
            existingDialog.remove();
        }

        // Create error dialog element
        const dialog = document.createElement('div');
        dialog.className = 'error-dialog-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="p-6">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0">
                            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-gray-900">${title}</h3>
                        </div>
                    </div>
                    <div class="mb-6">
                        <p class="text-sm text-gray-700">${message}</p>
                    </div>
                    <div class="flex justify-end">
                        <button 
                            onclick="this.closest('.error-dialog-overlay').remove()"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            OK
                        </button>
                    </div>
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
            case 'delete':
                return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getBillingCycleBadge = (cycle: string | null) => {
        return <Badge variant="outline">{cycle || 'Monthly'}</Badge>;
    };

    const formatPrice = (price: number | string, cycle: string | null) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const cycleText = cycle ? cycle.toLowerCase() : 'month';
        return `$${numericPrice.toFixed(2)}/${cycleText}`;
    };

    const handleToggleStatus = (planId: number) => {
        router.patch(`/admin/subscription-plans/${planId}/toggle`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                // alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleDelete = (planId: number) => {
        setDeletingPlan(planId);
        setIsDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setDeletingPlan(null);
    };

    const confirmDelete = () => {
        if (deletingPlan) {
            router.delete(`/admin/subscription-plans/${deletingPlan}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setDeletingPlan(null);
                },
                onError: (errors) => {
                    // Close the confirmation dialog first
                    setIsDeleteDialogOpen(false);
                    setDeletingPlan(null);
                    
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    showErrorDialog('Delete Error', errorMessage);
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Subscription Plans" />
            <>
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
                            <p className="text-muted-foreground">
                                Manage subscription plans, pricing, and features
                            </p>
                        </div>
                        <Button onClick={() => router.get('/admin/subscription-plans/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Plan
                        </Button>
                    </div>

                    {/* Plans List */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <Card key={plan.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">{plan.name_en}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(plan.status)}
                                            {getBillingCycleBadge(plan.readable_billing_cycle)}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-primary">
                                        {formatPrice(plan.price, plan.readable_billing_cycle)}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col h-full">
                                    <div className="flex-1 space-y-4">
                                        {/* Features */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{plan.ad_limit} posts allowed</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Crown className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {plan.has_unlimited_featured_ads 
                                                        ? 'Unlimited featured posts' 
                                                        : `${plan.featured_ads_count || plan.featured_ads} featured posts`
                                                    }
                                                </span>
                                            </div>
                                            {plan.analytics && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                    <span>Analytics access</span>
                                                </div>
                                            )}
                                            {plan.priority_support && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Headphones className="h-4 w-4 text-muted-foreground" />
                                                    <span>Priority support</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {plan.description_en}
                                        </p>
                                    </div>

                                    {/* Actions and Subscriber Count - Always at bottom */}
                                    <div className="mt-auto pt-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.get(`/admin/subscription-plans/${plan.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.get(`/admin/subscription-plans/${plan.id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(plan.id)}
                                                    className={plan.status === 'inactive' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                                                >
                                                    {plan.status === 'active' ? (
                                                        <ToggleRight className="h-4 w-4" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Dialog open={isDeleteDialogOpen && deletingPlan === plan.id} onOpenChange={setIsDeleteDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(plan.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-white">
                                                        <DialogHeader>
                                                            <DialogTitle>Delete Subscription Plan</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete "{plan.name_en}"? This action will revoke all active subscriptions for this plan and cannot be undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={confirmDelete}
                                                            >
                                                                Delete Plan
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            {plan.user_subscriptions_count !== undefined && (
                                                <div className="text-xs text-muted-foreground">
                                                    {plan.user_subscriptions_count} subscribers
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {plans.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Crown className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No subscription plans</h3>
                            <p className="text-muted-foreground mb-4">Get started by creating your first subscription plan.</p>
                            <Button onClick={() => router.get('/admin/subscription-plans/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Plan
                            </Button>
                        </div>
                    )}
                </div>
            </>
        </AppLayout>
    );
}
