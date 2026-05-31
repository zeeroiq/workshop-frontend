import React, { useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaBarcode, FaBoxes, FaTags, FaMapMarkerAlt } from 'react-icons/fa';
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from "@/lib/utils";

const PartsDataTable = ({ columns, data }) => {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        state: {
            sorting,
            globalFilter,
            pagination,
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground opacity-50" />
                    <Input
                        placeholder="Search parts catalog..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="h-11 pl-10 bg-background/50 border-border/50 font-bold"
                    />
                </div>
            </div>

            {/* Desktop Spec Table */}
            <div className="hidden lg:block rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-xl">
                <Table>
                    <TableHeader className="bg-muted/20">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/30">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">
                                        <div
                                            className={cn("flex items-center gap-2", header.column.getCanSort() && "cursor-pointer select-none")}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span className="text-primary/50">
                                                    {header.column.getIsSorted() === 'desc' ? <FaSortDown /> : header.column.getIsSorted() === 'asc' ? <FaSortUp /> : <FaSort />}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="divide-y divide-border/20">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-primary/[0.02] transition-colors group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-5">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 text-center text-muted-foreground italic font-medium">
                                    Zero catalog entries matching criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Decomposition */}
            <div className="lg:hidden space-y-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const part = row.original;
                        const actionsCell = row.getVisibleCells().find(c => c.column.id === 'actions');
                        const statusCell = row.getVisibleCells().find(c => c.column.id === 'status' || c.column.columnDef.accessorKey === 'status');
                        
                        return (
                            <Card key={row.id} className="border-border/50 bg-background/50 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden active:scale-[0.98] transition-all">
                                <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground leading-none">
                                                {part.name}
                                            </CardTitle>
                                            <p className="text-[10px] font-black tracking-widest text-primary uppercase opacity-70 flex items-center gap-1.5">
                                                <FaBarcode className="text-[8px]" /> {part.partNumber}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                            {statusCell && flexRender(statusCell.column.columnDef.cell, statusCell.getContext())}
                                            {actionsCell && flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5"><FaTags className="text-[8px]" /> Classification</p>
                                            <p className="font-bold text-foreground text-xs uppercase">{part.category || 'GENERAL'}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center justify-end gap-1.5"><FaBoxes className="text-[8px]" /> In-Stock</p>
                                            <p className={cn("font-black text-sm", part.quantityInStock <= part.minStockLevel ? "text-red-500" : "text-emerald-500")}>
                                                {part.quantityInStock} <span className="text-[9px] opacity-40 uppercase">Units</span>
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Valuation (MRP)</p>
                                            <p className="font-black text-foreground">₹{part.mrp?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center justify-end gap-1.5"><FaMapMarkerAlt className="text-[8px]" /> Facility Node</p>
                                            <p className="font-bold text-foreground text-xs uppercase">{part.location || 'DEFAULT'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Zero active nodes found</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4 px-2">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                    Showing {table.getFilteredRowModel().rows.length} of {data.length} total entries
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                    <div className="flex items-center gap-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Page Density</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger className="h-9 w-20 bg-background/50 border-border/50 rounded-xl font-bold text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                                {[10, 25, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`} className="font-bold text-xs">{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-9 px-4 rounded-xl border-border/50 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-sm"
                        >
                            Previous
                        </Button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-9 px-4 rounded-xl border-border/50 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartsDataTable;
