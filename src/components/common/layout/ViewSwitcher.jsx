import React from 'react';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ViewSwitcher = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="hidden md:flex items-center p-1 bg-muted/30 rounded-lg border border-border/50 backdrop-blur-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('table')}
                className={cn(
                    "flex items-center gap-2 h-8 px-3 transition-all duration-300",
                    viewMode === 'table' 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                <TableIcon size={16} />
                <span className="text-xs font-semibold">Table</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                    "flex items-center gap-2 h-8 px-3 transition-all duration-300",
                    viewMode === 'grid' 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                <LayoutGrid size={16} />
                <span className="text-xs font-semibold">Grid</span>
            </Button>
        </div>
    );
};

export default ViewSwitcher;
