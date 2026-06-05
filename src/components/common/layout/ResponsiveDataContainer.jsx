import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import ViewSwitcher from './ViewSwitcher';
import { Card, CardContent } from "@/components/ui/card";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import EmptyState from '../feedback/EmptyState';
import { FileSearch, ChevronUp, ChevronDown } from 'lucide-react';

const ResponsiveDataContainer = ({ 
    title, 
    description, 
    actions, 
    filters,
    columns,
    data,
    renderCard,
    onRowClick,
    loading = false,
    emptyMessage = "No records found.",
    emptyIcon: EmptyIcon = FileSearch,
    emptyActionLabel,
    onEmptyAction,
    onSort,
    sortConfig = { key: null, direction: 'asc' }
}) => {
    const [viewMode, setViewMode] = useState('table');
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

    // Force grid on mobile
    useEffect(() => {
        if (isMobile) {
            setViewMode('grid');
        }
    }, [isMobile]);

    const activeView = isMobile ? 'grid' : viewMode;

    const handleSort = (column) => {
        if (!onSort || !column.sortable) return;
        const key = column.sortKey || column.accessor;
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        onSort(key, direction);
    };

    return (
        <div className="space-y-6">
            {/* Architectural Header Engine */}
            <div className="flex flex-col gap-6">
                {/* Row 1: Title and Mobile Actions */}
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                    <div className="space-y-1">
                        {title && <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase">{title}</h1>}
                        {!isMobile && description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    
                    {/* Primary CTA on Mobile stays on Row 1 */}
                    {isMobile && actions && (
                        <div className="flex shrink-0">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Unified Control Bar: Search, Filters, ViewSwitch, Desktop Actions */}
                <div className={cn(
                    "w-full flex gap-4",
                    isMobile ? "flex-col" : "flex-row items-center justify-between"
                )}>
                    {/* Left: Search & Filters */}
                    <div className={cn(
                        "flex gap-3",
                        isMobile ? "flex-col w-full" : "flex-row items-center flex-1"
                    )}>
                        {filters}
                    </div>

                    {/* Right: View Toggle & Desktop Actions */}
                    {!isMobile && (
                        <div className="flex items-center gap-3 shrink-0">
                            <ViewSwitcher 
                                viewMode={viewMode} 
                                onViewModeChange={setViewMode} 
                            />
                            {actions}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : data.length === 0 ? (
                <EmptyState 
                    icon={EmptyIcon}
                    title="No results found"
                    description={emptyMessage}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                />
            ) : activeView === 'table' ? (
                <Card className="overflow-hidden border-border/50 shadow-sm bg-card/30 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent bg-muted/20 border-b border-border/50">
                                    {columns.map((col, index) => (
                                        <TableHead 
                                            key={index} 
                                            className={cn(
                                                "font-black uppercase tracking-widest text-[10px] h-12 text-muted-foreground/70",
                                                col.sortable && "cursor-pointer select-none hover:text-emerald-500 transition-colors",
                                                col.className
                                            )}
                                            onClick={() => handleSort(col)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.header}
                                                {col.sortable && onSort && (
                                                    <div className="flex flex-col opacity-40 group-hover:opacity-100">
                                                        <ChevronUp size={10} className={cn(
                                                            "mb-[-2px]",
                                                            sortConfig.key === (col.sortKey || col.accessor) && sortConfig.direction === 'asc' ? "text-emerald-500 opacity-100" : ""
                                                        )} />
                                                        <ChevronDown size={10} className={cn(
                                                            "mt-[-2px]",
                                                            sortConfig.key === (col.sortKey || col.accessor) && sortConfig.direction === 'desc' ? "text-emerald-500 opacity-100" : ""
                                                        )} />
                                                    </div>
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, rowIndex) => (
                                    <TableRow 
                                        key={row.id || rowIndex}
                                        onClick={(e) => {
                                            if (e.target.closest('button') || e.target.closest('a')) return;
                                            onRowClick?.(row);
                                        }}
                                        className={cn(
                                            "group transition-all border-b border-border/20 last:border-0",
                                            onRowClick && "cursor-pointer hover:bg-emerald-500/[0.03] dark:hover:bg-emerald-500/[0.05]"
                                        )}
                                    >
                                        {columns.map((col, colIndex) => (
                                            <TableCell 
                                                key={colIndex}
                                                className={cn("py-4", col.className)}
                                            >
                                                {typeof (col.cell || col.render) === 'function' 
                                                    ? (col.cell || col.render)(row, isTablet) 
                                                    : row[col.accessor]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((row, index) => (
                        <div key={row.id || index} onClick={() => onRowClick?.(row)} className={onRowClick ? "cursor-pointer" : ""}>
                            {renderCard(row)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResponsiveDataContainer;