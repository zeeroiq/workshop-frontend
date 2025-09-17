import React, { useState, useEffect } from 'react';
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

// Mock data - in a real app, this would come from an API
const mockParts = [
    {
        id: 1,
        sku: 'BRK-001',
        name: 'Brake Pad Set',
        description: 'Premium ceramic brake pads for sedans',
        category: 'BRAKES',
        unitType: 'SET',
        unitPrice: 89.99,
        quantity: 42,
        minQuantity: 10,
        maxQuantity: 100,
        status: 'ACTIVE',
        weight: 5.2,
        dimensions: '8x4x2',
        manufacturer: 'Brembo',
        supplierPartNumber: 'BP-SED-2022',
        createdAt: '2023-05-15',
        updatedAt: '2023-10-20'
    },
    {
        id: 2,
        sku: 'OIL-002',
        name: 'Synthetic Engine Oil 5W-30',
        description: 'Full synthetic engine oil, 5qt bottle',
        category: 'FLUIDS',
        unitType: 'BOTTLE',
        unitPrice: 34.99,
        quantity: 18,
        minQuantity: 15,
        maxQuantity: 50,
        status: 'ACTIVE',
        weight: 4.5,
        dimensions: '10x4x4',
        manufacturer: 'Mobil',
        supplierPartNumber: 'MOB-5W30-5QT',
        createdAt: '2023-06-10',
        updatedAt: '2023-10-18'
    },
    {
        id: 3,
        sku: 'FLT-003',
        name: 'Oil Filter',
        description: 'Premium oil filter for most vehicles',
        category: 'FILTERS',
        unitType: 'PIECE',
        unitPrice: 12.99,
        quantity: 7,
        minQuantity: 10,
        maxQuantity: 40,
        status: 'LOW_STOCK',
        weight: 0.8,
        dimensions: '4x4x4',
        manufacturer: 'Fram',
        supplierPartNumber: 'PH-1234',
        createdAt: '2023-07-22',
        updatedAt: '2023-10-22'
    }
];

const PartList = ({ onViewDetails, onEdit, onCreate }) => {
    const [parts, setParts] = useState(mockParts);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [partToDelete, setPartToDelete] = useState(null);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDeleteClick = (part) => {
        setPartToDelete(part);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        setParts(parts.filter(part => part.id !== partToDelete.id));
        setDeleteDialogOpen(false);
        setPartToDelete(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'LOW_STOCK':
                return 'warning';
            case 'DISCONTINUED':
                return 'error';
            default:
                return 'default';
        }
    };

    const filteredParts = parts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Parts Inventory
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                >
                    Add Part
                </Button>
            </Box>

            <Box sx={{ display: 'flex', mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search parts by name, SKU, or description..."
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
                            <TableCell>SKU</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredParts.map((part) => (
                            <TableRow key={part.id}>
                                <TableCell>{part.sku}</TableCell>
                                <TableCell>{part.name}</TableCell>
                                <TableCell>{part.category}</TableCell>
                                <TableCell>{part.quantity} {part.unitType}</TableCell>
                                <TableCell>${part.unitPrice.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={part.status}
                                        color={getStatusColor(part.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => onViewDetails(part)}
                                        title="View Details"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(part)}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteClick(part)}
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
                    Are you sure you want to delete part "{partToDelete?.name}"?
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

export default PartList;