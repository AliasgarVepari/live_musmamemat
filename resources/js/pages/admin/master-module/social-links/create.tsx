import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import InputError from '@/components/admin/input-error';
import { ArrowLeft, Link, Plus } from 'lucide-react';
import { Link as InertiaLink, useForm } from '@inertiajs/react';
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
    {
        title: 'Create',
        href: '/admin/social-links/create',
    },
];

interface CreateSocialLinkProps {
    platforms: string[];
}

export default function CreateSocialLink({ platforms }: CreateSocialLinkProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        platform: '',
        url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/social-links', {
            onSuccess: () => {
                reset();
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
        <AppLayout breadcrumbs={breadcrumbs}>
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
                            Select a platform and enter the URL for the social media link
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
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
        </AppLayout>
    );
}
