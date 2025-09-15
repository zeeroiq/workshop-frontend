import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { inventoryService } from '../../services/inventoryService';
import InventoryList from './InventoryList';
import InventoryForm from './InventoryForm';
import InventoryStats from './InventoryStats';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setInventory(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch inventory data. Please try again.');
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle create new item
  const handleCreateItem = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  // Handle edit item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await inventoryService.delete(id);
      setSuccess('Item deleted successfully');
      fetchInventory(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete item. Please try again.');
      console.error('Delete error:', err);
    }
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      if (editingItem) {
        await inventoryService.update(editingItem.id, formData);
        setSuccess('Item updated successfully');
      } else {
        await inventoryService.create(formData);
        setSuccess('Item added successfully');
      }

      setFormOpen(false);
      fetchInventory(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to ${editingItem ? 'update' : 'add'} item. Please try again.`);
      console.error('Submission error:', err);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              <InventoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
              Inventory Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateItem}
              sx={{ py: 1.5 }}
            >
              Add New Item
            </Button>
          </Box>

          {/* Low stock warning */}
          {inventory.filter(item => item.quantity <= item.minStockLevel).length > 0 && (
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              sx={{ mt: 2 }}
            >
              <strong>Low Stock Alert:</strong> Some items are below minimum stock levels.
            </Alert>
          )}

          {/* Success/Error messages */}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6} lg={4}>
          <InventoryStats inventory={inventory} />
        </Grid>

        {/* Inventory Value Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Inventory Value
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              ${inventory.reduce((total, item) => total + (item.quantity * item.cost), 0).toLocaleString()}
            </Typography>
            <Typography color="textSecondary">
              Total value of current inventory
            </Typography>
          </Paper>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            <Box>
              {inventory
                .filter(item => item.quantity <= item.minStockLevel)
                .slice(0, 3)
                .map(item => (
                  <Chip
                    key={item.id}
                    label={`${item.name} (${item.quantity})`}
                    color="warning"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              {inventory.filter(item => item.quantity <= item.minStockLevel).length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No items below minimum stock levels
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Inventory List */}
        <Grid item xs={12}>
          <InventoryList
            inventory={inventory}
            loading={loading}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        </Grid>
      </Grid>

      {/* Inventory Form Modal */}
      <InventoryForm
        open={formOpen}
        item={editingItem}
        onSubmit={handleSubmit}
        onClose={handleFormClose}
      />
    </Container>
  );
};

export default InventoryManagement;