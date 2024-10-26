import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Paper, Grid } from '@mui/material';
import api from '../api';

const EditProduct = () => {
    const { productCode } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: '',
        unit: '',
        importPrice: '',
        sellingPrice: '',
        taxRate: ''
    });

    useEffect(() => {
        const fetchProduct = async () => {
            const response = await api.get(`/products/${productCode}`);
            setProduct(response.data);
        };
        fetchProduct();
    }, [productCode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.put(`/products/${productCode}`, product);
        navigate('/');
    };

    return (
        <Paper style={{ padding: 16 }}>
            <h2>Edit Product</h2>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField name="name" label="Product Name" fullWidth value={product.name} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField name="unit" label="Unit" fullWidth value={product.unit} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField name="importPrice" label="Import Price" fullWidth type="number" value={product.importPrice} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField name="sellingPrice" label="Selling Price" fullWidth type="number" value={product.sellingPrice} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField name="taxRate" label="Tax Rate" fullWidth type="number" value={product.taxRate} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">Save</Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default EditProduct;
