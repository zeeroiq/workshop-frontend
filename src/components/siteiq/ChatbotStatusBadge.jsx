import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const statusConfig = {
    CREATED: {
        label: 'CREATED',
        icon: Clock,
        className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        ariaLabel: 'Status: Created'
    },
    SCRAPING: {
        label: 'SCRAPING',
        icon: Loader2,
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        iconClass: 'animate-spin',
        ariaLabel: 'Status: Scraping in progress'
    },
    TRAINED: {
        label: 'TRAINED',
        icon: CheckCircle2,
        className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        ariaLabel: 'Status: Trained and ready'
    },
    ERROR: {
        label: 'ERROR',
        icon: AlertCircle,
        className: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        ariaLabel: 'Status: Error'
    }
};

const ChatbotStatusBadge = ({ status, className }) => {
    const config = statusConfig[status] || statusConfig.CREATED;
    const Icon = config.icon;

    return (
        <Badge 
            variant="outline" 
            className={cn('font-black text-[10px] uppercase tracking-widest gap-1 border border-border/50', config.className, className)}
            aria-label={config.ariaLabel}
        >
            <Icon size={12} className={config.iconClass} />
            {config.label}
        </Badge>
    );
};

export default ChatbotStatusBadge;
