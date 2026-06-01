import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = (e) => {
        e.preventDefault();
        if (currentPage > 0) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (currentPage < totalPages - 1) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (e, page) => {
        e.preventDefault();
        onPageChange(page);
    };

    const visiblePages = (() => {
        if (totalPages <= 7) {
            return [...Array(totalPages).keys()];
        }

        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages - 2, currentPage + 1);

        if (currentPage <= 1) {
            start = 1;
            end = Math.min(totalPages - 2, 3);
        }

        if (currentPage >= totalPages - 2) {
            start = Math.max(1, totalPages - 4);
            end = totalPages - 2;
        }

        const pages = [0];

        if (start > 1) {
            pages.push('left-ellipsis');
        }

        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }

        if (end < totalPages - 2) {
            pages.push('right-ellipsis');
        }

        pages.push(totalPages - 1);
        return pages;
    })();

    return (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-medium text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
            </div>
            <Pagination className="w-full sm:w-auto">
                <PaginationContent className="w-full justify-center sm:w-auto">
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={handlePrevious}
                            disabled={currentPage === 0}
                            className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    {visiblePages.map((page, index) => (
                        <PaginationItem key={`${page}-${index}`}>
                            {typeof page === 'number' ? (
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => handlePageClick(e, page)}
                                    isActive={currentPage === page}
                                >
                                    {page + 1}
                                </PaginationLink>
                            ) : (
                                <PaginationEllipsis />
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={handleNext}
                            disabled={currentPage >= totalPages - 1}
                            className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default PaginationComponent;
