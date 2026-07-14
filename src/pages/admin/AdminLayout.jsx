import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

function AdminLayout() {
  const [isMobile, setIsMobile] = useState(false);

  const { logoutAdmin, admin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/pf-x7-admin-2026");
  };

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f2ee] p-6">
        <div className="max-w-md bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8 text-center shadow-sm">
          <h1 className="heading-font text-4xl text-[#9A3F4D]">
            Desktop Required
          </h1>

          <p className="text-[#6d554d] mt-4 leading-7">
            Admin Panel can only be accessed from a desktop or laptop.
          </p>

          <Link to="/">
            <button className="mt-6 bg-[#9A3F4D] text-white px-6 py-3 rounded-xl font-semibold">
              Back to Website
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2ee] flex">
      <aside className="w-72 bg-[#2f241f] text-white min-h-screen p-7">
        <Link to="/admin-dashboard">
          <h1 className="logo-font text-6xl text-[#E8D7CC] leading-none">
            Parikta
          </h1>
          <p className="tracking-[0.35em] text-[10px] text-[#BFA996] mt-1">
            ADMIN
          </p>
        </Link>

        <nav className="space-y-3 text-sm mt-12">
          <Link
            className="block px-4 py-3 rounded-xl hover:bg-white/10"
            to="/admin-dashboard"
          >
            Dashboard
          </Link>

          <Link
            className="block px-4 py-3 rounded-xl hover:bg-white/10"
            to="/admin-dashboard/customers"
          >
            Customers
          </Link>

          <Link
            className="block px-4 py-3 rounded-xl hover:bg-white/10"
            to="/admin-dashboard/products"
          >
            Products
          </Link>

          <Link
            className="block px-4 py-3 rounded-xl hover:bg-white/10"
            to="/admin-dashboard/add-product"
          >
            Add Product
          </Link>

          <Link
            className="block px-4 py-3 rounded-xl hover:bg-white/10"
            to="/admin-dashboard/orders"
          >
            Orders
          </Link>
          <Link
  className="block px-4 py-3 rounded-xl hover:bg-white/10"
  to="/admin-dashboard/reviews"
>
  Reviews
</Link>
          <Link
            className="block px-4 py-3 rounded-xl hover:bg-white/10"
            to="/admin-dashboard/custom-orders"
          >
            Custom Orders
          </Link>

          <Link
            className="block px-4 py-3 rounded-xl hover:bg-white/10"
            to="/admin-dashboard/settings"
          >
            Settings
          </Link>

          <Link
            className="block px-4 py-3 rounded-xl text-[#BFA996] hover:bg-white/10 mt-8"
            to="/"
          >
            Back to Website
          </Link>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-[#fffaf7] border-b border-[#eadbd4] px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="heading-font text-3xl text-[#5B3B32]">
              Parikta Admin
            </h2>
            <p className="text-sm text-[#8b746b]">
              Manage products, orders and custom requests
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-[#5B3B32]">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-[#8b746b]">
                {admin?.email || "Parikta Fashion"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;