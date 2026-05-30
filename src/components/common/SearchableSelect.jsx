import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import LoadingSpinner from './LoadingSpinner';
import {toast} from 'react-toastify';

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
    const inputRef = useRef(null);
    const abortControllerRef = useRef(null);
    
    // Refs to avoid dependency loops in useCallback
    const fetcherRef = useRef(fetcher);
    const getItemKeyRef = useRef(getItemKey);
    const selectedItemRef = useRef(selectedItem);

    useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);
    useEffect(() => { getItemKeyRef.current = getItemKey; }, [getItemKey]);
    useEffect(() => { selectedItemRef.current = selectedItem; }, [selectedItem]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    // Update items when initialData changes, but preserve selected item if needed
    useEffect(() => {
        if (initialData.length > 0) {
            setItems(prevItems => {
                // Merge initialData into current items, avoiding duplicates
                const newItems = [...initialData];
                const existingKeys = new Set(newItems.map(item => getItemKeyRef.current(item).toString()));
                
                prevItems.forEach(item => {
                    const key = getItemKeyRef.current(item).toString();
                    if (!existingKeys.has(key)) {
                        newItems.push(item);
                    }
                });
                return newItems;
            });
        }
    }, [initialData]);

    // Fetch items based on search and pagination
    const fetchItems = useCallback(async (page = 0, search = '') => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();

        try {
            setIsLoading(true);
            const response = await fetcherRef.current(page, INITIAL_PAGE_SIZE, search, { signal: abortControllerRef.current.signal });
            
            // Handle different response structures
            const responseData = response?.data?.content || response?.data?.items || response?.data || [];
            const fetchedItems = Array.isArray(responseData) ? responseData : [];
            
            // Check if there are more items
            const hasMoreItems = fetchedItems.length === INITIAL_PAGE_SIZE;
            
            setItems(prev => {
                const currentGetItemKey = getItemKeyRef.current;
                const currentSelectedItem = selectedItemRef.current;

                if (page === 0) {
                    // When starting a new search, we should still keep the currently selected item if it exists
                    if (currentSelectedItem) {
                        const selectedKey = currentGetItemKey(currentSelectedItem).toString();
                        const isAlreadyInFetched = fetchedItems.some(item => currentGetItemKey(item).toString() === selectedKey);
                        return isAlreadyInFetched ? fetchedItems : [currentSelectedItem, ...fetchedItems];
                    }
                    return fetchedItems;
                }
                
                // For pagination, append new items
                const existingKeys = new Set(prev.map(item => currentGetItemKey(item).toString()));
                const filteredNewItems = fetchedItems.filter(item => !existingKeys.has(currentGetItemKey(item).toString()));
                return [...prev, ...filteredNewItems];
            });
            
            setHasMore(hasMoreItems);
            setCurrentPage(page);
        } catch (error) {
            if (error.name === 'AbortError' || error.message === 'canceled') {
                return; // Ignore aborted requests
            }
            console.error('Fetch error:', error);
            // toast.error(`Failed to fetch items: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependencies because we use refs

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

    // Focus input and load items on open
    useEffect(() => {
        if (isOpen) {
            // Focus the search input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            // Only refresh data on open if we don't have items or if it's the first time
            // This prevents redundant calls if the user just toggles the dropdown
            if (items.length === 0 || searchQuery === '') {
                fetchItems(0, '');
            }
        }
    }, [isOpen, fetchItems]); // items and searchQuery excluded to prevent re-fetching on every open if not needed

    // Update selectedItem when value changes
    useEffect(() => {
        if (value) {
            const found = items.find(item => getItemKey(item).toString() === value.toString());
            setSelectedItem(found || null);
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

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const lowerQuery = searchQuery.toLowerCase();
        return items.filter(item => {
            const displayValue = renderItem(item);
            return displayValue && typeof displayValue === 'string' && 
                   displayValue.toLowerCase().includes(lowerQuery);
        });
    }, [items, searchQuery, renderItem]);

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
                            ref={inputRef}
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="mb-2"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                // Stop propagation for ALL keys to prevent Radix typeahead
                                e.stopPropagation();
                            }}
                        />
                    </div>

                    <div
                        ref={contentRef}
                        onScroll={handleContentScroll}
                        className="overflow-y-auto"
                        style={{ maxHeight: VIRTUAL_LIST_HEIGHT }}
                    >
                        {filteredItems.length === 0 && !isLoading ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                No items found
                            </div>
                        ) : (
                            filteredItems.map((item) => {
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
