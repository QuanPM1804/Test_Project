import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/edit/:productCode" element={<EditProduct />} />
      </Routes>
    </Router>
  );
}

export default App;
