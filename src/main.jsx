import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext.jsx";
import { CustomerProvider } from "./context/CustomerContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <CartProvider>
    <WishlistProvider>
      <RecentlyViewedProvider>
        <CustomerProvider>
          <App />
        </CustomerProvider>
      </RecentlyViewedProvider>
    </WishlistProvider>
  </CartProvider>
</React.StrictMode>
);