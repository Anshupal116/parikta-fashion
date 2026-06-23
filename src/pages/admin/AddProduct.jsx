import { useState } from "react";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    type: "Ready-made",
    price: "",
    mrp: "",
    color: "",
    badge: "",
    stock: "",
    description: "",
    image: "",
    hoverImage: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const imageUrl = URL.createObjectURL(files[0]);

      setForm({
        ...form,
        [name]: imageUrl,
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

    const existingProducts =
      JSON.parse(localStorage.getItem("parikta_admin_products")) || [];

    const newProduct = {
      ...form,
      id: Date.now(),
      price: Number(form.price),
      mrp: Number(form.mrp),
      stock: Number(form.stock),
    };

    localStorage.setItem(
      "parikta_admin_products",
      JSON.stringify([newProduct, ...existingProducts])
    );

    alert("Product added successfully ✅");

    setForm({
      name: "",
      type: "Ready-made",
      price: "",
      mrp: "",
      color: "",
      badge: "",
      stock: "",
      description: "",
      image: "",
      hoverImage: "",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Add Product
        </h1>
        <p className="text-[#8b746b] mt-2">
          Add a new product to Parikta Fashion collection.
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

        {(form.image || form.hoverImage) && (
          <div className="grid grid-cols-2 gap-5 mt-6">
            {form.image && (
              <div>
                <p className="font-semibold text-[#5B3B32] mb-2">
                  Main Image Preview
                </p>
                <img
                  src={form.image}
                  alt="Preview"
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
                  alt="Preview"
                  className="w-40 h-52 object-cover rounded-xl border"
                />
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="mt-8 bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold"
        >
          SAVE PRODUCT
        </button>
      </form>
    </div>
  );
}

export default AddProduct;