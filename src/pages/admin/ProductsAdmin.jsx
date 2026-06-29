import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
} from "../../services/productService";

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data || []);
    } catch (error) {
      console.log(error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteProduct(id);

      if (response.success) {
        alert("Product deleted successfully");
        loadProducts();
      }
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#5B3B32]">
          Loading Products...
        </h2>
      </div>
    );
  }

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
              <th className="p-4">Category</th>
              <th className="p-4">Color</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Price</th>
              <th className="p-4">MRP</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((item) => (
              <tr
                key={item._id}
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

                <td className="p-4">{item.category}</td>

                <td className="p-4">
                  {item.color || "-"}
                </td>

                <td className="p-4">
                  {item.stock}
                </td>

                <td className="p-4 font-bold text-[#9A3F4D]">
                  ₹{item.price}
                </td>

                <td className="p-4 text-gray-500 line-through">
                  ₹{item.mrp}
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin-dashboard/edit-product/${item._id}`}
                    >
                      <button className="bg-[#5B3B32] text-white px-4 py-2 rounded-lg text-sm">
                        Edit
                      </button>
                    </Link>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-[#5B3B32]">
              No Products Found
            </h3>

            <p className="text-[#8b746b] mt-2">
              Add your first product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsAdmin;