import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../../data/products";

function ProductsAdmin() {
  const [allProducts, setAllProducts] = useState([]);

  const loadProducts = () => {
    const adminProducts =
      JSON.parse(localStorage.getItem("parikta_admin_products")) || [];

    setAllProducts([...adminProducts, ...products]);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const adminProducts =
      JSON.parse(localStorage.getItem("parikta_admin_products")) || [];

    const updatedProducts = adminProducts.filter((item) => item.id !== id);

    localStorage.setItem(
      "parikta_admin_products",
      JSON.stringify(updatedProducts)
    );

    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-font text-4xl text-[#5B3B32]">
            Products
          </h1>

          <p className="text-[#8b746b] mt-2">
            Manage all Parikta Fashion products.
          </p>
        </div>

        <Link to="/admin-dashboard/add-product">
          <button className="bg-[#9A3F4D] text-white px-6 py-3 rounded-xl font-semibold">
            Add Product
          </button>
        </Link>
      </div>

      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FDEAE6] text-[#5B3B32]">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Product</th>
              <th className="p-4">Type</th>
              <th className="p-4">Color</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Price</th>
              <th className="p-4">MRP</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {allProducts.map((item) => {
              const isAdminProduct =
                JSON.parse(
                  localStorage.getItem("parikta_admin_products")
                )?.some((product) => product.id === item.id) || false;

              return (
                <tr
                  key={item.id}
                  className="border-t border-[#eadbd4] text-[#5B3B32]"
                >
                  <td className="p-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-xl"
                    />
                  </td>

                  <td className="p-4">
                    <p className="font-semibold">{item.name}</p>

                    {item.badge && (
                      <span className="inline-block mt-1 bg-[#9A3F4D] text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </td>

                  <td className="p-4">{item.type}</td>
                  <td className="p-4">{item.color || "-"}</td>
                  <td className="p-4">{item.stock ?? "-"}</td>

                  <td className="p-4 font-bold text-[#9A3F4D]">
                    ₹{item.price}
                  </td>

                  <td className="p-4 text-gray-500 line-through">
                    ₹{item.mrp}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                     <Link to={`/admin-dashboard/edit-product/${item.id}`}>
  <button
    disabled={!isAdminProduct}
    className={`px-4 py-2 rounded-lg text-sm text-white ${
      isAdminProduct
        ? "bg-[#5B3B32]"
        : "bg-gray-400 cursor-not-allowed"
    }`}
  >
    Edit
  </button>
</Link>

                      <button
                        disabled={!isAdminProduct}
                        onClick={() => deleteProduct(item.id)}
                        className={`px-4 py-2 rounded-lg text-sm text-white ${
                          isAdminProduct
                            ? "bg-red-500"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
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

      <p className="text-sm text-[#8b746b] mt-4">
        Note: Default products cannot be deleted here. Only admin-added products
        can be deleted.
      </p>
    </div>
  );
}

export default ProductsAdmin;