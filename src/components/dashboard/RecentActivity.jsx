import React from 'react';
import { User, Wrench, CreditCard, Car } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            type: 'New Customer',
            description: 'John Doe registered',
            time: '2 hours ago',
            icon: <User className="h-5 w-5" />
        },
        {
            id: 2,
            type: 'Job Completed',
            description: 'Oil change for Jane Smith',
            time: '4 hours ago',
            icon: <Wrench className="h-5 w-5" />
        },
        {
            id: 3,
            type: 'Payment Received',
            description: 'Invoice #1001 paid',
            time: '1 day ago',
            icon: <CreditCard className="h-5 w-5" />
        },
        {
            id: 4,
            type: 'Vehicle Added',
            description: 'New vehicle added to customer profile',
            time: '2 days ago',
            icon: <Car className="h-5 w-5" />
        }
    ];

    return (
        <div className="space-y-4">
            {activities.map(activity => (
                <div key={activity.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{activity.icon}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-muted-foreground">{activity.time}</div>
                </div>
            ))}
        </div>
    );
};

export default RecentActivity;