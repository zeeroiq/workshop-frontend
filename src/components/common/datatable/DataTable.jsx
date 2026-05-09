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
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useIsMobile } from '@/lib/hooks/useWindowSize';

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

    const isMobile = useIsMobile();

    // Mobile: render rows as stacked cards (key: row.id)
    if (isMobile) {
        const rows = table.getRowModel().rows;
        return (
            <div className="space-y-4">
                {rows.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">No results.</div>
                ) : (
                    rows.map(row => (
                        <div key={row.id} className="p-4 border rounded shadow-sm bg-card">
                            {row.getVisibleCells().map(cell => {
                                const header = cell.column.columnDef.header;
                                const headerText = typeof header === 'string' ? header : (cell.column.id || '');
                                return (
                                    <div key={cell.id} className="mb-2">
                                        <div className="text-xs text-muted-foreground">{headerText}</div>
                                        <div className="text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div className="flex items-center justify-end space-x-2 py-4">
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
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="rounded-md border min-w-[700px] md:min-w-full">
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
                                        {header.column.getCanFilter() ? (
                                            <div className="mt-2">
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
            <div className="flex items-center justify-end space-x-2 py-4">
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
    );
};

function Filter({ column }) {
    const columnFilterValue = column.getFilterValue();

    return (
        <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                value={(columnFilterValue ?? '')}
                onChange={e => column.setFilterValue(e.target.value)}
                placeholder={`Search...`}
                className="pl-10"
            />
        </div>
    );
}

export default DataTable;
