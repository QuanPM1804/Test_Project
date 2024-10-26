import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Paper,
    Grid,
    Typography,
    Container,
    Box,
    IconButton,
    Divider,
    InputAdornment,
    Alert,
    Snackbar,
    Stack
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Clear as ClearIcon,
    AttachMoney as MoneyIcon,
    Percent as PercentIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../api';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    maxWidth: 800,
    margin: '0 auto',
}));

const FormButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(1.5, 4),
    margin: theme.spacing(1),
    borderRadius: theme.spacing(1),
    '&.MuiButton-containedPrimary': {
        background: theme.palette.primary.main,
        '&:hover': {
            background: theme.palette.primary.dark,
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
        },
    },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(3, 0),
}));

const AddProduct = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        productCode: '',
        name: '',
        unit: '',
        importPrice: '',
        sellingPrice: '',
        taxRate: ''
    });
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const validateForm = () => {
        const newErrors = {};
        if (!product.name.trim()) newErrors.name = 'Product name is required';
        if (!product.unit.trim()) newErrors.unit = 'Unit is required';
        if (!product.importPrice) newErrors.importPrice = 'Import price is required';
        if (!product.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
        if (parseFloat(product.sellingPrice) <= parseFloat(product.importPrice)) {
            newErrors.sellingPrice = 'Selling price must be greater than import price';
        }
        if (!product.taxRate) newErrors.taxRate = 'Tax rate is required';
        if (product.taxRate < 0 || product.taxRate > 100) newErrors.taxRate = 'Tax rate must be between 0 and 100';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });
        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await api.post('/products', product);
            setSnackbar({
                open: true,
                message: 'Product added successfully!',
                severity: 'success'
            });
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to add product. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleReset = () => {
        setProduct({
            productCode: '',
            name: '',
            unit: '',
            importPrice: '',
            sellingPrice: '',
            taxRate: ''
        });
        setErrors({});
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{ mr: 2 }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" display="inline">
                    Add New Product
                </Typography>
            </Box>

            <StyledPaper elevation={3}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <InventoryIcon /> Product Details
                            </Typography>
                            <StyledDivider />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="name"
                                label="Product Name"
                                fullWidth
                                value={product.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="unit"
                                label="Unit"
                                fullWidth
                                value={product.unit}
                                onChange={handleChange}
                                error={!!errors.unit}
                                helperText={errors.unit}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="importPrice"
                                label="Import Price"
                                fullWidth
                                type="number"
                                value={product.importPrice}
                                onChange={handleChange}
                                error={!!errors.importPrice}
                                helperText={errors.importPrice}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MoneyIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="sellingPrice"
                                label="Selling Price"
                                fullWidth
                                type="number"
                                value={product.sellingPrice}
                                onChange={handleChange}
                                error={!!errors.sellingPrice}
                                helperText={errors.sellingPrice}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MoneyIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="taxRate"
                                label="Tax Rate"
                                fullWidth
                                type="number"
                                value={product.taxRate}
                                onChange={handleChange}
                                error={!!errors.taxRate}
                                helperText={errors.taxRate}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PercentIcon />
                                        </InputAdornment>
                                    ),
                                    inputProps: { min: 0, max: 100 }
                                }}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <StyledDivider />
                            <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                <FormButton
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleReset}
                                    startIcon={<ClearIcon />}
                                >
                                    Reset
                                </FormButton>
                                <FormButton
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                >
                                    Save Product
                                </FormButton>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </StyledPaper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    elevation={6}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AddProduct;