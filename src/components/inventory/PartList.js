import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Chip,
    IconButton,
    Typography,
    Alert,
    Tooltip,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Edit,
    Delete,
    Search,
    FilterList,
    Add,
    Inventory
} from '@mui/icons-material';

const PartList = ({ parts, onEdit, onDelete, onAdd, loading, error }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(parts.map(part => part.category))];
        return uniqueCategories.filter(cat => cat).sort();
    }, [parts]);

    const filteredParts = useMemo(() => {
        return parts.filter(part => {
            const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                part.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;

            let matchesStock = true;
            if (stockFilter === 'low') {
                matchesStock = part.quantityInStock <= part.minStockLevel && part.quantityInStock > 0;
            } else if (stockFilter === 'out') {
                matchesStock = part.quantityInStock === 0;
            } else if (stockFilter === 'critical') {
                matchesStock = part.quantityInStock > 0 && part.quantityInStock <= (part.minStockLevel / 2);
            }

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [parts, searchTerm, categoryFilter, stockFilter]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStockStatus = (part) => {
        if (part.quantityInStock === 0) {
            return { status: 'Out of Stock', color: 'error' };
        } else if (part.quantityInStock <= part.minStockLevel / 2) {
            return { status: 'Critical', color: 'error' };
        } else if (part.quantityInStock <= part.minStockLevel) {
            return { status: 'Low Stock', color: 'warning' };
        } else {
            return { status: 'In Stock', color: 'success' };
        }
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Loading parts...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Error loading parts: {error}
            </Alert>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" display="flex" alignItems="center">
                    <Inventory sx={{ mr: 1 }} />
                    Parts Inventory ({filteredParts.length})
                </Typography>
                <Box display="flex" gap={1}>
                    <TextField
                        placeholder="Search parts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                        }}
                        size="small"
                    />
                    <Tooltip title="Filter parts">
                        <IconButton onClick={handleFilterClick}>
                            <FilterList />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={handleFilterClose}
                    >
                        <MenuItem onClick={() => setCategoryFilter('all')}>
                            All Categories
                        </MenuItem>
                        {categories.map(category => (
                            <MenuItem
                                key={category}
                                onClick={() => {
                                    setCategoryFilter(category);
                                    handleFilterClose();
                                }}
                            >
                                {category}
                            </MenuItem>
                        ))}
                        <MenuItem divider />
                        <MenuItem onClick={() => setStockFilter('all')}>
                            All Stock Status
                        </MenuItem>
                        <MenuItem onClick={() => setStockFilter('low')}>
                            Low Stock
                        </MenuItem>
                        <MenuItem onClick={() => setStockFilter('critical')}>
                            Critical Stock
                        </MenuItem>
                        <MenuItem onClick={() => setStockFilter('out')}>
                            Out of Stock
                        </MenuItem>
                    </Menu>
                    <IconButton color="primary" onClick={onAdd}>
                        <Add />
                    </IconButton>
                </Box>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Part Number</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Min Stock</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredParts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((part) => {
                                const stockStatus = getStockStatus(part);
                                return (
                                    <TableRow
                                        key={part.id}
                                        sx={{
                                            '&:hover': { backgroundColor: 'action.hover' },
                                            ...(stockStatus.color === 'error' && { backgroundColor: 'error.light' }),
                                            ...(stockStatus.color === 'warning' && { backgroundColor: 'warning.light' })
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {part.partNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {part.name}
                                                </Typography>
                                                {part.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {part.description.length > 50
                                                            ? `${part.description.substring(0, 50)}...`
                                                            : part.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{part.category}</TableCell>
                                        <TableCell>
                                            <Typography
                                                fontWeight="bold"
                                                color={part.quantityInStock === 0 ? 'error' : 'text.primary'}
                                            >
                                                {part.quantityInStock}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{part.minStockLevel}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    ${part.sellingPrice}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Cost: ${part.costPrice}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={stockStatus.status}
                                                color={stockStatus.color}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Tooltip title="Edit part">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEdit(part)}
                                                        color="primary"
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete part">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDelete(part.id)}
                                                        color="error"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredParts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {filteredParts.length === 0 && (
                <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">
                        {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                            ? 'No parts match your search criteria'
                            : 'No parts found. Add your first part to get started.'}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default PartList;