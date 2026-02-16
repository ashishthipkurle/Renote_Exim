
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

import Products from './pages/Products';
import ProductsChemicals from './pages/products/Chemicals';
import ProductsMachines from './pages/products/Machines';
import ProductsTextiles from './pages/products/Textiles';
import ProductsMedical from './pages/products/Medical';
import ProductsHandicrafts from './pages/products/Handicrafts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="products/chemicals" element={<ProductsChemicals />} />
          <Route path="products/machines" element={<ProductsMachines />} />
          <Route path="products/textiles" element={<ProductsTextiles />} />
          <Route path="products/medical" element={<ProductsMedical />} />
          <Route path="products/handicraft" element={<ProductsHandicrafts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
