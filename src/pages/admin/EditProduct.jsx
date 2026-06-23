import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  useEffect(() => {
    const adminProducts =
      JSON.parse(localStorage.getItem("parikta_admin_products")) || [];

    const product = adminProducts.find((item) => item.id === Number(id));

    if (!product) {
      alert("Only admin-added products can be edited.");
      navigate("/admin-dashboard/products");
      return;
    }

    setForm(product);
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      setForm({
        ...form,
        [name]: URL.createObjectURL(files[0]),
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const adminProducts =
      JSON.parse(localStorage.getItem("parikta_admin_products")) || [];

    const updatedProducts = adminProducts.map((item) =>
      item.id === Number(id)
        ? {
            ...form,
            price: Number(form.price),
            mrp: Number(form.mrp),
            stock: Number(form.stock),
          }
        : item
    );

    localStorage.setItem(
      "parikta_admin_products",
      JSON.stringify(updatedProducts)
    );

    alert("Product updated successfully ✅");
    navigate("/admin-dashboard/products");
  };

  if (!form) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Edit Product
        </h1>
        <p className="text-[#8b746b] mt-2">
          Update admin-added product details.
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
            <option>Ready-made</option>
            <option>Customize</option>
          </select>

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
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="Color"
            required
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <select
            name="badge"
            value={form.badge}
            onChange={handleChange}
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          >
            <option value="">Select Badge</option>
            <option>New Arrival</option>
            <option>Best Seller</option>
            <option>Trending</option>
            <option>Limited Edition</option>
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
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="hoverImage"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
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

        <div className="grid grid-cols-2 gap-5 mt-6">
          {form.image && (
            <div>
              <p className="font-semibold text-[#5B3B32] mb-2">
                Main Image Preview
              </p>
              <img
                src={form.image}
                alt="Main Preview"
                className="w-40 h-52 object-cover rounded-xl border"
              />
            </div>
          )}

          {form.hoverImage && (
            <div>
              <p className="font-semibold text-[#5B3B32] mb-2">
                Hover Image Preview
              </p>
              <img
                src={form.hoverImage}
                alt="Hover Preview"
                className="w-40 h-52 object-cover rounded-xl border"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold"
          >
            UPDATE PRODUCT
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