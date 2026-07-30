import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import ReactGA from "react-ga4";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Customize from "./pages/Customize";
import OrderSuccess from "./pages/OrderSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Lookbook from "./pages/Lookbook";
import TrackOrder from "./pages/TrackOrder";
import MyOrders from "./pages/MyOrders";
import CheckoutAddress from "./pages/CheckoutAddress";
import CheckoutPayment from "./pages/CheckoutPayment";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

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
import ReviewsAdmin from "./pages/admin/ReviewsAdmin";
import CouponsAdmin from "./pages/admin/CouponsAdmin";
import bannermanagers from "./pages/admin/BannerManagers";

import LoadingScreen from "./components/LoadingScreen";
import NewsletterPopup from "./components/NewsletterPopup";
import MobileBottomNav from "./components/MobileBottomNav";
import BackToTop from "./components/BackToTop";
import ScrollToTop from "./components/ScrollToTop";
import CartDrawer from "./components/CartDrawer";

/*
|--------------------------------------------------------------------------
| Google Analytics
|--------------------------------------------------------------------------
*/

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.initialize("G-D943CV7RKX");
  }, []);

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  return null;
}

/*
|--------------------------------------------------------------------------
| Global Customer UI
|--------------------------------------------------------------------------
*/

function GlobalCustomerUI() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname === "/pf-x7-admin-2026";

  const hideCustomerUIRoutes = [
    "/login",
    "/register",
    "/checkout",
    "/order-success",
  ];

  const shouldHideCustomerUI =
    isAdminPage ||
    hideCustomerUIRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(`${route}/`)
    );

  if (shouldHideCustomerUI) {
    return null;
  }

  return (
    <>
      <CartDrawer />
      <NewsletterPopup />
      <BackToTop />
      <MobileBottomNav />
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

function AppRoutes() {
  return (
    <Routes>
      {/* Customer routes */}

      <Route path="/" element={<Home />} />

      <Route path="/products" element={<Products />} />

      <Route
        path="/product/:id"
        element={<ProductDetails />}
      />

      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/customize" element={<Customize />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/lookbook" element={<Lookbook />} />
      {/* Customer authentication */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Customer orders */}

      <Route path="/my-orders" element={<MyOrders />} />

      <Route
        path="/track-order"
        element={<TrackOrder />}
      />

      <Route
        path="/track-order/:orderId"
        element={<TrackOrder />}
      />

      <Route
        path="/order-success/:orderId"
        element={<OrderSuccess />}
      />

      {/* Checkout */}

      <Route
        path="/checkout"
        element={
          <Navigate
            to="/checkout/address"
            replace
          />
        }
      />

      <Route
        path="/checkout/address"
        element={<CheckoutAddress />}
      />

      <Route
        path="/checkout/payment"
        element={<CheckoutPayment />}
      />

      {/* Admin login */}

      <Route
        path="/pf-x7-admin-2026"
        element={<AdminLogin />}
      />

      {/* Protected admin routes */}

      <Route
        path="/admin-dashboard"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="products"
          element={<ProductsAdmin />}
        />

        <Route
          path="add-product"
          element={<AddProduct />}
        />

        <Route
          path="edit-product/:id"
          element={<EditProduct />}
        />

        <Route
          path="orders"
          element={<OrdersAdmin />}
        />

        <Route
          path="reviews"
          element={<ReviewsAdmin />}
        />

        <Route
          path="custom-orders"
          element={<CustomOrdersAdmin />}
        />

        <Route
          path="customers"
          element={<CustomersAdmin />}
        />

        <Route
          path="settings"
          element={<SettingsAdmin />}
        />

        <Route
          path="coupons"
          element={<CouponsAdmin />}
        />
      </Route>

       <Route
          path="bannermanagers"
          element={<BannerManagers />}
        />

      {/* Invalid URL */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

/*
|--------------------------------------------------------------------------
| Main App
|--------------------------------------------------------------------------
*/

function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />

      <ScrollToTop />

      {/*
        LoadingScreen ko direct render rakho.
        Iske bahar fixed full-screen wrapper mat lagana,
        warna invisible layer buttons ko block karegi.
      */}
      <LoadingScreen />

      <AppRoutes />

      <GlobalCustomerUI />
    </BrowserRouter>
  );
}

export default App;