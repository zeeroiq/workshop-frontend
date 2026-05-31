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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

const DataTable = ({ columns, data, setData }) => {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
        meta: {
            updateData: (rowIndex, columnId, value) => {
                setData(old => old.map((row, index) => {
                    if (index === rowIndex) {
                        return {
                            ...old[rowIndex],
                            [columnId]: value,
                        }
                    }
                    return row
                }))
            }
        }
    });

    return (
        <div className='space-y-6'>
            {/* Desktop View: Table */}
            <div className='hidden md:block rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='hover:bg-transparent border-b border-border/50'>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        <div
                                            className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getCanSort() && (
                                                <span className='transition-colors'>
                                                    {header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronDown className='h-3.5 w-3.5 text-emerald-500' />
                                                    ) : header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronUp className='h-3.5 w-3.5 text-emerald-500' />
                                                    ) : (
                                                        <ArrowUpDown className='h-3.5 w-3.5 text-muted-foreground/50' />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {header.column.getCanFilter() ? (
                                            <div className='mt-2'>
                                                <Filter column={header.column} />
                                            </div>
                                        ) : null}
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
                                    className='hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.05] transition-colors'
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
                                    className='h-24 text-center text-muted-foreground'
                                >
                                    No results found.
                                 </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className='md:hidden space-y-4'>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <Card key={row.id} className='border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden'>
                            <CardContent className='p-4 space-y-4'>
                                {row.getVisibleCells().map((cell) => {
                                    const header = cell.column.columnDef.header;
                                    const isActions = cell.column.id === 'actions' || (typeof header === 'string' && header.toLowerCase().includes('actions'));
                                    
                                    if (isActions) {
                                        return (
                                            <div key={cell.id} className='pt-4 border-t border-border/50 flex justify-end gap-2'>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={cell.id} className='flex justify-between items-start gap-4'>
                                            <span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 shrink-0 mt-1'>
                                                {typeof header === 'string' ? header : cell.column.id}
                                            </span>
                                            <div className='text-sm font-bold text-foreground text-right'>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className='text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/50'>
                        <p className='text-muted-foreground font-medium'>No entries available.</p>
                    </div>
                )}
            </div>

            <div className='flex items-center justify-between px-2'>
                <div className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
                    P. {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                </div>
                <div className='flex items-center space-x-2'>
                    <Button
                        variant='outline'
                        className='h-9 px-4 rounded-xl border-border/50 font-bold text-xs shadow-sm disabled:opacity-30'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className='h-4 w-4 mr-1' /> Previous
                    </Button>
                    <Button
                        variant='outline'
                        className='h-9 px-4 rounded-xl border-border/50 font-bold text-xs shadow-sm disabled:opacity-30'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next <ChevronRight className='h-4 w-4 ml-1' />
                    </Button>
                </div>
            </div>
        </div>
    );
};

function Filter({ column }) {
    const columnFilterValue = column.getFilterValue();

    return (
        <div className='relative group'>
            <Search className='absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground/50 w-3.5 h-3.5 group-focus-within:text-emerald-500 transition-colors' />
            <Input
                type='text'
                value={(columnFilterValue ?? '')}
                onChange={e => column.setFilterValue(e.target.value)}
                placeholder={`Search...`}
                className='h-8 pl-9 bg-muted/20 border-border/40 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all text-[10px] font-bold'
            />
        </div>
    );
}

export default DataTable;
