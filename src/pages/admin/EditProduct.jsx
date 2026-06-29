import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../services/productService";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await getProductById(id);

        if (response.success) {
          setForm(response.product);
        } else {
          alert("Product not found");
          navigate("/admin-dashboard/products");
        }
      } catch (error) {
        console.log(error);
        alert("Product load failed");
        navigate("/admin-dashboard/products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const productData = {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
      };

      const response = await updateProduct(id, productData);

      if (response.success) {
        alert("Product updated successfully ✅");
        navigate("/admin-dashboard/products");
      } else {
        alert(response.message || "Product update failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server error. Product update nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#5B3B32]">
          Loading Product...
        </h2>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Edit Product
        </h1>

        <p className="text-[#8b746b] mt-2">
          Update product directly in MongoDB.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8"
      >
        <div className="grid grid-cols-2 gap-5">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          >
            <option value="Ready-made">Ready-made</option>
            <option value="Customize">Customize</option>
          </select>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          >
            <option value="Suit">Suit</option>
            <option value="Saree">Saree</option>
            <option value="Kurti">Kurti</option>
            <option value="Lehenga">Lehenga</option>
            <option value="Gown">Gown</option>
            <option value="Other">Other</option>
          </select>

          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="Color"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Selling Price"
            required
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="mrp"
            type="number"
            value={form.mrp}
            onChange={handleChange}
            placeholder="MRP"
            required
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="discount"
            value={form.discount}
            onChange={handleChange}
            placeholder="Discount e.g. 30% OFF"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <select
            name="badge"
            value={form.badge}
            onChange={handleChange}
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          >
            <option value="">Select Badge</option>
            <option value="New Arrival">New Arrival</option>
            <option value="Best Seller">Best Seller</option>
            <option value="Trending">Trending</option>
            <option value="Limited Edition">Limited Edition</option>
          </select>

          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock Qty"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Main Image URL"
            required
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="hoverImage"
            value={form.hoverImage || ""}
            onChange={handleChange}
            placeholder="Hover Image URL"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none col-span-2"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product Description"
            rows="5"
            required
            className="border border-[#eadbd4] rounded-xl p-4 outline-none col-span-2"
          />
        </div>

        {form.image && (
          <div className="mt-6">
            <p className="font-semibold text-[#5B3B32] mb-2">
              Image Preview
            </p>

            <img
              src={form.image}
              alt="Preview"
              className="w-40 h-52 object-cover rounded-xl border"
            />
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold disabled:opacity-60"
          >
            {saving ? "UPDATING..." : "UPDATE PRODUCT"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/products")}
            className="bg-[#5B3B32] text-white px-8 py-4 rounded-xl font-bold"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;