import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatsCard = ({ title, value, icon, trend, link }) => {
    const cardContent = (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className={cn(
                        "text-xs text-muted-foreground flex items-center",
                        trend.isPositive ? "text-green-500" : "text-red-500"
                    )}>
                        {trend.isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        {trend.value}% vs last month
                    </p>
                )}
            </CardContent>
        </Card>
    );

    if (link) {
        return <Link to={link}>{cardContent}</Link>;
    }

    return cardContent;
};

export default StatsCard;