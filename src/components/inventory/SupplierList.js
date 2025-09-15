import React, { useState } from 'react';
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
    IconButton,
    Typography,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tooltip
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Search,
    Phone,
    Email,
    Business
} from '@mui/icons-material';

const SupplierList = ({ suppliers, onEdit, onDelete, onCreate, loading, error }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (supplier) => {
        setSelectedSupplier(supplier);
        setDetailDialogOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailDialogOpen(false);
        setSelectedSupplier(null);
    };

    const getPartCount = (supplierId) => {
        // This would typically come from your data
        return suppliers.find(s => s.id === supplierId)?.partCount || 0;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Loading suppliers...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Error loading suppliers: {error}
            </Alert>
        );
    }

    return (
        <>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" display="flex" alignItems="center">
                        <Business sx={{ mr: 1 }} />
                        Suppliers ({filteredSuppliers.length})
                    </Typography>
                    <Box display="flex" gap={1}>
                        <TextField
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                            }}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={onCreate}
                        >
                            Add Supplier
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Contact Person</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Parts Supplied</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSuppliers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((supplier) => (
                                    <TableRow
                                        key={supplier.id}
                                        hover
                                        onClick={() => handleViewDetails(supplier)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>
                                            <Typography fontWeight="medium">
                                                {supplier.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{supplier.contactPerson || 'N/A'}</TableCell>
                                        <TableCell>
                                            {supplier.phone && (
                                                <Box display="flex" alignItems="center">
                                                    <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                    {supplier.phone}
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {supplier.email && (
                                                <Box display="flex" alignItems="center">
                                                    <Email sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                    {supplier.email}
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getPartCount(supplier.id)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label="Active"
                                                color="success"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Box display="flex" gap={1}>
                                                <Tooltip title="Edit supplier">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEdit(supplier)}
                                                        color="primary"
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete supplier">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDelete(supplier.id)}
                                                        color="error"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredSuppliers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {filteredSuppliers.length === 0 && (
                    <Box textAlign="center" py={4}>
                        <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Suppliers Found
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            {searchTerm
                                ? 'No suppliers match your search criteria'
                                : 'Add your first supplier to manage parts sourcing.'
                            }
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={onCreate}
                            sx={{ mt: 2 }}
                        >
                            Add Supplier
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Supplier Details Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetails}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Supplier Details
                </DialogTitle>
                <DialogContent>
                    {selectedSupplier && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {selectedSupplier.name}
                            </Typography>

                            <Box mb={2}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Contact Information
                                </Typography>
                                {selectedSupplier.contactPerson && (
                                    <Typography variant="body2">
                                        Contact: {selectedSupplier.contactPerson}
                                    </Typography>
                                )}
                                {selectedSupplier.phone && (
                                    <Typography variant="body2" display="flex" alignItems="center">
                                        <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                        {selectedSupplier.phone}
                                    </Typography>
                                )}
                                {selectedSupplier.email && (
                                    <Typography variant="body2" display="flex" alignItems="center">
                                        <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                        {selectedSupplier.email}
                                    </Typography>
                                )}
                            </Box>

                            {selectedSupplier.address && (
                                <Box mb={2}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Address
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedSupplier.address}
                                    </Typography>
                                </Box>
                            )}

                            {selectedSupplier.website && (
                                <Box mb={2}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Website
                                    </Typography>
                                    <Typography variant="body2">
                                        <a
                                            href={selectedSupplier.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'inherit' }}
                                        >
                                            {selectedSupplier.website}
                                        </a>
                                    </Typography>
                                </Box>
                            )}

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Parts Supplied
                                </Typography>
                                <Chip
                                    label={`${getPartCount(selectedSupplier.id)} parts`}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SupplierList;