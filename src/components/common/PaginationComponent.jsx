import React from 'react';
import {
    Pagination,
    PaginationContent,
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

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={handlePrevious}
                        disabled={currentPage === 0}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
                {[...Array(totalPages).keys()].map(page => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => handlePageClick(e, page)}
                            isActive={currentPage === page}
                        >
                            {page + 1}
                        </PaginationLink>
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
    );
};

export default PaginationComponent;
