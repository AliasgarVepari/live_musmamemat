import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/admin/ui/dialog';
import { Input } from '@/components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { useErrorHandler } from '@/hooks/admin/use-error-handler';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Filter, Image as ImageIcon, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
    },
];

interface Banner {
    id: number;
    image_url_en: string;
    image_url_ar: string;
    position: 'top' | 'bottom';
    status: 'active' | 'inactive' | 'delete';
    is_approved: boolean;
    click_count: number;
    created_at: string;
    updated_at: string;
}

interface BannersData {
    data: Banner[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search?: string;
    position?: string;
    status?: string;
    is_approved?: string;
}

interface Props {
    banners: BannersData;
    filters: Filters;
}

export default function Index({ banners, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [position, setPosition] = useState(filters.position || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [isApproved, setIsApproved] = useState(filters.is_approved || 'all');
    const [deletingBanner, setDeletingBanner] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useErrorHandler();

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                '/admin/banners',
                {
                    search: search || undefined,
                    position: position === 'all' ? undefined : position,
                    status: status === 'all' ? undefined : status,
                    is_approved: isApproved === 'all' ? undefined : isApproved,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, position, status, isApproved]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-orange-100 text-orange-800">Inactive</Badge>;
            case 'delete':
                return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPositionBadge = (position: string) => {
        switch (position) {
            case 'top':
                return <Badge className="bg-blue-100 text-blue-800">Top</Badge>;
            case 'bottom':
                return <Badge className="bg-purple-100 text-purple-800">Bottom</Badge>;
            default:
                return <Badge variant="secondary">{position}</Badge>;
        }
    };

    const handleToggleStatus = (bannerId: number) => {
        router.patch(
            `/admin/banners/${bannerId}/toggle`,
            {},
            {
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (bannerId: number) => {
        setDeletingBanner(bannerId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deletingBanner) {
            router.delete(`/admin/banners/${deletingBanner}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setDeletingBanner(null);
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    alert(`Error: ${errorMessage}`);
                },
                preserveScroll: true,
            });
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setDeletingBanner(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Banners" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
                        <p className="text-gray-600">Manage site banners and promotional content</p>
                    </div>
                    <Link href="/admin/banners/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Banner
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder="Search banners..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Position</label>
                                <Select value={position} onValueChange={setPosition}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Positions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Positions</SelectItem>
                                        <SelectItem value="top">Top</SelectItem>
                                        <SelectItem value="bottom">Bottom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="delete">Deleted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Approval</label>
                                <Select value={isApproved} onValueChange={setIsApproved}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Approval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Approval</SelectItem>
                                        <SelectItem value="true">Approved</SelectItem>
                                        <SelectItem value="false">Not Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Banners Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {banners.data.map((banner) => (
                        <Card key={banner.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(banner.status)}
                                        {getPositionBadge(banner.position)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleStatus(banner.id)}
                                            className={
                                                banner.status === 'active'
                                                    ? 'text-green-600 hover:text-green-700'
                                                    : 'text-orange-600 hover:text-orange-700'
                                            }
                                            title={banner.status === 'active' ? 'Deactivate' : 'Activate'}
                                        >
                                            {banner.status === 'active' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Banner Images */}
                                <div className="space-y-3">
                                    {/* English Image */}
                                    <div>
                                        <div className="mb-1 text-xs font-medium text-gray-600">English</div>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={banner.image_url_en} alt="English Banner" className="h-full w-full object-cover" />
                                        </div>
                                    </div>

                                    {/* Arabic Image */}
                                    <div>
                                        <div className="mb-1 text-xs font-medium text-gray-600">Arabic</div>
                                        <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg">
                                            <img src={banner.image_url_ar} alt="Arabic Banner" className="h-full w-full object-cover" />
                                        </div>
                                    </div>
                                </div>

                                {/* Banner Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Clicks:</span>
                                        <span className="font-medium">{banner.click_count}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2">
                                    {/* <Link href={`/admin/banners/${banner.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link> */}

                                    <Link href={`/admin/banners/${banner.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    {banner.status !== 'delete' && (
                                        <Dialog open={isDeleteDialogOpen && deletingBanner === banner.id} onOpenChange={setIsDeleteDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(banner.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Delete Banner</DialogTitle>
                                                    <DialogDescription>
                                                        Are you sure you want to delete this banner? This action cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={handleCancelDelete}>
                                                        Cancel
                                                    </Button>
                                                    <Button variant="destructive" onClick={confirmDelete}>
                                                        Delete
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {banners.data.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ImageIcon className="mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No banners found</h3>
                            <p className="mb-4 text-center text-gray-500">
                                {search || position !== 'all' || status !== 'all' || isApproved !== 'all'
                                    ? 'No banners match your current filters.'
                                    : 'Get started by creating your first banner.'}
                            </p>
                            {!search && position === 'all' && status === 'all' && isApproved === 'all' && (
                                <Link href="/admin/banners/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Banner
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {banners.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {banners.from} to {banners.to} of {banners.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            {banners.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search && search.trim()) params.append('search', search);
                                        if (position && position !== 'all') params.append('position', position);
                                        if (status && status !== 'all') params.append('status', status);
                                        if (isApproved && isApproved !== 'all') params.append('is_approved', isApproved);
                                        params.append('page', (banners.current_page - 1).toString());

                                        router.get(`/admin/banners?${params.toString()}`, {}, { preserveScroll: true });
                                    }}
                                >
                                    Previous
                                </Button>
                            )}

                            <div className="flex items-center gap-1">
                                {Array.from({ length: banners.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === banners.current_page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            const params = new URLSearchParams();
                                            if (search && search.trim()) params.append('search', search);
                                            if (position && position !== 'all') params.append('position', position);
                                            if (status && status !== 'all') params.append('status', status);
                                            if (isApproved && isApproved !== 'all') params.append('is_approved', isApproved);
                                            params.append('page', page.toString());

                                            router.get(`/admin/banners?${params.toString()}`, {}, { preserveScroll: true });
                                        }}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            {banners.current_page < banners.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search && search.trim()) params.append('search', search);
                                        if (position && position !== 'all') params.append('position', position);
                                        if (status && status !== 'all') params.append('status', status);
                                        if (isApproved && isApproved !== 'all') params.append('is_approved', isApproved);
                                        params.append('page', (banners.current_page + 1).toString());

                                        router.get(`/admin/banners?${params.toString()}`, {}, { preserveScroll: true });
                                    }}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
