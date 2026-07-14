import { useEffect, useMemo, useState } from "react";
import { getCustomers } from "../../services/customerService";

function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await getCustomers();

      if (response.success) {
        setCustomers(response.customers || []);
      } else {
        alert(response.message || "Customers load failed");
      }
    } catch (error) {
      console.error("Customers load error:", error);

      alert(
        error.response?.data?.message ||
          "Customers load failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.phone?.includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const totalOrders = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.totalOrders || 0),
    0
  );

  const totalSpend = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.totalSpend || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

          <h2 className="text-2xl font-bold text-[#5B3B32] mt-5">
            Loading Customers...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="heading-font text-4xl text-[#5B3B32]">
            Customers
          </h1>

          <p className="text-[#8b746b] mt-2">
            View registered customers, orders and total spend.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name, phone or email..."
            className="border border-[#eadbd4] bg-white rounded-xl px-5 py-3 outline-none w-full lg:w-80 focus:border-[#9A3F4D]"
          />

          <button
            onClick={loadCustomers}
            className="bg-[#5B3B32] text-white px-5 py-3 rounded-xl font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 shadow-sm">
          <h2 className="heading-font text-4xl text-[#9A3F4D]">
            {customers.length}
          </h2>

          <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
            Total Customers
          </p>
        </div>

        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 shadow-sm">
          <h2 className="heading-font text-4xl text-[#9A3F4D]">
            {totalOrders}
          </h2>

          <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
            Total Orders
          </p>
        </div>

        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 shadow-sm">
          <h2 className="heading-font text-4xl text-[#9A3F4D]">
            ₹{totalSpend.toLocaleString("en-IN")}
          </h2>

          <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
            Customer Spend
          </p>
        </div>
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Email</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Total Spend</th>
                <th className="p-4">Last Order</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-t border-[#eadbd4] text-[#5B3B32] hover:bg-[#fff7f3]"
                >
                  <td className="p-4">
                    <div className="font-semibold">
                      {customer.name || "Customer"}
                    </div>

                    <div className="text-xs text-[#8b746b] mt-1">
                      ID: {customer._id?.slice(-8)}
                    </div>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {customer.phone || "-"}
                  </td>

                  <td className="p-4">
                    {customer.email || "-"}
                  </td>

                  <td className="p-4 font-semibold">
                    {customer.totalOrders || 0}
                  </td>

                  <td className="p-4 font-bold text-[#9A3F4D] whitespace-nowrap">
                    ₹
                    {Number(
                      customer.totalSpend || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {customer.lastOrder
                      ? new Date(
                          customer.lastOrder
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No orders"}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {customer.createdAt
                      ? new Date(
                          customer.createdAt
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>

                  <td className="p-4">
                    {customer.phone ? (
                      <a href={`tel:${customer.phone}`}>
                        <button className="bg-[#5B3B32] hover:bg-[#9A3F4D] text-white px-4 py-2 rounded-xl text-sm font-semibold">
                          Call
                        </button>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No phone
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-[#5B3B32]">
              No Customers Found
            </h3>

            <p className="text-[#8b746b] mt-2">
              Registered customers will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomersAdmin;