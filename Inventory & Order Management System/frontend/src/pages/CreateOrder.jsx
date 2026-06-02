import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createOrder, getCustomers, getProducts } from '../services/api';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lineItems, setLineItems] = useState([{ product_id: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([cRes, pRes]) => {
        setCustomers(cRes.data);
        setProducts(pRes.data);
      })
      .catch(() => setError('Failed to load customers or products'));
  }, []);

  const addLine = () => setLineItems([...lineItems, { product_id: '', quantity: 1 }]);

  const removeLine = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const estimatedTotal = lineItems.reduce((sum, line) => {
    const product = products.find((p) => p.id === line.product_id);
    if (!product || !line.quantity) return sum;
    return sum + Number(product.price) * parseInt(line.quantity, 10);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer');
      return;
    }

    const items = lineItems
      .filter((l) => l.product_id && l.quantity > 0)
      .map((l) => ({
        product_id: l.product_id,
        quantity: parseInt(l.quantity, 10),
      }));

    if (items.length === 0) {
      setError('Add at least one product line');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createOrder({ customer_id: customerId, items });
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Button component={Link} to="/orders" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Orders
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Create Order
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Customer</InputLabel>
              <Select
                value={customerId}
                label="Customer"
                onChange={(e) => setCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Order Items
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addLine} type="button">
                Add Line
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell width={120}>Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell width={60} />
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((line, index) => {
                  const product = products.find((p) => p.id === line.product_id);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={line.product_id}
                            displayEmpty
                            onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                          >
                            <MenuItem value="" disabled>
                              Select product
                            </MenuItem>
                            {products.map((p) => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.name} (stock: {p.stock_quantity})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          inputProps={{ min: 1 }}
                          value={line.quantity}
                          onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        {product ? `$${Number(product.price).toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeLine(index)} type="button">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Typography variant="h6">
                Estimated Total: <strong>${estimatedTotal.toFixed(2)}</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Creating…' : 'Place Order'}
        </Button>
      </form>
    </Box>
  );
}
