import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../services/productService";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getStockStatus = (stock) => {
  const quantity = Number(stock || 0);

  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 5) return "Low Stock";
  return "In Stock";
};

const getDiscountPercent = (price, mrp) => {
  const sellingPrice = Number(price || 0);
  const originalPrice = Number(mrp || 0);

  if (!originalPrice || originalPrice <= sellingPrice) return 0;

  return Math.round(
    ((originalPrice - sellingPrice) / originalPrice) * 100
  );
};

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [stockSaving, setStockSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadProducts = async (showRefreshLoader = false) => {
    try {
      showRefreshLoader ? setRefreshing(true) : setLoading(true);
      setError("");

      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (loadError) {
      console.error("Products load error:", loadError);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const status = getStockStatus(product.stock);

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.color?.toLowerCase().includes(query) ||
        product.badge?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      const matchesStock =
        stockFilter === "All" || status === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "nameAsc") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "priceLow") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "priceHigh") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "stockLow") {
        return Number(a.stock || 0) - Number(b.stock || 0);
      }

      if (sortBy === "stockHigh") {
        return Number(b.stock || 0) - Number(a.stock || 0);
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    stockFilter,
    sortBy,
  ]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [
    search,
    categoryFilter,
    stockFilter,
    sortBy,
    pageSize,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inStock = products.filter(
      (product) => getStockStatus(product.stock) === "In Stock"
    ).length;
    const lowStock = products.filter(
      (product) => getStockStatus(product.stock) === "Low Stock"
    ).length;
    const outOfStock = products.filter(
      (product) =>
        getStockStatus(product.stock) === "Out of Stock"
    ).length;

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const handleDelete = async (product) => {
    const confirmDelete = window.confirm(
      `Delete "${product.name}" product?`
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteProduct(product._id);

      if (response?.success === false) {
        throw new Error(
          response.message || "Product delete failed"
        );
      }

      setProducts((current) =>
        current.filter(
          (item) => item._id !== product._id
        )
      );

      setSelectedIds((current) =>
        current.filter((id) => id !== product._id)
      );
    } catch (deleteError) {
      console.error("Product delete error:", deleteError);

      window.alert(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Delete failed"
      );
    }
  };

  const openStockModal = (product) => {
    setStockProduct(product);
    setStockValue(String(product.stock ?? 0));
    setStockModalOpen(true);
  };

  const closeStockModal = () => {
    if (stockSaving) return;

    setStockModalOpen(false);
    setStockProduct(null);
    setStockValue("");
  };

  const handleStockSave = async (event) => {
    event.preventDefault();

    const nextStock = Number(stockValue);

    if (
      stockValue === "" ||
      Number.isNaN(nextStock) ||
      nextStock < 0
    ) {
      window.alert("Valid stock quantity enter karo");
      return;
    }

    try {
      setStockSaving(true);

      const payload = {
        ...stockProduct,
        stock: nextStock,
      };

      const response = await updateProduct(
        stockProduct._id,
        payload
      );

      if (response?.success === false) {
        throw new Error(
          response.message || "Stock update failed"
        );
      }

      const updatedProduct =
        response?.product ||
        response?.data?.product ||
        response?.data ||
        null;

      setProducts((current) =>
        current.map((product) =>
          product._id === stockProduct._id
            ? {
                ...product,
                ...(updatedProduct &&
                typeof updatedProduct === "object"
                  ? updatedProduct
                  : {}),
                stock: nextStock,
              }
            : product
        )
      );

      closeStockModal();
    } catch (stockError) {
      console.error("Stock update error:", stockError);

      window.alert(
        stockError?.response?.data?.message ||
          stockError?.message ||
          "Stock update failed"
      );
    } finally {
      setStockSaving(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleSelectPage = () => {
    const pageIds = paginatedProducts.map(
      (product) => product._id
    );

    const allSelected =
      pageIds.length > 0 &&
      pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !pageIds.includes(id))
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([...current, ...pageIds]),
      ]);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    const confirmDelete = window.confirm(
      `${selectedIds.length} selected products delete karne hain?`
    );

    if (!confirmDelete) return;

    try {
      setBulkDeleting(true);

      const results = await Promise.allSettled(
        selectedIds.map((id) => deleteProduct(id))
      );

      const deletedIds = results
        .map((result, index) => ({
          result,
          id: selectedIds[index],
        }))
        .filter(
          ({ result }) =>
            result.status === "fulfilled" &&
            result.value?.success !== false
        )
        .map(({ id }) => id);

      setProducts((current) =>
        current.filter(
          (product) => !deletedIds.includes(product._id)
        )
      );

      setSelectedIds([]);
    } finally {
      setBulkDeleting(false);
    }
  };

  const exportCsv = () => {
    if (!filteredProducts.length) {
      window.alert("Export ke liye products nahi hain");
      return;
    }

    const rows = filteredProducts.map((product) => ({
      Name: product.name || "",
      Category: product.category || "",
      Color: product.color || "",
      Stock: Number(product.stock || 0),
      Price: Number(product.price || 0),
      MRP: Number(product.mrp || 0),
      Status: getStockStatus(product.stock),
      Badge: product.badge || "",
    }));

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header] ?? "").replace(
              /"/g,
              '""'
            );
            return `"${value}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `parikta-products-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStockFilter("All");
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

          <h2 className="text-2xl font-bold text-[#5B3B32] mt-5">
            Loading Products...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996]">
            Catalog Management
          </p>

          <h1 className="heading-font text-4xl text-[#5B3B32] mt-1">
            Products
          </h1>

          <p className="text-[#8b746b] mt-2">
            Manage Parikta Fashion products and stock.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="border border-[#9A3F4D] bg-white text-[#9A3F4D] px-5 py-3 rounded-xl font-semibold"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
            className="bg-[#5B3B32] text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link to="/admin-dashboard/add-product">
            <button
              type="button"
              className="bg-[#9A3F4D] text-white px-5 py-3 rounded-xl font-semibold"
            >
              + Add Product
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-bold text-red-700">
            Products load nahi hue
          </h3>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadProducts()}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          ["Total Products", stats.totalProducts],
          ["In Stock", stats.inStock],
          ["Low Stock", stats.lowStock],
          ["Out of Stock", stats.outOfStock],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 shadow-sm"
          >
            <h2 className="heading-font text-4xl text-[#9A3F4D]">
              {value}
            </h2>

            <p className="text-[11px] tracking-[0.16em] uppercase text-[#5B3B32] mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-5 mb-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product, category or color..."
            className="xl:col-span-2 border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none focus:border-[#9A3F4D]"
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category === "All"
                  ? "All Categories"
                  : category}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(event.target.value)
            }
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="All">
              All Stock Status
            </option>
            <option value="In Stock">
              In Stock
            </option>
            <option value="Low Stock">
              Low Stock
            </option>
            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
            className="border border-[#eadbd4] bg-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="newest">
              Newest First
            </option>
            <option value="nameAsc">
              Name A-Z
            </option>
            <option value="priceLow">
              Price Low to High
            </option>
            <option value="priceHigh">
              Price High to Low
            </option>
            <option value="stockLow">
              Stock Low to High
            </option>
            <option value="stockHigh">
              Stock High to Low
            </option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-[#8b746b]">
            Showing{" "}
            <strong className="text-[#5B3B32]">
              {filteredProducts.length}
            </strong>{" "}
            of{" "}
            <strong className="text-[#5B3B32]">
              {products.length}
            </strong>
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-[#9A3F4D]"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-[#eadbd4] bg-[#FDEAE6] p-4">
          <p className="font-semibold text-[#5B3B32]">
            {selectedIds.length} products selected
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {bulkDeleting
                ? "Deleting..."
                : "Delete Selected"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-xl border border-[#9A3F4D] bg-white px-4 py-2 text-sm font-semibold text-[#9A3F4D]"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left">
            <thead className="bg-[#FDEAE6] text-[#5B3B32]">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every(
                        (product) =>
                          selectedIds.includes(
                            product._id
                          )
                      )
                    }
                    onChange={toggleSelectPage}
                  />
                </th>

                <th className="p-4">Image</th>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Color</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Price</th>
                <th className="p-4">MRP</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map((item) => {
                const stockStatus =
                  getStockStatus(item.stock);

                const discountPercent =
                  getDiscountPercent(
                    item.price,
                    item.mrp
                  );

                return (
                  <tr
                    key={item._id}
                    className="border-t border-[#eadbd4] text-[#5B3B32] hover:bg-[#fff7f3]"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          item._id
                        )}
                        onChange={() =>
                          toggleSelect(item._id)
                        }
                      />
                    </td>

                    <td className="p-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-xl border border-[#eadbd4] bg-white"
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://placehold.co/160x200?text=Product";
                        }}
                      />
                    </td>

                    <td className="p-4 min-w-[220px]">
                      <p className="font-semibold">
                        {item.name}
                      </p>

                      {item.badge && (
                        <span className="inline-block mt-2 bg-[#9A3F4D] text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {item.category || "-"}
                    </td>

                    <td className="p-4">
                      {item.color || "-"}
                    </td>

                    <td className="p-4 min-w-[150px]">
                      <p className="font-bold">
                        {Number(item.stock || 0)}
                      </p>

                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full border text-xs font-bold ${
                          stockStatus === "In Stock"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : stockStatus === "Low Stock"
                              ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                              : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {stockStatus}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-[#9A3F4D]">
                      {formatCurrency(item.price)}
                    </td>

                    <td className="p-4 text-gray-500 line-through">
                      {formatCurrency(item.mrp)}
                    </td>

                    <td className="p-4">
                      {discountPercent > 0
                        ? `${discountPercent}%`
                        : "-"}
                    </td>

                    <td className="p-4 min-w-[250px]">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin-dashboard/edit-product/${item._id}`}
                        >
                          <button
                            type="button"
                            className="bg-[#5B3B32] text-white px-4 py-2 rounded-xl text-sm"
                          >
                            Edit
                          </button>
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            openStockModal(item)
                          }
                          className="bg-[#9A3F4D] text-white px-4 py-2 rounded-xl text-sm"
                        >
                          Update Stock
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 px-5">
            <h3 className="heading-font text-3xl text-[#5B3B32]">
              No Products Found
            </h3>

            <p className="text-[#8b746b] mt-2">
              Search ya filters change karke dobara
              check karo.
            </p>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="border-t border-[#eadbd4] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#8b746b]">
                Rows per page
              </span>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(
                    Number(event.target.value)
                  )
                }
                className="border border-[#eadbd4] rounded-xl px-3 py-2 bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={page <= 1}
                className="border border-[#eadbd4] rounded-xl px-4 py-2 bg-white disabled:opacity-40"
              >
                Previous
              </button>

              <p className="text-sm text-[#8b746b]">
                Page <strong>{page}</strong> of{" "}
                <strong>{totalPages}</strong>
              </p>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                disabled={page >= totalPages}
                className="border border-[#eadbd4] rounded-xl px-4 py-2 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {stockModalOpen && stockProduct && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-[#fffaf7] rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eadbd4]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#BFA996]">
                Quick Stock Update
              </p>

              <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
                Update Stock
              </h2>
            </div>

            <form
              onSubmit={handleStockSave}
              className="p-6"
            >
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={stockProduct.image}
                  alt={stockProduct.name}
                  className="w-16 h-20 object-cover rounded-xl border border-[#eadbd4]"
                />

                <div>
                  <p className="font-bold text-[#5B3B32]">
                    {stockProduct.name}
                  </p>

                  <p className="text-sm text-[#8b746b] mt-1">
                    Current stock:{" "}
                    {Number(stockProduct.stock || 0)}
                  </p>
                </div>
              </div>

              <label className="text-sm font-bold text-[#5B3B32]">
                New Stock Quantity
              </label>

              <input
                type="number"
                min="0"
                value={stockValue}
                onChange={(event) =>
                  setStockValue(event.target.value)
                }
                className="w-full mt-2 border border-[#eadbd4] rounded-xl px-4 py-3 outline-none focus:border-[#9A3F4D]"
                autoFocus
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockSaving}
                  className="border border-[#9A3F4D] text-[#9A3F4D] px-5 py-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={stockSaving}
                  className="bg-[#9A3F4D] text-white px-5 py-3 rounded-xl disabled:opacity-50"
                >
                  {stockSaving
                    ? "Updating..."
                    : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsAdmin;