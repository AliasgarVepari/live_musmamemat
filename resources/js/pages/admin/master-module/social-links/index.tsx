import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { 
    Plus, 
    Search, 
    Filter, 
    Link, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight,
    ExternalLink,
    User,
    Shield
} from 'lucide-react';
import { Link as InertiaLink, router } from '@inertiajs/react';
import { useState } from 'react';

interface SocialLink {
    id: number;
    platform: string;
    url: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    linkable: {
        name?: string;
        email?: string;
        type: string;
    };
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
    const [platformFilter, setPlatformFilter] = useState(filters.platform || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/admin/social-links', {
            platform: platformFilter,
            status: statusFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleToggle = (id: number) => {
        router.patch(`/admin/social-links/${id}/toggle`, {}, {
            preserveState: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this social link?')) {
            router.delete(`/admin/social-links/${id}`);
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
                            link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (link.linkable.name && link.linkable.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (link.linkable.email && link.linkable.email.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    return (
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
                        <div className="grid gap-4 md:grid-cols-4">
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
                                        <SelectItem value="">All platforms</SelectItem>
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
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">&nbsp;</label>
                                <Button onClick={handleFilter} className="w-full">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
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
                                                    <Badge variant={link.linkable.type === 'admin' ? 'default' : 'secondary'}>
                                                        {link.linkable.type === 'admin' ? (
                                                            <><Shield className="h-3 w-3 mr-1" /> Admin</>
                                                        ) : (
                                                            <><User className="h-3 w-3 mr-1" /> User</>
                                                        )}
                                                    </Badge>
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
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {link.linkable.name || link.linkable.email}
                                                </p>
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
    );
}
