import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatsCard = ({ title, value, icon, trend, link }) => {
    const cardContent = (
        <Card className="group relative overflow-hidden bg-card border-border hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground/80 transition-colors">{title}</p>
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-2xl font-black text-foreground tracking-tight">{value}</div>
                    {trend && (
                        <div className={cn(
                            "text-[10px] font-bold flex items-center gap-1 uppercase tracking-tighter",
                            trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}>
                            <div className={cn(
                                "p-0.5 rounded-full",
                                trend.isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
                            )}>
                                {trend.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            </div>
                            <span>{trend.value}% <span className="text-muted-foreground/60 font-medium lowercase">vs last month</span></span>
                        </div>
                    )}
                </div>
                {/* Subtle glow effect */}
                <div className="absolute -bottom-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </CardContent>
        </Card>
    );

    if (link) {
        return <Link to={link}>{cardContent}</Link>;
    }

    return cardContent;
};

export default StatsCard;
