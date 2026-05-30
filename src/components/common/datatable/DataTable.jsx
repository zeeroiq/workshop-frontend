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
        <div className='space-y-4'>
            <div className='rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm'>
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
            <div className='flex items-center justify-between px-2'>
                <div className='text-xs text-muted-foreground font-medium'>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className='flex items-center space-x-2'>
                    <Button
                        variant='outline'
                        className='h-8 w-8 p-0 rounded-lg border-border/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='outline'
                        className='h-8 w-8 p-0 rounded-lg border-border/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className='h-4 w-4' />
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
                className='h-8 pl-9 bg-muted/20 border-border/40 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all text-xs'
            />
        </div>
    );
}

export default DataTable;