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
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        {title && <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>}
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        {!isMobile && (
                            <ViewSwitcher 
                                viewMode={viewMode} 
                                onViewModeChange={setViewMode} 
                            />
                        )}
                        {actions}
                    </div>
                </div>

                {/* Filters Section */}
                {filters && (
                    <div className="w-full">
                        {filters}
                    </div>
                )}
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
                <Card className="overflow-hidden border-border/50 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent bg-muted/20">
                                    {columns.map((col, index) => (
                                        <TableHead 
                                            key={index} 
                                            className={cn(
                                                "font-semibold uppercase tracking-wider text-[10px]",
                                                col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                                                col.className
                                            )}
                                            onClick={() => handleSort(col)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.header}
                                                {col.sortable && onSort && (
                                                    <div className="flex flex-col">
                                                        <ChevronUp size={10} className={cn(
                                                            "mb-[-2px]",
                                                            sortConfig.key === (col.sortKey || col.accessor) && sortConfig.direction === 'asc' ? "text-emerald-500" : "text-muted-foreground/30"
                                                        )} />
                                                        <ChevronDown size={10} className={cn(
                                                            "mt-[-2px]",
                                                            sortConfig.key === (col.sortKey || col.accessor) && sortConfig.direction === 'desc' ? "text-emerald-500" : "text-muted-foreground/30"
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
                                            // Don't trigger if clicking a button or link
                                            if (e.target.closest('button') || e.target.closest('a')) return;
                                            onRowClick?.(row);
                                        }}
                                        className={cn(
                                            "group transition-colors",
                                            onRowClick && "cursor-pointer hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.05]"
                                        )}
                                    >
                                        {columns.map((col, colIndex) => (
                                            <TableCell 
                                                key={colIndex}
                                                className={cn("py-3", col.className)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
