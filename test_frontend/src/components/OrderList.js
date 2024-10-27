import React, { useEffect, useState } from "react";
import {
  Button,
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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import api from "../api";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  "& .MuiTable-root": {
    minWidth: 750,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  "& .MuiTableCell-head": {
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
    cursor: "pointer",
  },
}));

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setError("Failed to load orders. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrderDetails = async (orderCode) => {
    try {
      const response = await api.get(`/orders/${orderCode}`);
      setSelectedOrder(response.data);
      setEditedOrder(null);
      setIsEditMode(false);
      setIsOrderDetailsOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch order details",
        severity: "error",
      });
    }
  };

  const handleEditOrder = () => {
    setEditedOrder({ ...selectedOrder });
    setIsEditMode(true);
  };

  const handleUpdateOrder = async () => {
    try {
      await api.put(`/orders/${editedOrder.orderCode}`, editedOrder);
      setSnackbar({
        open: true,
        message: "Order updated successfully",
        severity: "success",
      });
      fetchOrders();
      setIsEditMode(false);
      setIsOrderDetailsOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data || "Failed to update order",
        severity: "error",
      });
    }
  };

  const handleCustomerInfoChange = (event) => {
    const { name, value } = event.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderItemChange = (index, field, value) => {
    setEditedOrder((prev) => {
      const newOrderItems = [...prev.orderItems];
      newOrderItems[index] = {
        ...newOrderItems[index],
        [field]: field === "quantity" ? parseInt(value) || 0 : parseFloat(value) || 0,
      };
      return {
        ...prev,
        orderItems: newOrderItems,
      };
    });
  };

  const removeOrderItem = (index) => {
    setEditedOrder((prev) => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index),
    }));
  };

  const addOrderItem = () => {
    setEditedOrder((prev) => ({
      ...prev,
      orderItems: [
        ...prev.orderItems,
        { productCode: "", quantity: 1, sellingPrice: 0 },
      ],
    }));
  };

  const calculateOrderTotal = (orderItems) => {
    return orderItems.reduce(
      (total, item) => total + item.quantity * item.sellingPrice,
      0
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: "100%", mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Management
        </Typography>

        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Box sx={{ flex: "1 1 100%" }}>
            <Typography variant="h6" id="tableTitle">
              Orders List
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Back to Products">
              <Button
                component={Link}
                to="/"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
              >
                Back to Products
              </Button>
            </Tooltip>
            <Tooltip title="Refresh list">
              <IconButton onClick={fetchOrders}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Order Code</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <StyledTableRow key={order.orderCode}>
                    <TableCell>{order.orderCode}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.customerPhone}</TableCell>
                    <TableCell align="right">
                      ${calculateOrderTotal(order.orderItems).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Order Details">
                        <IconButton
                          onClick={() => handleViewOrderDetails(order.orderCode)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Order">
                        <IconButton
                          onClick={() => {
                            handleViewOrderDetails(order.orderCode);
                            setIsEditMode(true);
                          }}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="subtitle1" sx={{ py: 5 }}>
                      {loading ? "Loading orders..." : "No orders available"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        {/* Order Details/Edit Dialog */}
        <Dialog
          open={isOrderDetailsOpen}
          onClose={() => {
            setIsOrderDetailsOpen(false);
            setIsEditMode(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isEditMode ? "Edit Order" : "Order Details"}
          </DialogTitle>
          <DialogContent>
            {(selectedOrder || editedOrder) && (
              <>
                <Typography variant="h6" gutterBottom>
                  Order {(editedOrder || selectedOrder).orderCode}
                </Typography>
                {isEditMode ? (
                  <>
                    <TextField
                      name="customerName"
                      label="Customer Name"
                      value={editedOrder.customerName}
                      onChange={handleCustomerInfoChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      name="customerPhone"
                      label="Phone Number"
                      value={editedOrder.customerPhone}
                      onChange={handleCustomerInfoChange}
                      fullWidth
                      margin="normal"
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="body1" gutterBottom>
                      Customer: {selectedOrder.customerName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Phone: {selectedOrder.customerPhone}
                    </Typography>
                  </>
                )}
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Code</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                      {isEditMode && <TableCell align="center">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(isEditMode ? editedOrder : selectedOrder).orderItems.map(
                      (item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {isEditMode ? (
                              <TextField
                                value={item.productCode}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    "productCode",
                                    e.target.value
                                  )
                                }
                                size="small"
                              />
                            ) : (
                              item.productCode
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {isEditMode ? (
                              <TextField
                                type="number"
                                value={item.sellingPrice}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    "sellingPrice",
                                    e.target.value
                                  )
                                }
                                size="small"
                              />
                            ) : (
                              `$${item.sellingPrice.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {isEditMode ? (
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleOrderItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                size="small"
                              />
                            ) : (
                              item.quantity
                            )}
                          </TableCell>
                          <TableCell align="right">
                            ${(item.sellingPrice * item.quantity).toLocaleString()}
                          </TableCell>
                          {isEditMode && (
                            <TableCell align="center">
                              <IconButton
                                onClick={() => removeOrderItem(index)}
                                color="error"
                                size="small"
                              >
                                <RemoveIcon />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    )}
                    {isEditMode && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Button
                            startIcon={<AddIcon />}
                            onClick={addOrderItem}
                            color="primary"
                          >
                            Add Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Total Amount:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          $
                          {calculateOrderTotal(
                            (isEditMode ? editedOrder : selectedOrder).orderItems
                          ).toLocaleString()}
                        </strong>
                      </TableCell>
                      {isEditMode && <TableCell />}
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}
          </DialogContent>
          <DialogActions>
            {!isEditMode && (
              <Button onClick={handleEditOrder} color="primary">
                Edit
              </Button>
            )}
            {isEditMode ? (
              <>
                <Button
                  onClick={() => {
                    setIsEditMode(false);
                    setEditedOrder(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateOrder} color="primary">
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsOrderDetailsOpen(false)}>Close</Button>
            )}
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default OrderList;