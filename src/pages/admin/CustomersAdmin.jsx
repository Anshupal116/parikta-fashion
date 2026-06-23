import { useEffect, useState } from "react";

const dummyCustomers = [
  {
    id: 1,
    name: "Ananya Sharma",
    phone: "9876543210",
    email: "ananya@example.com",
    totalOrders: 3,
    totalSpend: 18499,
    lastOrder: "23 Jun 2026",
  },
  {
    id: 2,
    name: "Megha Verma",
    phone: "9876500000",
    email: "megha@example.com",
    totalOrders: 2,
    totalSpend: 15498,
    lastOrder: "22 Jun 2026",
  },
  {
    id: 3,
    name: "Ritika Jain",
    phone: "9876512345",
    email: "ritika@example.com",
    totalOrders: 1,
    totalSpend: 3499,
    lastOrder: "21 Jun 2026",
  },
];

function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("parikta_customers")) || [];

    if (saved.length > 0) {
      setCustomers(saved);
    } else {
      setCustomers(dummyCustomers);
      localStorage.setItem("parikta_customers", JSON.stringify(dummyCustomers));
    }
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const q = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(q) ||
      customer.phone.includes(q) ||
      customer.email.toLowerCase().includes(q)
    );
  });

  const totalSpend = customers.reduce(
    (sum, customer) => sum + customer.totalSpend,
    0
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="heading-font text-4xl text-[#5B3B32]">
            Customers
          </h1>

          <p className="text-[#8b746b] mt-2">
            View customer details, order count and total spend.
          </p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer..."
          className="border border-[#eadbd4] rounded-xl px-5 py-3 outline-none w-80"
        />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5">
          <h2 className="heading-font text-4xl text-[#9A3F4D]">
            {customers.length}
          </h2>
          <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
            Total Customers
          </p>
        </div>

        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5">
          <h2 className="heading-font text-4xl text-[#9A3F4D]">
            {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
          </h2>
          <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
            Total Orders
          </p>
        </div>

        <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5">
          <h2 className="heading-font text-4xl text-[#9A3F4D]">
            ₹{totalSpend}
          </h2>
          <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
            Customer Spend
          </p>
        </div>
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FDEAE6] text-[#5B3B32]">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Email</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total Spend</th>
              <th className="p-4">Last Order</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="border-t border-[#eadbd4] text-[#5B3B32]"
              >
                <td className="p-4 font-semibold">{customer.name}</td>
                <td className="p-4">{customer.phone}</td>
                <td className="p-4">{customer.email}</td>
                <td className="p-4">{customer.totalOrders}</td>

                <td className="p-4 font-bold text-[#9A3F4D]">
                  ₹{customer.totalSpend}
                </td>

                <td className="p-4">{customer.lastOrder}</td>

                <td className="p-4">
                  <a href={`tel:${customer.phone}`}>
                    <button className="bg-[#5B3B32] text-white px-4 py-2 rounded-lg text-sm">
                      Call
                    </button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomersAdmin;