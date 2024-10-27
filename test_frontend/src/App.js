import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import OrderList from './components/OrderList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/edit/:productCode" element={<EditProduct />} />
        <Route path="/orders" element={<OrderList />} />
      </Routes>
    </Router>
  );
}

export default App;
