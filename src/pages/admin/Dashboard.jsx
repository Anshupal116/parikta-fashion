import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { getOrders } from "../../services/orderService";
import { getCustomers } from "../../services/customerService";
import { getProducts } from "../../services/productService";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getOrderAmount = (order) =>
  Number(
    order.totalAmount ??
      order.grandTotal ??
      order.finalAmount ??
      order.amount ??
      order.total ??
      0
  );

const getOrderStatus = (order) =>
  String(order.orderStatus || order.status || "Pending");

const getPaymentStatus = (order) =>
  String(order.paymentStatus || order.payment?.status || "Pending");

const getOrderCustomer = (order) =>
  order.customer?.name ||
  order.user?.name ||
  order.shippingAddress?.fullName ||
  order.customerName ||
  order.customer ||
  "Guest Customer";

const getOrderDate = (order) =>
  parseDate(order.createdAt || order.orderDate || order.date);

const getOrderId = (order) =>
  order.orderNumber || order.invoiceNumber || order._id || order.id || "—";

const normaliseArray = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const STATUS_ORDER = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_STYLE = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Processing: "bg-violet-50 text-violet-700 border-violet-200",
  Shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function Dashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const results = await Promise.allSettled([
        getOrders(),
        getCustomers(),
        getProducts(),
      ]);

      const [ordersResult, customersResult, productsResult] = results;

      if (ordersResult.status === "fulfilled") {
        setOrders(
          normaliseArray(ordersResult.value, ["orders", "results", "items"])
        );
      }

      if (customersResult.status === "fulfilled") {
        setCustomers(
          normaliseArray(customersResult.value, [
            "customers",
            "users",
            "results",
            "items",
          ])
        );
      }

      if (productsResult.status === "fulfilled") {
        setProducts(
          normaliseArray(productsResult.value, [
            "products",
            "results",
            "items",
          ])
        );
      }

      const failed = results.filter((item) => item.status === "rejected");

      if (failed.length === 3) {
        throw new Error("Dashboard data load nahi hua.");
      }

      if (failed.length > 0) {
        setError(
          "Kuch dashboard sections load nahi hue. Refresh karke dobara try karo."
        );
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Dashboard data load nahi hua.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const analytics = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => getOrderStatus(order).toLowerCase() !== "cancelled"
    );

    const totalRevenue = activeOrders.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );

    const deliveredOrders = orders.filter(
      (order) => getOrderStatus(order).toLowerCase() === "delivered"
    );

    const deliveredRevenue = deliveredOrders.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );

    const averageOrderValue =
      activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = orders.filter((order) => {
      const date = getOrderDate(order);
      return date && date >= todayStart;
    });

    const thisMonthOrders = orders.filter((order) => {
      const date = getOrderDate(order);
      return date && date >= monthStart;
    });

    const thisMonthRevenue = thisMonthOrders
      .filter(
        (order) => getOrderStatus(order).toLowerCase() !== "cancelled"
      )
      .reduce((sum, order) => sum + getOrderAmount(order), 0);

    const statusCounts = STATUS_ORDER.reduce((result, status) => {
      result[status] = orders.filter(
        (order) =>
          getOrderStatus(order).toLowerCase() === status.toLowerCase()
      ).length;
      return result;
    }, {});

    const lowStockProducts = products
      .filter((product) => Number(product.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 6);

    const recentOrders = [...orders]
      .sort((a, b) => {
        const first = getOrderDate(a)?.getTime() || 0;
        const second = getOrderDate(b)?.getTime() || 0;
        return second - first;
      })
      .slice(0, 8);

    const recentCustomers = [...customers]
      .sort((a, b) => {
        const first =
          parseDate(a.createdAt || a.joinedAt)?.getTime() || 0;
        const second =
          parseDate(b.createdAt || b.joinedAt)?.getTime() || 0;
        return second - first;
      })
      .slice(0, 5);

    const topProductsMap = {};

    orders.forEach((order) => {
      const items = order.items || order.orderItems || order.products || [];

      items.forEach((item) => {
        const name =
          item.product?.name ||
          item.name ||
          item.productName ||
          "Unnamed Product";
        const quantity = Number(item.quantity || item.qty || 1);
        const amount = Number(
          item.total ??
            item.subtotal ??
            item.price * quantity ??
            item.product?.price * quantity ??
            0
        );

        if (!topProductsMap[name]) {
          topProductsMap[name] = {
            name,
            quantity: 0,
            revenue: 0,
            image: item.product?.image || item.image || "",
          };
        }

        topProductsMap[name].quantity += quantity;
        topProductsMap[name].revenue += amount;
      });
    });

    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const readyMadeCount = products.filter(
      (product) => product.type === "Ready-made"
    ).length;

    const customizeCount = products.filter(
      (product) => product.type === "Customize"
    ).length;

    const monthly = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-IN", { month: "short" }),
        revenue: 0,
        orders: 0,
      };
    });

    orders.forEach((order) => {
      const orderDate = getOrderDate(order);
      if (!orderDate) return;

      const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      const month = monthly.find((item) => item.key === key);

      if (month) {
        month.orders += 1;

        if (getOrderStatus(order).toLowerCase() !== "cancelled") {
          month.revenue += getOrderAmount(order);
        }
      }
    });

    return {
      totalRevenue,
      deliveredRevenue,
      averageOrderValue,
      todayOrders: todayOrders.length,
      thisMonthOrders: thisMonthOrders.length,
      thisMonthRevenue,
      statusCounts,
      lowStockProducts,
      recentOrders,
      recentCustomers,
      topProducts,
      readyMadeCount,
      customizeCount,
      monthly,
    };
  }, [orders, customers, products]);

  const salesChart = useMemo(
    () => ({
      series: [
        {
          name: "Revenue",
          type: "area",
          data: analytics.monthly.map((item) => item.revenue),
        },
        {
          name: "Orders",
          type: "line",
          data: analytics.monthly.map((item) => item.orders),
        },
      ],
      options: {
        chart: {
          toolbar: { show: false },
          fontFamily: "inherit",
          background: "transparent",
        },
        colors: ["#9A3F4D", "#5B3B32"],
        stroke: {
          curve: "smooth",
          width: [3, 3],
        },
        fill: {
          type: ["gradient", "solid"],
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.03,
            stops: [0, 90, 100],
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: analytics.monthly.map((item) => item.label),
          labels: { style: { colors: "#8b746b" } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: [
          {
            labels: {
              formatter: (value) => `₹${Math.round(value / 1000)}k`,
              style: { colors: "#8b746b" },
            },
          },
          {
            opposite: true,
            labels: {
              formatter: (value) => Math.round(value),
              style: { colors: "#8b746b" },
            },
          },
        ],
        grid: {
          borderColor: "#eadbd4",
          strokeDashArray: 5,
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          labels: { colors: "#5B3B32" },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: [
            { formatter: (value) => money(value) },
            { formatter: (value) => `${Math.round(value)} orders` },
          ],
        },
      },
    }),
    [analytics.monthly]
  );

  const statusChart = useMemo(
    () => ({
      series: STATUS_ORDER.map(
        (status) => analytics.statusCounts[status] || 0
      ),
      options: {
        labels: STATUS_ORDER,
        chart: { fontFamily: "inherit" },
        colors: [
          "#D9A441",
          "#5A7DB8",
          "#8A63A8",
          "#4F9BA8",
          "#4D9B74",
          "#C65A67",
        ],
        legend: {
          position: "bottom",
          labels: { colors: "#5B3B32" },
        },
        dataLabels: {
          enabled: true,
          formatter: (value) => `${Math.round(value)}%`,
        },
        plotOptions: {
          pie: {
            donut: {
              size: "70%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total Orders",
                  color: "#8b746b",
                  formatter: () => formatNumber(orders.length),
                },
                value: {
                  color: "#5B3B32",
                  fontSize: "26px",
                  fontWeight: 700,
                },
              },
            },
          },
        },
        stroke: { width: 0 },
        tooltip: {
          y: {
            formatter: (value) => `${value} orders`,
          },
        },
      },
    }),
    [analytics.statusCounts, orders.length]
  );

  const productChart = useMemo(
    () => ({
      series: [analytics.readyMadeCount, analytics.customizeCount],
      options: {
        labels: ["Ready-made", "Customize"],
        chart: { fontFamily: "inherit" },
        colors: ["#9A3F4D", "#D2A88F"],
        legend: {
          position: "bottom",
          labels: { colors: "#5B3B32" },
        },
        dataLabels: {
          formatter: (value) => `${Math.round(value)}%`,
        },
        stroke: { width: 0 },
        plotOptions: {
          pie: {
            donut: {
              size: "68%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Products",
                  formatter: () => formatNumber(products.length),
                },
              },
            },
          },
        },
      },
    }),
    [analytics.readyMadeCount, analytics.customizeCount, products.length]
  );

  const statCards = [
    {
      title: "Total Revenue",
      value: money(analytics.totalRevenue),
      note: `${money(analytics.thisMonthRevenue)} this month`,
      icon: "₹",
      accent: "from-[#9A3F4D] to-[#74303b]",
    },
    {
      title: "Total Orders",
      value: formatNumber(orders.length),
      note: `${analytics.todayOrders} received today`,
      icon: "O",
      accent: "from-[#6F4E46] to-[#4f3732]",
    },
    {
      title: "Total Customers",
      value: formatNumber(customers.length),
      note: `${analytics.recentCustomers.length} recent customers`,
      icon: "C",
      accent: "from-[#B98E78] to-[#906956]",
    },
    {
      title: "Total Products",
      value: formatNumber(products.length),
      note: `${analytics.lowStockProducts.length} low stock`,
      icon: "P",
      accent: "from-[#7D5E72] to-[#5d4354]",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />
          <p className="mt-5 font-semibold text-[#5B3B32]">
            Dashboard loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#BFA996]">
            Business Intelligence
          </p>
          <h1 className="heading-font mt-2 text-4xl text-[#5B3B32] md:text-5xl">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-[#8b746b]">
            Parikta Fashion ka live business overview.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32] transition hover:border-[#9A3F4D] disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/add-product")}
            className="rounded-xl bg-[#9A3F4D] px-5 py-3 font-semibold text-white transition hover:bg-[#7e303d]"
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm"
          >
            <div
              className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-lg font-bold text-white shadow-lg`}
            >
              {card.icon}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a837a]">
              {card.title}
            </p>

            <h2 className="heading-font mt-4 pr-14 text-4xl text-[#5B3B32]">
              {card.value}
            </h2>

            <p className="mt-3 text-sm text-[#8b746b]">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                Performance
              </p>
              <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                Revenue & Orders
              </h2>
            </div>

            <div className="rounded-xl bg-[#FDEAE6] px-3 py-2 text-xs font-bold text-[#9A3F4D]">
              Last 6 Months
            </div>
          </div>

          <Chart
            options={salesChart.options}
            series={salesChart.series}
            type="line"
            height={355}
          />
        </section>

        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-7">
          <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
            Fulfilment
          </p>
          <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
            Order Status
          </h2>

          {orders.length > 0 ? (
            <Chart
              options={statusChart.options}
              series={statusChart.series}
              type="donut"
              height={345}
            />
          ) : (
            <EmptyState text="Order data available nahi hai." />
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MiniCard
          label="Pending Orders"
          value={analytics.statusCounts.Pending || 0}
          note="Needs confirmation"
        />
        <MiniCard
          label="Delivered Orders"
          value={analytics.statusCounts.Delivered || 0}
          note={money(analytics.deliveredRevenue)}
        />
        <MiniCard
          label="Average Order Value"
          value={money(analytics.averageOrderValue)}
          note={`${analytics.thisMonthOrders} orders this month`}
        />
        <MiniCard
          label="Cancelled Orders"
          value={analytics.statusCounts.Cancelled || 0}
          note="Review cancellation reasons"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.7fr)]">
        <section className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eadbd4] p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                Latest Activity
              </p>
              <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                Recent Orders
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin-dashboard/orders")}
              className="text-sm font-bold text-[#9A3F4D]"
            >
              View All →
            </button>
          </div>

          {analytics.recentOrders.length === 0 ? (
            <EmptyState text="Abhi koi order available nahi hai." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#FDEAE6] text-xs uppercase tracking-wider text-[#5B3B32]">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.recentOrders.map((order, index) => {
                    const status = getOrderStatus(order);
                    const date = getOrderDate(order);

                    return (
                      <tr
                        key={order._id || order.id || index}
                        className="border-t border-[#eadbd4] text-sm text-[#5B3B32]"
                      >
                        <td className="px-5 py-4 font-bold text-[#9A3F4D]">
                          {String(getOrderId(order)).slice(-12)}
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {getOrderCustomer(order)}
                        </td>
                        <td className="px-5 py-4 font-bold">
                          {money(getOrderAmount(order))}
                        </td>
                        <td className="px-5 py-4">
                          {getPaymentStatus(order)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-5 py-4 text-[#8b746b]">
                          {date
                            ? date.toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
            Catalogue Mix
          </p>
          <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
            Product Types
          </h2>

          {products.length > 0 ? (
            <Chart
              options={productChart.options}
              series={productChart.series}
              type="donut"
              height={315}
            />
          ) : (
            <EmptyState text="Product data available nahi hai." />
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                Inventory
              </p>
              <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                Low Stock
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard/products")}
              className="text-sm font-bold text-[#9A3F4D]"
            >
              Products →
            </button>
          </div>

          {analytics.lowStockProducts.length === 0 ? (
            <EmptyState text="Sab products ka stock theek hai." compact />
          ) : (
            <div className="space-y-3">
              {analytics.lowStockProducts.map((product, index) => (
                <div
                  key={product._id || product.id || index}
                  className="flex items-center gap-3 rounded-2xl border border-[#eadbd4] bg-white p-3"
                >
                  <div className="h-14 w-12 overflow-hidden rounded-xl bg-[#f7f2ee]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#9a837a]">
                        IMG
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#5B3B32]">
                      {product.name || "Unnamed Product"}
                    </p>
                    <p className="text-xs text-[#8b746b]">
                      {product.category || "Other"}
                    </p>
                  </div>

                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                    {Number(product.stock || 0)} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
            Sales Leaders
          </p>
          <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
            Top Products
          </h2>

          {analytics.topProducts.length === 0 ? (
            <EmptyState
              text="Order items milne par top products show honge."
              compact
            />
          ) : (
            <div className="mt-5 space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-3 border-b border-[#eadbd4] pb-4 last:border-0"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDEAE6] font-bold text-[#9A3F4D]">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#5B3B32]">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#8b746b]">
                      {product.quantity} units sold
                    </p>
                  </div>
                  <p className="font-bold text-[#9A3F4D]">
                    {money(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm lg:col-span-2 xl:col-span-1">
          <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
            Navigation
          </p>
          <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
            Quick Actions
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <QuickAction
              label="Add Product"
              sublabel="Create listing"
              onClick={() => navigate("/admin-dashboard/add-product")}
            />
            <QuickAction
              label="Orders"
              sublabel="Manage orders"
              onClick={() => navigate("/admin-dashboard/orders")}
            />
            <QuickAction
              label="Customers"
              sublabel="View customers"
              onClick={() => navigate("/admin-dashboard/customers")}
            />
            <QuickAction
              label="Products"
              sublabel="Manage stock"
              onClick={() => navigate("/admin-dashboard/products")}
            />
            <QuickAction
              label="Coupons"
              sublabel="Discount codes"
              onClick={() => navigate("/admin-dashboard/coupons")}
            />
            <QuickAction
              label="Reviews"
              sublabel="Customer feedback"
              onClick={() => navigate("/admin-dashboard/reviews")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniCard({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a837a]">
        {label}
      </p>
      <p className="heading-font mt-3 text-3xl text-[#5B3B32]">{value}</p>
      <p className="mt-2 text-xs text-[#8b746b]">{note}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalised =
    STATUS_ORDER.find(
      (item) => item.toLowerCase() === String(status).toLowerCase()
    ) || status;

  const className =
    STATUS_STYLE[normalised] ||
    "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${className}`}
    >
      {normalised}
    </span>
  );
}

function QuickAction({ label, sublabel, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-[#eadbd4] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#9A3F4D] hover:shadow-md"
    >
      <p className="font-bold text-[#5B3B32]">{label}</p>
      <p className="mt-1 text-xs text-[#8b746b]">{sublabel}</p>
    </button>
  );
}

function EmptyState({ text, compact = false }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-dashed border-[#dfcbc2] bg-[#fffdfb] px-5 text-center text-sm text-[#8b746b] ${
        compact ? "mt-5 min-h-36" : "min-h-72"
      }`}
    >
      {text}
    </div>
  );
}

export default Dashboard;