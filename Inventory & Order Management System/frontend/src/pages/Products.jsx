import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/api';

const defaultValues = { name: '', sku: '', price: '', stock_quantity: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues);
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    reset({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    const payload = {
      name: data.name,
      sku: data.sku,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity, 10),
    };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setDialogOpen(false);
      loadProducts();
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch {
      setError('Failed to delete product');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Products
          </Typography>
          <Typography color="text.secondary">Manage inventory items</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell align="right">${Number(p.price).toFixed(2)}</TableCell>
                  <TableCell align="right">{p.stock_quantity}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="SKU"
              fullWidth
              margin="normal"
              {...register('sku', { required: 'SKU is required' })}
              error={!!errors.sku}
              helperText={errors.sku?.message}
            />
            <TextField
              label="Price"
              type="number"
              inputProps={{ step: '0.01', min: 0 }}
              fullWidth
              margin="normal"
              {...register('price', { required: 'Price is required', min: 0 })}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
            <TextField
              label="Stock Quantity"
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
              margin="normal"
              {...register('stock_quantity', { required: 'Stock is required', min: 0 })}
              error={!!errors.stock_quantity}
              helperText={errors.stock_quantity?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
