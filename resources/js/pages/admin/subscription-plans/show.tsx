import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { ArrowLeft, Edit, Trash2, ToggleRight, ToggleLeft, Crown, BarChart3, Headphones, Users, Calendar, DollarSign } from 'lucide-react';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';

interface UserSubscription {
    id: number;
    user: {
        id: number;
        name_en: string;
        name_ar: string;
        email: string;
    };
    is_active: boolean;
    expires_at: string;
    created_at: string;
}

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
    user_subscriptions: UserSubscription[];
}

interface ShowSubscriptionPlanProps {
    plan: SubscriptionPlan;
}

export default function ShowSubscriptionPlan({ plan }: ShowSubscriptionPlanProps) {
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

    const handleToggleStatus = () => {
        router.patch(`/admin/subscription-plans/${plan.id}/toggle`, {}, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                // alert(`Error: ${errorMessage}`);
            },
        });
    };

    const handleDelete = () => {
        router.delete(`/admin/subscription-plans/${plan.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            },
            onError: (errors) => {
                // Close the confirmation dialog first
                setIsDeleteDialogOpen(false);
                
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                showErrorDialog('Delete Error', errorMessage);
            },
        });
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
    };

    const activeSubscriptions = plan.user_subscriptions.filter(sub => sub.is_active).length;
    const totalSubscriptions = plan.user_subscriptions.length;

    return (
        <AppLayout>
            <Head title={plan.name_en} />
            <>
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{plan.name_en}</h1>
                                <p className="text-muted-foreground">
                                    Subscription plan details and subscribers
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleToggleStatus}
                                className={plan.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                            >
                                {plan.status === 'active' ? (
                                    <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        Suspend
                                    </>
                                ) : (
                                    <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Activate
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.get(`/admin/subscription-plans/${plan.id}/edit`)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
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
                                            onClick={handleDelete}
                                        >
                                            Delete Plan
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Plan Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold">{plan.name_en}</h3>
                                            <p className="text-muted-foreground">{plan.name_ar}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-primary">
                                                {formatPrice(plan.price, plan.readable_billing_cycle)}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getStatusBadge(plan.status)}
                                                {getBillingCycleBadge(plan.readable_billing_cycle)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Description (English)</h4>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{plan.description_en}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Description (Arabic)</h4>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{plan.description_ar}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Features */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan Features</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-medium">{plan.ad_limit} posts allowed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Crown className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {plan.has_unlimited_featured_ads 
                                                        ? 'Unlimited featured posts' 
                                                        : `${plan.featured_ads_count || plan.featured_ads} featured posts`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {plan.analytics && (
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-medium">Analytics access</span>
                                                </div>
                                            )}
                                            {plan.priority_support && (
                                                <div className="flex items-center gap-2">
                                                    <Headphones className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-medium">Priority support</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subscribers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subscribers ({totalSubscriptions})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {plan.user_subscriptions.length > 0 ? (
                                        <div className="space-y-3">
                                            {plan.user_subscriptions.map((subscription) => (
                                                <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">{subscription.user.name_en}</div>
                                                        <div className="text-sm text-muted-foreground">{subscription.user.email}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-sm font-medium ${subscription.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                                            {subscription.is_active ? 'Active' : 'Expired'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Expires: {new Date(subscription.expires_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No subscribers yet
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Statistics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Total Subscribers</span>
                                        </div>
                                        <span className="font-bold">{totalSubscriptions}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ToggleRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Active Subscribers</span>
                                        </div>
                                        <span className="font-bold text-green-600">{activeSubscriptions}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Monthly Revenue</span>
                                        </div>
                                        <span className="font-bold">
                                            ${(activeSubscriptions * (typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price)).toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Created</span>
                                        <span className="text-sm">{new Date(plan.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Last Updated</span>
                                        <span className="text-sm">{new Date(plan.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Slug</span>
                                        <span className="text-sm font-mono">{plan.slug}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </>
        </AppLayout>
    );
}
