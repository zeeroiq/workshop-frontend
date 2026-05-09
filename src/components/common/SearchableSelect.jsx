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
    const [selectedItem, setSelectedItem] = useState(null);
    const searchTimeoutRef = useRef(null);
    const contentRef = useRef(null);

    // Update items when initialData changes, but preserve selected item if needed
    useEffect(() => {
        if (initialData.length > 0) {
            setItems(prevItems => {
                // Merge initialData into current items, avoiding duplicates
                const newItems = [...initialData];
                const existingKeys = new Set(newItems.map(item => getItemKey(item).toString()));
                
                prevItems.forEach(item => {
                    const key = getItemKey(item).toString();
                    if (!existingKeys.has(key)) {
                        newItems.push(item);
                    }
                });
                return newItems;
            });
        }
    }, [initialData, getItemKey]);

    // Fetch items based on search and pagination
    const fetchItems = useCallback(async (page = 0, search = '') => {
        try {
            setIsLoading(true);
            const response = await fetcher(page, INITIAL_PAGE_SIZE, search);
            
            // Handle different response structures
            const responseData = response?.data?.content || response?.data?.items || response?.data || [];
            const fetchedItems = Array.isArray(responseData) ? responseData : [];
            
            // Check if there are more items
            const hasMoreItems = fetchedItems.length === INITIAL_PAGE_SIZE;
            
            setItems(prev => {
                if (page === 0) {
                    // When starting a new search, we should still keep the currently selected item if it exists
                    if (selectedItem) {
                        const selectedKey = getItemKey(selectedItem).toString();
                        const isAlreadyInFetched = fetchedItems.some(item => getItemKey(item).toString() === selectedKey);
                        return isAlreadyInFetched ? fetchedItems : [selectedItem, ...fetchedItems];
                    }
                    return fetchedItems;
                }
                
                // For pagination, append new items
                const existingKeys = new Set(prev.map(item => getItemKey(item).toString()));
                const filteredNewItems = fetchedItems.filter(item => !existingKeys.has(getItemKey(item).toString()));
                return [...prev, ...filteredNewItems];
            });
            
            setHasMore(hasMoreItems);
            setCurrentPage(page);
        } catch (error) {
            toast.error(`Failed to fetch items: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, selectedItem, getItemKey]);

    // Handle search with debounce
    const handleSearch = useCallback((e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setCurrentPage(0);

        searchTimeoutRef.current = setTimeout(() => {
            fetchItems(0, query);
        }, DEBOUNCE_DELAY);
    }, [fetchItems]);

    // Initial load when dropdown opens
    useEffect(() => {
        if (isOpen && items.length === 0) {
            fetchItems(0, searchQuery);
        }
    }, [isOpen, fetchItems, items.length, searchQuery]);

    // Update selectedItem when value changes
    useEffect(() => {
        if (value) {
            const found = items.find(item => getItemKey(item).toString() === value.toString());
            if (found) {
                setSelectedItem(found);
            }
        } else {
            setSelectedItem(null);
        }
    }, [value, items, getItemKey]);

    // Handle scroll to load more items (infinite scroll)
    const handleContentScroll = useCallback((e) => {
        const element = e.target;
        const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;

        if (isNearBottom && hasMore && !isLoading) {
            fetchItems(currentPage + 1, searchQuery);
        }
    }, [hasMore, isLoading, fetchItems, currentPage, searchQuery]);

    // Get selected item display text
    const selectedItemText = useMemo(() => {
        if (!value) return placeholder;
        if (selectedItem) return renderItem(selectedItem);
        
        // Fallback search in items if selectedItem state isn't updated yet
        const found = items.find(item => getItemKey(item).toString() === value.toString());
        return found ? renderItem(found) : placeholder;
    }, [value, selectedItem, items, getItemKey, renderItem, placeholder]);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setSearchQuery('');
        }
    };

    const handleValueChange = (val) => {
        const item = items.find(i => getItemKey(i).toString() === val);
        if (item) {
            setSelectedItem(item);
        }
        if (onChange) {
            onChange(val, item);
        }
    };

    return (
        <div className={className.container}>
            {label && <Label className="mb-1 block">{label}</Label>}
            <Select value={value?.toString() || ''} onValueChange={handleValueChange} onOpenChange={handleOpenChange} disabled={disabled}>
                <SelectTrigger className="w-full">
                    <SelectValue>
                        {selectedItemText}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className={className.content}>
                    <div className="p-2 sticky top-0 bg-popover z-10">
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="mb-2"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                // Prevent Radix from handling keys like Space or Enter when typing in search
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.stopPropagation();
                                }
                            }}
                        />
                    </div>

                    <div
                        ref={contentRef}
                        onScroll={handleContentScroll}
                        className="overflow-y-auto"
                        style={{ maxHeight: VIRTUAL_LIST_HEIGHT }}
                    >
                        {items.length === 0 && !isLoading ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                No items found
                            </div>
                        ) : (
                            items.map((item) => {
                                const itemKey = getItemKey(item).toString();
                                return (
                                    <SelectItem key={itemKey} value={itemKey}>
                                        {renderItem(item)}
                                    </SelectItem>
                                );
                            })
                        )}
                        {isLoading && (
                            <div className="flex justify-center py-2">
                                <LoadingSpinner size="sm" />
                            </div>
                        )}
                        {!hasMore && items.length > 0 && !isLoading && (
                            <div className="text-center py-2 text-xs text-muted-foreground">
                                No more items
                            </div>
                        )}
                    </div>
                </SelectContent>
            </Select>
        </div>
    );
};

export default SearchableSelect;
