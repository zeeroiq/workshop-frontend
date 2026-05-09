import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';

const DEBOUNCE_DELAY = 800;
const INITIAL_PAGE_SIZE = 10;
const VIRTUAL_LIST_HEIGHT = 300;

/**
 * SearchableSelect Component
 * A reusable searchable dropdown with pagination and debounced search
 * 
 * @param {Object} props
 * @param {Function} props.fetcher - Async function to fetch items. Signature: (page, pageSize, search) => Promise
 * @param {Function} props.renderItem - Function to render each item. Signature: (item) => string (display text)
 * @param {Function} props.getItemKey - Function to get unique key for item. Signature: (item) => string/number
 * @param {string} props.label - Label for the select
 * @param {string} props.value - Currently selected value (the key)
 * @param {Function} props.onChange - Callback when selection changes. Signature: (itemKey) => void
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {Object} props.className - CSS classes for styling
 * @param {Array} props.initialData - Initial data to display (optional)
 */
const SearchableSelect = ({
    fetcher,
    renderItem,
    getItemKey,
    label,
    value,
    onChange,
    placeholder = 'Select an item',
    disabled = false,
    searchPlaceholder = 'Search...',
    className = {},
    initialData = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState(initialData);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const searchTimeoutRef = useRef(null);
    const contentRef = useRef(null);

    // Fetch items based on search and pagination
    const fetchItems = useCallback(async (page = 0, search = '') => {
        try {
            setIsLoading(true);
            const response = await fetcher(page, INITIAL_PAGE_SIZE, search);
            
            // Handle different response structures
            const responseData = response?.data?.content || response?.data?.items || response?.data || [];
            const newItems = Array.isArray(responseData) ? responseData : [];
            
            // Check if there are more items
            const hasMoreItems = newItems.length === INITIAL_PAGE_SIZE;
            
            if (page === 0) {
                setItems(newItems);
            } else {
                setItems(prev => [...prev, ...newItems]);
            }
            
            setHasMore(hasMoreItems);
            setCurrentPage(page);
        } catch (error) {
            toast.error(`Failed to fetch items: ${error.message}`);
            if (currentPage === 0) {
                setItems([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, currentPage]);

    // Handle search with debounce
    const handleSearch = useCallback((e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Reset pagination on new search
        setCurrentPage(0);

        // Debounce the search
        searchTimeoutRef.current = setTimeout(() => {
            fetchItems(0, query);
        }, DEBOUNCE_DELAY);
    }, [fetchItems]);

    // Initial load when dropdown opens
    useEffect(() => {
        if (isOpen && items.length === 0 && initialData.length === 0) {
            fetchItems(0, searchQuery);
        }
    }, [isOpen, fetchItems, items.length, initialData.length, searchQuery]);

    // Load initial data on mount if provided
    useEffect(() => {
        if (initialData.length > 0) {
            setItems(initialData);
        }
    }, [initialData]);

    // Handle scroll to load more items (infinite scroll)
    const handleContentScroll = useCallback((e) => {
        const element = e.target;
        const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;

        if (isNearBottom && hasMore && !isLoading && items.length > 0) {
            fetchItems(currentPage + 1, searchQuery);
        }
    }, [items.length, hasMore, isLoading, fetchItems, currentPage, searchQuery]);

    // Get selected item display text
    const selectedItemText = useMemo(() => {
        if (!value || !items.length) return placeholder;
        const selected = items.find(item => getItemKey(item).toString() === value.toString());
        return selected ? renderItem(selected) : placeholder;
    }, [value, items, getItemKey, renderItem, placeholder]);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setSearchQuery('');
        }
    };

    return (
        <div className={className.container}>
            {label && <Label>{label}</Label>}
            <Select value={value?.toString() || ''} onOpenChange={handleOpenChange} disabled={disabled}>
                <SelectTrigger>
                    <SelectValue placeholder={selectedItemText} />
                </SelectTrigger>
                <SelectContent className={className.content}>
                    <div className="p-2">
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="mb-2"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>

                    {isLoading && items.length === 0 ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            No items found
                        </div>
                    ) : (
                        <div
                            ref={contentRef}
                            onScroll={handleContentScroll}
                            className="overflow-y-auto"
                            style={{ maxHeight: VIRTUAL_LIST_HEIGHT }}
                        >
                            {items.map((item) => {
                                const itemKey = getItemKey(item);
                                const isSelected = itemKey.toString() === value?.toString();
                                return (
                                    <SelectItem key={itemKey} value={itemKey.toString()}>
                                        {renderItem(item)}
                                    </SelectItem>
                                );
                            })}
                            {isLoading && items.length > 0 && (
                                <div className="flex justify-center py-2">
                                    <LoadingSpinner size="sm" />
                                </div>
                            )}
                            {!hasMore && items.length > 0 && (
                                <div className="text-center py-2 text-xs text-muted-foreground">
                                    No more items
                                </div>
                            )}
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SearchableSelect;
