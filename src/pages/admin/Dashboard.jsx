import { useEffect, useState } from "react";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem("parikta_orders")) || []);
    setCustomOrders(
      JSON.parse(localStorage.getItem("parikta_custom_orders")) || []
    );
    setCustomers(JSON.parse(localStorage.getItem("parikta_customers")) || []);
    setAdminProducts(
      JSON.parse(localStorage.getItem("parikta_admin_products")) || []
    );
  }, []);

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === "Cancelled") return sum;
    return sum + Number(order.amount || 0);
  }, 0);

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const customNew = customOrders.filter((o) => o.status === "New").length;

  const stats = [
    ["₹" + totalRevenue, "Total Revenue"],
    [orders.length, "Total Orders"],
    [customers.length, "Customers"],
    [adminProducts.length, "Admin Products"],
    [pendingOrders, "Pending Orders"],
    [deliveredOrders, "Delivered Orders"],
    [customOrders.length, "Custom Requests"],
    [customNew, "New Custom Requests"],
  ];

  const recentOrders = orders.slice(0, 5);

  const maxRevenue = Math.max(totalRevenue, 1);

  const chartData = [
    ["Orders", orders.length * 1000],
    ["Custom", customOrders.length * 1200],
    ["Customers", customers.length * 900],
    ["Products", adminProducts.length * 700],
    ["Revenue", totalRevenue],
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Analytics Dashboard
        </h1>

        <p className="text-[#8b746b] mt-2">
          Business overview for Parikta Fashion.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map(([number, label]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5"
          >
            <h2 className="heading-font text-4xl text-[#9A3F4D]">
              {number}
            </h2>

            <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[60%_40%] gap-6 mt-8">
        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6">
          <h2 className="heading-font text-3xl text-[#5B3B32] mb-6">
            Business Overview
          </h2>

          <div className="space-y-5">
            {chartData.map(([label, value]) => {
              const width = Math.min((value / maxRevenue) * 100, 100);

              return (
                <div key={label}>
                  <div className="flex justify-between text-sm text-[#5B3B32] mb-2">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>

                  <div className="h-4 bg-[#FDEAE6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9A3F4D] rounded-full"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6">
          <h2 className="heading-font text-3xl text-[#5B3B32] mb-6">
            Order Status
          </h2>

          <div className="space-y-4">
            {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(
              (status) => {
                const count = orders.filter((o) => o.status === status).length;

                return (
                  <div
                    key={status}
                    className="flex items-center justify-between border-b border-[#eadbd4] pb-3"
                  >
                    <span className="text-[#5B3B32]">{status}</span>

                    <span className="bg-[#FDEAE6] text-[#9A3F4D] px-3 py-1 rounded-full font-bold">
                      {count}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6 mt-8">
        <h2 className="heading-font text-3xl text-[#5B3B32] mb-6">
          Recent Orders
        </h2>

        {recentOrders.length === 0 ? (
          <p className="text-[#8b746b]">No orders found.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-[#eadbd4] text-[#5B3B32]"
                >
                  <td className="p-4 font-bold text-[#9A3F4D]">
                    {order.id}
                  </td>
                  <td className="p-4">{order.customer}</td>
                  <td className="p-4 font-bold">₹{order.amount}</td>
                  <td className="p-4">{order.status}</td>
                  <td className="p-4">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;