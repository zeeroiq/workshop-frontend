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
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

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
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const partNumber = String(row.original.partNumber).toLowerCase();
            const name = String(row.original.name).toLowerCase();
            const category = String(row.original.category).toLowerCase();
            const location = String(row.original.location).toLowerCase();
            return partNumber.includes(search) || name.includes(search) || category.includes(search) || location.includes(search);
        },
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
                <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search parts..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-10 pr-4 py-2 rounded-md w-full"
                    />
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        <div
                                            className={`flex items-center ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getCanSort() && (
                                                <span className="ml-2">
                                                    {header.column.getIsSorted() === 'desc' ? <FaSortDown /> : header.column.getIsSorted() === 'asc' ? <FaSortUp /> : <FaSort />}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                 </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden space-y-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const part = row.original;
                        return (
                            <Card key={row.id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold">{part.name}</CardTitle>
                                            <p className="text-sm font-mono text-muted-foreground">{part.partNumber}</p>
                                        </div>
                                        {flexRender(columns.find(c => c.accessorKey === 'status')?.cell, { row })}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Category</p>
                                            <p className="font-medium">{part.category}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider">In Stock</p>
                                            <p className="font-bold text-lg">{part.quantityInStock}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Price</p>
                                            <p className="font-medium">₹{part.mrp?.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Location</p>
                                            <p className="font-medium">{part.location || '-'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/50">
                                        {flexRender(columns.find(c => c.id === 'actions')?.cell, { row })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <p className="text-center text-muted-foreground py-8">No results found.</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    {table.getFilteredRowModel().rows.length} of{' '}
                    {data.length} row(s) displayed.
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 order-1 sm:order-2 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
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
