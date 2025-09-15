import { DashboardCharts } from '@/components/admin/dashboard-charts';
import { RecentActivity } from '@/components/admin/recent-activity';
import { StatsCard } from '@/components/admin/stats-card';
import AppLayout from '@/layouts/admin/app-layout';
import { dashboard } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, DollarSign, Image, Link, ShoppingBag, Star, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        users: {
            total: number;
            new_today: number;
            new_this_month: number;
            active: number;
            growth: number;
        };
        ads: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            featured: number;
            this_month: number;
        };
        revenue: {
            total: number;
            monthly: number;
            last_month: number;
            growth: number;
        };
        banners: {
            total: number;
            active: number;
        };
        social_links: {
            total: number;
            active: number;
        };
    };
    recent_activity: {
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
    };
    charts: {
        ad_trends: Array<{
            month: string;
            ads: number;
            users: number;
        }>;
        top_categories: Array<{
            name: string;
            ads_count: number;
        }>;
    };
}

export default function Dashboard({ stats, recent_activity, charts }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Stats Overview */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Users"
                            value={stats.users.total.toLocaleString()}
                            subtitle={`${stats.users.new_today} new today`}
                            icon={Users}
                            trend={{
                                value: stats.users.growth,
                                isPositive: stats.users.growth >= 0,
                            }}
                            badge={{
                                text: `${stats.users.active} subscribed`,
                                variant: 'default',
                            }}
                        />
                        <StatsCard
                            title="Total Ads"
                            value={stats.ads.total.toLocaleString()}
                            subtitle={`${stats.ads.this_month} this month`}
                            icon={ShoppingBag}
                            badge={{
                                text: `${stats.ads.pending} pending`,
                                variant: 'outline',
                            }}
                        />
                        <StatsCard
                            title="Revenue"
                            value={`$${stats.revenue.total.toLocaleString()}`}
                            subtitle={`$${stats.revenue.monthly.toLocaleString()} this month`}
                            icon={DollarSign}
                            trend={{
                                value: stats.revenue.growth,
                                isPositive: stats.revenue.growth >= 0,
                            }}
                        />
                        <StatsCard
                            title="Featured Ads"
                            value={stats.ads.featured.toLocaleString()}
                            subtitle={`${stats.ads.approved} approved`}
                            icon={Star}
                        />
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard title="Banners" value={stats.banners.total} subtitle={`${stats.banners.active} active`} icon={Image} />
                        <StatsCard
                            title="Social Links"
                            value={stats.social_links.total}
                            subtitle={`${stats.social_links.active} active`}
                            icon={Link}
                        />
                        <StatsCard
                            title="Ad Status"
                            value={stats.ads.approved}
                            subtitle={`${stats.ads.pending} pending approval`}
                            icon={AlertCircle}
                        />
                    </div>

                    {/* Charts */}
                    <DashboardCharts adTrends={charts.ad_trends} topCategories={charts.top_categories} />

                    {/* Recent Activity */}
                    <RecentActivity ads={recent_activity.ads} users={recent_activity.users} />
                </div>
            </>
        </AppLayout>
    );
}
