import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { Switch } from '@/components/admin/ui/switch';
import InputError from '@/components/admin/input-error';
import { ArrowLeft, Link, Plus } from 'lucide-react';
import { Link as InertiaLink, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface CreateSocialLinkProps {
    linkableTypes: Array<{
        value: string;
        label: string;
    }>;
    platforms: string[];
}

export default function CreateSocialLink({ linkableTypes, platforms }: CreateSocialLinkProps) {
    const [selectedType, setSelectedType] = useState('');
    const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        linkable_type: '',
        linkable_id: '',
        platform: '',
        url: '',
        is_active: true,
        sort_order: 0,
    });

    // Fetch users when type changes
    useEffect(() => {
        if (selectedType) {
            setLoadingUsers(true);
            fetch(`/admin/api/${selectedType}s`)
                .then(response => response.json())
                .then(data => {
                    setUsers(data);
                    setLoadingUsers(false);
                })
                .catch(() => {
                    setUsers([]);
                    setLoadingUsers(false);
                });
        }
    }, [selectedType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/social-links', {
            onSuccess: () => {
                reset();
                setSelectedType('');
                setUsers([]);
            },
        });
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

    return (
        <>
            <Head title="Create Social Link" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <InertiaLink href="/admin/social-links">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </InertiaLink>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Social Link</h1>
                        <p className="text-muted-foreground">
                            Add a new social media link for a user or admin
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Link className="h-5 w-5 mr-2" />
                                Social Link Details
                            </CardTitle>
                            <CardDescription>
                                Fill in the details to create a new social media link
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Linkable Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="linkable_type">Link Type</Label>
                                    <Select 
                                        value={selectedType} 
                                        onValueChange={(value) => {
                                            setSelectedType(value);
                                            setData('linkable_type', value);
                                            setData('linkable_id', '');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select link type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {linkableTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.linkable_type} />
                                </div>

                                {/* Linkable User */}
                                {selectedType && (
                                    <div className="space-y-2">
                                        <Label htmlFor="linkable_id">
                                            {selectedType === 'admin' ? 'Admin User' : 'Regular User'}
                                        </Label>
                                        <Select 
                                            value={data.linkable_id} 
                                            onValueChange={(value) => setData('linkable_id', value)}
                                            disabled={loadingUsers}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingUsers ? "Loading..." : `Select ${selectedType}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.linkable_id} />
                                    </div>
                                )}

                                {/* Platform */}
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform</Label>
                                    <Select 
                                        value={data.platform} 
                                        onValueChange={(value) => setData('platform', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {platforms.map((platform) => (
                                                <SelectItem key={platform} value={platform}>
                                                    {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.platform} />
                                </div>

                                {/* URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="https://example.com/profile"
                                        required
                                    />
                                    <InputError message={errors.url} />
                                </div>

                                {/* Sort Order */}
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <InputError message={errors.sort_order} />
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
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Social Link
                                            </>
                                        )}
                                    </Button>
                                    <InertiaLink href="/admin/social-links">
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
    );
}
