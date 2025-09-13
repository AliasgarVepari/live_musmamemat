import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';

interface ChartData {
    month: string;
    ads: number;
    users: number;
}

interface CategoryData {
    name: string;
    ads_count: number;
}

interface DashboardChartsProps {
    adTrends: ChartData[];
    topCategories: CategoryData[];
}

export function DashboardCharts({ adTrends, topCategories }: DashboardChartsProps) {
    // Find max values for scaling
    const maxAds = Math.max(...adTrends.map(trend => trend.ads));
    const maxUsers = Math.max(...adTrends.map(trend => trend.users));
    const maxCategoryAds = Math.max(...topCategories.map(cat => cat.ads_count));

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Ad Trends Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Ad & User Trends</CardTitle>
                    <p className="text-sm text-muted-foreground">Last 6 months activity</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {adTrends.map((trend, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{trend.month}</span>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-blue-600">{trend.ads} ads</span>
                                        <span className="text-green-600">{trend.users} users</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {/* Ads Bar */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-blue-600 w-12">Ads:</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${maxAds > 0 ? (trend.ads / maxAds) * 100 : 0}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 w-8">{trend.ads}</span>
                                    </div>
                                    {/* Users Bar */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-green-600 w-12">Users:</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${maxUsers > 0 ? (trend.users / maxUsers) * 100 : 0}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 w-8">{trend.users}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Top Categories</CardTitle>
                    <p className="text-sm text-muted-foreground">Most popular ad categories</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topCategories.length > 0 ? (
                            topCategories.map((category, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{category.name}</span>
                                        <Badge variant="secondary">{category.ads_count} ads</Badge>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500 w-8">#{index + 1}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${maxCategoryAds > 0 ? (category.ads_count / maxCategoryAds) * 100 : 0}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 w-8">{category.ads_count}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No categories with ads yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Categories will appear here once ads are posted</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
