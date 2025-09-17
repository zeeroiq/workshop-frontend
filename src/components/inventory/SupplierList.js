import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Chip,
    TextField,
    Box,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Add as AddIcon,
    Search as SearchIcon
} from '@mui/icons-material';

// Mock data
const mockSuppliers = [
    {
        id: 1,
        name: 'Auto Parts Central',
        contactPerson: 'John Smith',
        email: 'john@autopartscentral.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, USA',
        paymentTerms: 'NET_30',
        status: 'ACTIVE',
        notes: 'Primary supplier for brake parts',
        createdAt: '2023-01-15',
        updatedAt: '2023-10-10'
    },
    {
        id: 2,
        name: 'Engine Components Inc',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@enginecomponents.com',
        phone: '(555) 987-6543',
        address: '456 Oak Ave, Somewhere, USA',
        paymentTerms: 'NET_15',
        status: 'ACTIVE',
        notes: 'Specializes in engine parts and fluids',
        createdAt: '2023-02-20',
        updatedAt: '2023-09-15'
    }
];

const SupplierList = ({ onViewDetails, onEdit, onCreate }) => {
    const [suppliers, setSuppliers] = useState(mockSuppliers);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDeleteClick = (supplier) => {
        setSupplierToDelete(supplier);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDelete.id));
        setDeleteDialogOpen(false);
        setSupplierToDelete(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'INACTIVE':
                return 'error';
            default:
                return 'default';
        }
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Suppliers
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                >
                    Add Supplier
                </Button>
            </Box>

            <Box sx={{ display: 'flex', mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search suppliers by name, contact, or email..."
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                        endAdornment: <SearchIcon />
                    }}
                />
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact Person</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSuppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell>{supplier.name}</TableCell>
                                <TableCell>{supplier.contactPerson}</TableCell>
                                <TableCell>{supplier.email}</TableCell>
                                <TableCell>{supplier.phone}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={supplier.status}
                                        color={getStatusColor(supplier.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => onViewDetails(supplier)}
                                        title="View Details"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(supplier)}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteClick(supplier)}
                                        title="Delete"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete supplier "{supplierToDelete?.name}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SupplierList;