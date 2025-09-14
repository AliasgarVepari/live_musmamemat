import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { 
    Plus, 
    Search, 
    Link, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight,
    ExternalLink
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
        title: 'Social Links',
        href: '/admin/social-links',
    },
];

interface SocialLink {
    id: number;
    platform: string;
    url: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

interface SocialLinksIndexProps {
    socialLinks: {
        data: SocialLink[];
        links: any;
        meta: any;
    };
    filters: {
        platform: string;
        status: string;
    };
    platforms: string[];
}

export default function SocialLinksIndex({ socialLinks, filters, platforms }: SocialLinksIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [platformFilter, setPlatformFilter] = useState(filters.platform || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

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
        router.patch(`/admin/social-links/${id}/toggle`, {}, {
            preserveState: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this social link?')) {
            router.delete(`/admin/social-links/${id}`, {
                onError: (errors) => {
                    // Show error dialog for delete errors
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.join(', ');
                    showErrorDialog('Cannot Delete Social Link', errorMessage);
                },
            });
        }
    };

    const getPlatformIcon = (platform: string) => {
        const platformIcons: { [key: string]: string } = {
            facebook: '📘',
            instagram: '📷',
            twitter: '🐦',
            youtube: '📺',
            linkedin: '💼',
            tiktok: '🎵',
            snapchat: '👻',
            whatsapp: '💬',
            telegram: '✈️',
        };
        return platformIcons[platform.toLowerCase()] || '🔗';
    };

    const filteredLinks = socialLinks.data.filter(link => {
        const matchesSearch = link.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            link.url.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = platformFilter === 'all' || link.platform === platformFilter;
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && link.is_active) ||
                            (statusFilter === 'inactive' && !link.is_active);
        return matchesSearch && matchesPlatform && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Social Links Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Social Links</h1>
                        <p className="text-muted-foreground">
                            Manage social media links for users and admins
                        </p>
                    </div>
                    <InertiaLink href="/admin/social-links/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Social Link
                        </Button>
                    </InertiaLink>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search links..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Platform</label>
                                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All platforms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All platforms</SelectItem>
                                        {platforms.map((platform) => (
                                            <SelectItem key={platform} value={platform}>
                                                {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Links ({filteredLinks.length})</CardTitle>
                        <CardDescription>
                            Manage social media links for users and administrators
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredLinks.length === 0 ? (
                            <div className="text-center py-8">
                                <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No social links found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm || platformFilter || statusFilter 
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by adding your first social link.'
                                    }
                                </p>
                                <InertiaLink href="/admin/social-links/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Social Link
                                    </Button>
                                </InertiaLink>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredLinks.map((link) => (
                                    <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-2xl">
                                                {getPlatformIcon(link.platform)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold capitalize">{link.platform}</h3>
                                                    {link.is_active ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <a 
                                                        href={link.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                                    >
                                                        {link.url}
                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggle(link.id)}
                                            >
                                                {link.is_active ? (
                                                    <ToggleRight className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                )}
                                            </Button>
                                            <InertiaLink href={`/admin/social-links/${link.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </InertiaLink>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(link.id)}
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
