import { useCallback, useEffect, useMemo, useState } from "react";
import { getCustomers } from "../../services/customerService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normaliseCustomers = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.customers)) return response.customers;
  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.customers)) {
    return response.data.customers;
  }
  if (Array.isArray(response?.data?.users)) {
    return response.data.users;
  }

  return [];
};

function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getCustomers();
      const customerList = normaliseCustomers(response);

      if (
        response?.success === false &&
        customerList.length === 0
      ) {
        throw new Error(
          response?.message || "Customers load failed"
        );
      }

      setCustomers(customerList);
    } catch (err) {
      console.error("Customers load error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Customers load failed";

      setError(message);
      setCustomers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      const name = String(customer?.name || "").toLowerCase();
      const phone = String(
        customer?.phone || customer?.mobile || ""
      ).toLowerCase();
      const email = String(customer?.email || "").toLowerCase();

      return (
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query)
      );
    });
  }, [customers, search]);

  const totals = useMemo(() => {
    return customers.reduce(
      (result, customer) => {
        result.orders += Number(
          customer?.totalOrders ||
            customer?.ordersCount ||
            customer?.orderCount ||
            0
        );

        result.spend += Number(
          customer?.totalSpend ||
            customer?.totalSpent ||
            customer?.lifetimeValue ||
            0
        );

        return result;
      },
      { orders: 0, spend: 0 }
    );
  }, [customers]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

          <h2 className="mt-5 text-2xl font-bold text-[#5B3B32]">
            Loading Customers...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BFA996]">
            Customer Management
          </p>

          <h1 className="heading-font mt-2 text-4xl text-[#5B3B32]">
            Customers
          </h1>

          <p className="mt-2 text-[#8b746b]">
            Registered customers, orders and total spend dekho.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone or email..."
            className="w-full rounded-xl border border-[#eadbd4] bg-white px-5 py-3 outline-none focus:border-[#9A3F4D] sm:w-80"
          />

          <button
            type="button"
            onClick={() => loadCustomers(true)}
            disabled={refreshing}
            className="rounded-xl bg-[#5B3B32] px-5 py-3 font-semibold text-white transition hover:bg-[#9A3F4D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="font-semibold text-red-700">
            Customers load nahi hue
          </p>

          <p className="mt-1 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => loadCustomers(true)}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          value={customers.length}
          label="Total Customers"
        />

        <StatCard value={totals.orders} label="Total Orders" />

        <StatCard
          value={formatCurrency(totals.spend)}
          label="Customer Spend"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] shadow-sm">
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
              {filteredCustomers.map((customer, index) => {
                const phone =
                  customer?.phone || customer?.mobile || "";

                const totalOrders =
                  customer?.totalOrders ||
                  customer?.ordersCount ||
                  customer?.orderCount ||
                  0;

                const totalSpend =
                  customer?.totalSpend ||
                  customer?.totalSpent ||
                  customer?.lifetimeValue ||
                  0;

                const lastOrder =
                  customer?.lastOrder ||
                  customer?.lastOrderAt ||
                  customer?.lastOrderDate;

                return (
                  <tr
                    key={customer?._id || customer?.id || index}
                    className="border-t border-[#eadbd4] text-[#5B3B32] transition hover:bg-[#fff7f3]"
                  >
                    <td className="p-4">
                      <div className="font-semibold">
                        {customer?.name || "Customer"}
                      </div>

                      <div className="mt-1 text-xs text-[#8b746b]">
                        ID:{" "}
                        {String(
                          customer?._id || customer?.id || "-"
                        ).slice(-8)}
                      </div>
                    </td>

                    <td className="whitespace-nowrap p-4">
                      {phone || "-"}
                    </td>

                    <td className="p-4">
                      {customer?.email || "-"}
                    </td>

                    <td className="p-4 font-semibold">
                      {Number(totalOrders)}
                    </td>

                    <td className="whitespace-nowrap p-4 font-bold text-[#9A3F4D]">
                      {formatCurrency(totalSpend)}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      {lastOrder
                        ? formatDate(lastOrder)
                        : "No orders"}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      {formatDate(
                        customer?.createdAt ||
                          customer?.joinedAt
                      )}
                    </td>

                    <td className="p-4">
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex rounded-xl bg-[#5B3B32] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9A3F4D]"
                        >
                          Call
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No phone
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!error && filteredCustomers.length === 0 && (
          <div className="py-16 text-center">
            <h3 className="text-2xl font-semibold text-[#5B3B32]">
              No Customers Found
            </h3>

            <p className="mt-2 text-[#8b746b]">
              {search
                ? "Search se matching customer nahi mila."
                : "Registered customers yahan show honge."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
      <h2 className="heading-font text-4xl text-[#9A3F4D]">
        {value}
      </h2>

      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#5B3B32]">
        {label}
      </p>
    </div>
  );
}

export default CustomersAdmin;