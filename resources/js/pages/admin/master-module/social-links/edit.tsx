import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { Switch } from '@/components/admin/ui/switch';
import InputError from '@/components/admin/input-error';
import { ArrowLeft, Link, Save } from 'lucide-react';
import { Link as InertiaLink, useForm, router } from '@inertiajs/react';
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
        title: 'Edit',
        href: '/admin/social-links/edit',
    },
];

interface SocialLink {
    id: number;
    platform: string;
    url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface EditSocialLinkProps {
    socialLink: SocialLink;
    platforms: string[];
}

export default function EditSocialLink({ socialLink, platforms }: EditSocialLinkProps) {
    const { data, setData, put, processing, errors } = useForm({
        platform: socialLink.platform,
        url: socialLink.url,
        is_active: socialLink.is_active,
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/social-links/${socialLink.id}`, {
            onSuccess: () => {
                // Mark for refresh when navigating back
                localStorage.setItem('admin-social-links-refresh', 'true');
            },
            onError: (errors) => {
                // Show error dialog for validation errors
                const errorMessages = Object.values(errors).flat();
                const errorMessage = errorMessages.join(', ');
                showErrorDialog('Validation Error', errorMessage);
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
                <Head title="Edit Social Link" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                // Mark that we're navigating back from a detail page
                                localStorage.setItem('admin-social-links-refresh', 'true');
                                router.visit('/admin/social-links', { 
                                    method: 'get',
                                    preserveState: false,
                                    preserveScroll: false
                                });
                            }}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Social Link</h1>
                            <p className="text-muted-foreground">
                                Update social media link information
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
                                    Update the platform and URL for the social media link
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

                                    {/* Active Status */}
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>
                                    <InputError message={errors.is_active} />

                                    {/* Submit Buttons */}
                                    <div className="flex items-center space-x-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Social Link
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
