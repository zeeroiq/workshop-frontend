import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ScrapeProgressBar = ({ isRunning, progressRatio, statusMessage, error }) => {
    if (!isRunning && !error && progressRatio === 0) return null;

    const percentage = Math.min(100, Math.max(0, progressRatio * 100));

    return (
        <div className="space-y-2 p-4 border border-border/50 rounded-xl bg-muted/20">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-bold text-foreground">
                    {isRunning && <Loader2 size={16} className="animate-spin text-emerald-500" />}
                    {error && <AlertCircle size={16} className="text-rose-500" />}
                    <span className={cn(error ? "text-rose-500" : "text-foreground")}>
                        {statusMessage || (isRunning ? 'Scraping in progress...' : 'Scrape finished')}
                    </span>
                </div>
                <span className="font-black text-xs text-muted-foreground">
                    {Math.round(percentage)}%
                </span>
            </div>
            
            <Progress 
                value={percentage} 
                className="h-2 w-full bg-border/50" 
                indicatorClassName={cn(
                    "transition-all duration-500 ease-in-out",
                    error ? "bg-rose-500" : "bg-emerald-500"
                )}
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
            />
        </div>
    );
};

export default ScrapeProgressBar;
