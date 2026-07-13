import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Customize from "./pages/Customize";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Lookbook from "./pages/Lookbook";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import CustomOrdersAdmin from "./pages/admin/CustomOrdersAdmin";
import CustomersAdmin from "./pages/admin/CustomersAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import TrackOrder from "./pages/TrackOrder";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MyOrders from "./pages/MyOrders";

import LoadingScreen from "./components/LoadingScreen";
import NewsletterPopup from "./components/NewsletterPopup";
import WhatsAppButton from "./components/WhatsAppButton";
import MobileBottomNav from "./components/MobileBottomNav";
import BackToTop from "./components/BackToTop";

function App() {
  return (
    <BrowserRouter>
      <LoadingScreen />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/lookbook" element={<Lookbook />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/track-order/:orderId" element={<TrackOrder />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-orders" element={<MyOrders />} />

        <Route path="/pf-x7-admin-2026" element={<AdminLogin />} />

        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="custom-orders" element={<CustomOrdersAdmin />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Routes>

      <NewsletterPopup />
      <BackToTop />
      <WhatsAppButton />
      <MobileBottomNav />
    </BrowserRouter>
  );
}

export default App;