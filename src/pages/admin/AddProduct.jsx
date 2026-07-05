import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/productService";

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "Ready-made",
    category: "Suit",
    price: "",
    mrp: "",
    discount: "",
    color: "",
    badge: "",
    stock: "",
    description: "",
    image: "",
    hoverImage: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image.trim()) {
      alert("Main image URL required hai");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock || 0),
      };

      const response = await createProduct(productData);

      if (response.success) {
        alert("Product added successfully ✅");
        navigate("/admin-dashboard/products");
      } else {
        alert(response.message || "Product add failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server error. Product add nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Add Product
        </h1>
        <p className="text-[#8b746b] mt-2">
          Add product with image URL and save directly in MongoDB.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8"
      >
        <div className="grid grid-cols-2 gap-5">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required className="border border-[#eadbd4] rounded-xl p-4 outline-none" />

          <select name="type" value={form.type} onChange={handleChange} className="border border-[#eadbd4] rounded-xl p-4 outline-none">
            <option value="Ready-made">Ready-made</option>
            <option value="Customize">Customize</option>
          </select>

          <select name="category" value={form.category} onChange={handleChange} className="border border-[#eadbd4] rounded-xl p-4 outline-none">
            <option value="Suit">Suit</option>
            <option value="Saree">Saree</option>
            <option value="Kurti">Kurti</option>
            <option value="Lehenga">Lehenga</option>
            <option value="Gown">Gown</option>
            <option value="Other">Other</option>
          </select>

          <input name="color" value={form.color} onChange={handleChange} placeholder="Color" className="border border-[#eadbd4] rounded-xl p-4 outline-none" />
          <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Selling Price" required className="border border-[#eadbd4] rounded-xl p-4 outline-none" />
          <input name="mrp" type="number" value={form.mrp} onChange={handleChange} placeholder="MRP" required className="border border-[#eadbd4] rounded-xl p-4 outline-none" />
          <input name="discount" value={form.discount} onChange={handleChange} placeholder="Discount e.g. 30% OFF" className="border border-[#eadbd4] rounded-xl p-4 outline-none" />

          <select name="badge" value={form.badge} onChange={handleChange} className="border border-[#eadbd4] rounded-xl p-4 outline-none">
            <option value="">Select Badge</option>
            <option value="New Arrival">New Arrival</option>
            <option value="Best Seller">Best Seller</option>
            <option value="Trending">Trending</option>
            <option value="Limited Edition">Limited Edition</option>
          </select>

          <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock Qty" className="border border-[#eadbd4] rounded-xl p-4 outline-none" />

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
            value={form.hoverImage}
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
              Main Image Preview
            </p>
            <img
              src={form.image}
              alt="Preview"
              className="w-36 h-48 object-cover rounded-xl border"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-8 bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold disabled:opacity-60"
        >
          {saving ? "SAVING..." : "SAVE PRODUCT"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;