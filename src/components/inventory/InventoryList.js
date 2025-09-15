import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    LinearProgress,
    Typography,
    Box
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const InventoryList = ({ inventory, loading, onEdit, onDelete }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter inventory based on search term
    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginate the data
    const paginatedInventory = filteredInventory.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '16px'
                    }}
                />
            </Box>

            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="inventory table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Part Number</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Cost</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedInventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                                        {searchTerm ? 'No matching items found' : 'No inventory items available'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedInventory.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>{item.partNumber}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                    <TableCell align="right">${item.cost.toFixed(2)}</TableCell>
                                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={item.quantity === 0 ? 'Out of Stock' :
                                                item.quantity <= item.minStockLevel ? 'Low Stock' : 'In Stock'}
                                            color={item.quantity === 0 ? 'error' :
                                                item.quantity <= item.minStockLevel ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => onEdit(item)}
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => onDelete(item.id)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInventory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default InventoryList;