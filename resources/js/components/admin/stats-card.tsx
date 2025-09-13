import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    badge?: {
        text: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    };
}

export function StatsCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    badge 
}: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-bold">{value}</div>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {badge && (
                        <Badge variant={badge.variant}>
                            {badge.text}
                        </Badge>
                    )}
                </div>
                {trend && (
                    <div className="flex items-center mt-2">
                        <span className={`text-xs font-medium ${
                            trend.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                            from last month
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
