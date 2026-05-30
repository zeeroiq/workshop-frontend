import React from 'react';
import { User, Wrench, CreditCard, Car, CheckCircle2, Package, Receipt, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            type: 'New Customer',
            description: 'John Doe registered',
            time: '2 hours ago',
            icon: <User className="h-4 w-4" />,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-500/10'
        },
        {
            id: 2,
            type: 'Job Completed',
            description: 'Oil change for Jane Smith',
            time: '4 hours ago',
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-500/10'
        },
        {
            id: 3,
            type: 'Payment Received',
            description: 'Invoice #1001 paid',
            time: '1 day ago',
            icon: <Receipt className="h-4 w-4" />,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-500/10'
        },
        {
            id: 4,
            type: 'Vehicle Added',
            description: 'New vehicle added to customer profile',
            time: '2 days ago',
            icon: <Car className="h-4 w-4" />,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-500/10'
        }
    ];

    return (
        <div className="space-y-6">
            {activities.map(activity => (
                <div key={activity.id} className="group flex items-start gap-4">
                    <div className="relative">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center border border-border/50 transition-transform group-hover:scale-110",
                            activity.bgColor,
                            activity.color
                        )}>
                            {activity.icon}
                        </div>
                        {/* Connecting line */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-border last:hidden"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-bold text-foreground/90 group-hover:text-foreground transition-colors">{activity.type}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                <Clock className="h-3 w-3" />
                                {activity.time}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed truncate group-hover:text-foreground/70 transition-colors">
                            {activity.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentActivity;
