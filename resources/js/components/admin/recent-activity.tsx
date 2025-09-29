import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { ScrollArea } from '@/components/admin/ui/scroll-area';
import { Separator } from '@/components/admin/ui/separator';
import { 
    User, 
    ShoppingBag, 
    Eye, 
    Clock, 
    ArrowRight,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface RecentActivityProps {
    ads: Array<{
        id: number;
        title: string;
        user_name: string;
        category: string;
        status: 'draft' | 'active' | 'inactive' | 'expired' | 'sold' | 'delete';
        created_at: string;
        price: number;
    }>;
    users: Array<{
        id: number;
        email: string;
        phone?: string;
        is_subscribed: boolean;
        created_at: string;
        ads_count: number;
    }>;
}

export function RecentActivity({ ads, users }: RecentActivityProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'inactive':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'draft':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case 'expired':
                return <Clock className="h-4 w-4 text-gray-600" />;
            case 'sold':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge variant="destructive">Inactive</Badge>;
            case 'draft':
                return <Badge variant="outline" className="border-yellow-300 text-yellow-800">Draft</Badge>;
            case 'expired':
                return <Badge variant="secondary">Expired</Badge>;
            case 'sold':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">Sold</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Ads */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Ads</CardTitle>
                    {/* <Button variant="outline" size="sm">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button> */}
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                            {ads.map((ad, index) => (
                                <div key={ad.id}>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {getStatusIcon(ad.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {ad.title}
                                                </p>
                                                {getStatusBadge(ad.status)}
                                            </div>
                                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                                                <span>by {ad.user_name}</span>
                                                <span>•</span>
                                                <span>{ad.category}</span>
                                                {ad.price && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-medium">${ad.price}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400">
                                                {ad.created_at}
                                            </div>
                                        </div>
                                    </div>
                                    {index < ads.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
                    {/* <Button variant="outline" size="sm">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button> */}
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                            {users.map((user, index) => (
                                <div key={user.id}>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.email}
                                                </p>
                                                {user.is_subscribed && (
                                                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                        Subscribed
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                                                {user.phone && (
                                                    <>
                                                        <span>{user.phone}</span>
                                                        <span>•</span>
                                                    </>
                                                )}
                                                <span>{user.ads_count} ads</span>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400">
                                                {user.created_at}
                                            </div>
                                        </div>
                                    </div>
                                    {index < users.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
