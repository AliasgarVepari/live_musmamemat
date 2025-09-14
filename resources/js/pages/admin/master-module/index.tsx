import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { 
    Link, 
    Settings, 
    MapPin, 
    Tag, 
    DollarSign,
    Plus,
    Eye,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { Link as InertiaLink } from '@inertiajs/react';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Module',
        href: '/admin/master',
    },
];

interface MasterModuleProps {
    stats: {
        social_links: number;
        governorates: number;
        conditions: number;
        price_types: number;
    };
    recent_activity: {
        social_links: Array<{
            id: number;
            platform: string;
            url: string;
            is_active: boolean;
            created_at: string;
        }>;
        governorates: Array<{
            id: number;
            name_en: string;
            name_ar: string;
            is_active: boolean;
            created_at: string;
        }>;
        conditions: Array<{
            id: number;
            name_en: string;
            name_ar: string;
            is_active: boolean;
            sort_order: number;
            created_at: string;
        }>;
        price_types: Array<{
            id: number;
            name_en: string;
            name_ar: string;
            is_active: boolean;
            created_at: string;
        }>;
    };
}

export default function MasterModuleIndex({ stats, recent_activity }: MasterModuleProps) {
    const modules = [
        {
            title: 'Social Links',
            description: 'Manage social media links for users and admins',
            icon: Link,
            count: stats.social_links,
            href: '/admin/social-links',
            color: 'bg-blue-500',
            recent: recent_activity.social_links.slice(0, 3),
        },
        {
            title: 'Governorates',
            description: 'Manage Kuwait governorates for location selection',
            icon: MapPin,
            count: stats.governorates,
            href: '/admin/governorates',
            color: 'bg-green-500',
            recent: recent_activity.governorates.slice(0, 3),
        },
        {
            title: 'Product Conditions',
            description: 'Manage product condition options (New, Used, etc.)',
            icon: Tag,
            count: stats.conditions,
            href: '/admin/conditions',
            color: 'bg-purple-500',
            recent: recent_activity.conditions.slice(0, 3),
        },
        {
            title: 'Price Types',
            description: 'Manage price type options (Fixed, Negotiable, etc.)',
            icon: DollarSign,
            count: stats.price_types,
            href: '/admin/price-types',
            color: 'bg-orange-500',
            recent: recent_activity.price_types.slice(0, 3),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Master Module" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Master Module</h1>
                        <p className="text-muted-foreground">
                            Manage core system data and configurations
                        </p>
                    </div>
                </div>

                {/* Module Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {modules.map((module) => {
                        const IconComponent = module.icon;
                        return (
                            <Card key={module.title} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2 rounded-lg ${module.color} text-white`}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <Badge variant="secondary" className="text-lg font-semibold">
                                            {module.count}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{module.title}</CardTitle>
                                    <CardDescription className="text-sm">
                                        {module.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <InertiaLink href={module.href}>
                                            <Button className="w-full" variant="outline">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Manage
                                            </Button>
                                        </InertiaLink>
                                        
                                        {module.recent.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground">Recent:</p>
                                                <div className="space-y-1">
                                                    {module.recent.map((item, index) => (
                                                        <div key={index} className="flex items-center justify-between text-xs">
                                                            <span className="truncate">
                                                                {module.title === 'Social Links' 
                                                                    ? `${(item as any).platform} - ${(item as any).url}`
                                                                    : module.title === 'Governorates'
                                                                    ? (item as any).name_en
                                                                    : module.title === 'Product Conditions'
                                                                    ? (item as any).name_en
                                                                    : (item as any).name_en
                                                                }
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                {item.is_active ? (
                                                                    <ToggleRight className="h-3 w-3 text-green-500" />
                                                                ) : (
                                                                    <ToggleLeft className="h-3 w-3 text-gray-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts for master module management
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <InertiaLink href="/admin/social-links/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Social Link
                                </Button>
                            </InertiaLink>
                            <InertiaLink href="/admin/governorates/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Governorate
                                </Button>
                            </InertiaLink>
                            <InertiaLink href="/admin/conditions/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Condition
                                </Button>
                            </InertiaLink>
                            <InertiaLink href="/admin/price-types/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Price Type
                                </Button>
                            </InertiaLink>
                        </div>
                    </CardContent>
                </Card>
                </div>
            </>
        </AppLayout>
    );
}
