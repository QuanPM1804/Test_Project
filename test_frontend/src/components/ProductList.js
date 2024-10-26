import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Container,
    IconButton,
    Toolbar,
    Tooltip,
    Alert,
    Snackbar,
    Box
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../api';

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(3),
    borderRadius: theme.spacing(1),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    '& .MuiTable-root': {
        minWidth: 750,
    },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    '& .MuiTableCell-head': {
        color: theme.palette.common.white,
        fontWeight: 'bold',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
        backgroundColor: theme.palette.action.selected,
        cursor: 'pointer',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
    boxShadow: 'none',
    '&:hover': {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
}));

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.items || []);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch products", error);
            setError("Failed to load products. Please try again.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSelectProduct = (productCode) => {
        setSelectedProducts((prevSelected) => {
            if (prevSelected.includes(productCode)) {
                return prevSelected.filter((code) => code !== productCode);
            }
            return [...prevSelected, productCode];
        });
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allProductCodes = products.map((product) => product.productCode);
            setSelectedProducts(allProductCodes);
        } else {
            setSelectedProducts([]);
        }
    };

    const deleteSelectedProducts = async () => {
        if (window.confirm("Are you sure you want to delete the selected products?")) {
            try {
                await api.delete('/products/bulk', {
                    data: selectedProducts
                });
                setProducts(products.filter(product => !selectedProducts.includes(product.productCode)));
                setSelectedProducts([]);
                setSnackbar({
                    open: true,
                    message: 'Products deleted successfully',
                    severity: 'success'
                });
            } catch (error) {
                console.error("Failed to delete selected products", error);
                setSnackbar({
                    open: true,
                    message: 'Failed to delete products',
                    severity: 'error'
                });
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ width: '100%', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Product Management
                </Typography>

                <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
                    <Box sx={{ flex: '1 1 100%' }}>
                        {selectedProducts.length > 0 ? (
                            <Typography color="inherit" variant="subtitle1">
                                {selectedProducts.length} selected
                            </Typography>
                        ) : (
                            <Typography variant="h6" id="tableTitle">
                                Products List
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Refresh list">
                            <IconButton onClick={fetchProducts}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add new product">
                            <Button
                                component={Link}
                                to="/add"
                                variant="contained"
                                startIcon={<AddIcon />}
                            >
                                Add Product
                            </Button>
                        </Tooltip>
                    </Box>
                </Toolbar>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <StyledTableContainer component={Paper}>
                    <Table>
                        <StyledTableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="default"
                                        checked={selectedProducts.length === products.length && products.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>Product Code</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell align="right">Import Price</TableCell>
                                <TableCell align="right">Selling Price</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            {products.length > 0 ? (
                                products.map(product => (
                                    <StyledTableRow key={product.productCode}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedProducts.includes(product.productCode)}
                                                onChange={() => handleSelectProduct(product.productCode)}
                                            />
                                        </TableCell>
                                        <TableCell>{product.productCode}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.unit}</TableCell>
                                        <TableCell align="right">
                                            ${product.importPrice.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            ${product.sellingPrice.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit product">
                                                <IconButton
                                                    component={Link}
                                                    to={`/edit/${product.productCode}`}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete product">
                                                <IconButton
                                                    onClick={() => deleteSelectedProducts([product.productCode])}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="subtitle1" sx={{ py: 5 }}>
                                            {loading ? 'Loading products...' : 'No products available'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>

                {selectedProducts.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <ActionButton
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={deleteSelectedProducts}
                        >
                            Delete Selected ({selectedProducts.length})
                        </ActionButton>
                    </Box>
                )}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProductList;