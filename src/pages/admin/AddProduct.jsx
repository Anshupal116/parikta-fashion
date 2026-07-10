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

    fabric: "",
    work: "",
    occasion: "",
    care: "",

    image: "",
    hoverImage: "",
    galleryFront: "",
    galleryBack: "",
    gallerySide: "",
    galleryCloseUp: "",
    galleryModelPose: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.image.trim() ||
      !form.hoverImage.trim() ||
      !form.galleryFront.trim() ||
      !form.galleryBack.trim()
    ) {
      alert(
        "Main Image, Hover Image, Gallery Front aur Gallery Back compulsory hain."
      );
      return;
    }

    if (Number(form.price) <= 0 || Number(form.mrp) <= 0) {
      alert("Price aur MRP valid hone chahiye.");
      return;
    }

    if (Number(form.mrp) < Number(form.price)) {
      alert("MRP selling price se kam nahi ho sakta.");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: form.name.trim(),
        type: form.type,
        category: form.category,
        price: Number(form.price),
        mrp: Number(form.mrp),
        discount: form.discount.trim(),
        color: form.color.trim(),
        badge: form.badge,
        stock: Number(form.stock || 0),
        description: form.description.trim(),

        fabric: form.fabric.trim(),
        work: form.work.trim(),
        occasion: form.occasion.trim(),
        care: form.care.trim(),

        image: form.image.trim(),
        hoverImage: form.hoverImage.trim(),

        galleryImages: {
          front: form.galleryFront.trim(),
          back: form.galleryBack.trim(),
          side: form.gallerySide.trim(),
          closeUp: form.galleryCloseUp.trim(),
          modelPose: form.galleryModelPose.trim(),
        },
      };

      const response = await createProduct(productData);

      if (response.success) {
        alert("Product added successfully ✅");
        navigate("/admin-dashboard/products");
      } else {
        alert(response.message || "Product add failed");
      }
    } catch (error) {
      console.error("Product create error:", error);
      alert("Server error. Product add nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  const imagePreviews = [
    ["Main Image", form.image, true],
    ["Hover Image", form.hoverImage, true],
    ["Gallery Front", form.galleryFront, true],
    ["Gallery Back", form.galleryBack, true],
    ["Gallery Side", form.gallerySide, false],
    ["Close-up Work", form.galleryCloseUp, false],
    ["Model Pose", form.galleryModelPose, false],
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Add Product
        </h1>

        <p className="text-[#8b746b] mt-2">
          Add complete product information and image gallery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* BASIC DETAILS */}
        <section className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8">
          <div className="mb-6">
            <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996]">
              Product Information
            </p>

            <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
              Basic Details
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            >
              <option value="Ready-made">Ready-made</option>
              <option value="Customize">Customize</option>
            </select>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
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
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="Selling Price"
              required
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <input
              name="mrp"
              type="number"
              min="0"
              value={form.mrp}
              onChange={handleChange}
              placeholder="MRP"
              required
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <input
              name="discount"
              value={form.discount}
              onChange={handleChange}
              placeholder="Discount e.g. 30% OFF"
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <select
              name="badge"
              value={form.badge}
              onChange={handleChange}
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
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
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock Quantity"
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />
          </div>
        </section>

        {/* PRODUCT SPECIFICATION */}
        <section className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8">
          <div className="mb-6">
            <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996]">
              Product Specification
            </p>

            <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
              Fabric & Design Details
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <input
              name="fabric"
              value={form.fabric}
              onChange={handleChange}
              placeholder="Fabric e.g. Premium Georgette"
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <input
              name="work"
              value={form.work}
              onChange={handleChange}
              placeholder="Work e.g. Hand Embroidery"
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <input
              name="occasion"
              value={form.occasion}
              onChange={handleChange}
              placeholder="Occasion e.g. Wedding, Festive, Party"
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <input
              name="care"
              value={form.care}
              onChange={handleChange}
              placeholder="Care e.g. Dry clean only"
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product Description"
              rows="5"
              required
              className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] col-span-2"
            />
          </div>
        </section>

        {/* IMAGE SECTION */}
        <section className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8">
          <div className="flex items-start justify-between gap-5 mb-6">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996]">
                Product Gallery
              </p>

              <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
                Product Images
              </h2>
            </div>

            <div className="bg-[#FDEAE6] text-[#9A3F4D] px-4 py-3 rounded-xl text-sm">
              4 required · 3 optional
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#5B3B32] mb-2">
                Main Image URL *
              </label>

              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3B32] mb-2">
                Hover Image URL *
              </label>

              <input
                name="hoverImage"
                value={form.hoverImage}
                onChange={handleChange}
                placeholder="https://..."
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3B32] mb-2">
                Gallery Front URL *
              </label>

              <input
                name="galleryFront"
                value={form.galleryFront}
                onChange={handleChange}
                placeholder="https://..."
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3B32] mb-2">
                Gallery Back URL *
              </label>

              <input
                name="galleryBack"
                value={form.galleryBack}
                onChange={handleChange}
                placeholder="https://..."
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3B32] mb-2">
                Gallery Side URL
              </label>

              <input
                name="gallerySide"
                value={form.gallerySide}
                onChange={handleChange}
                placeholder="Optional image URL"
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3B32] mb-2">
                Close-up Work URL
              </label>

              <input
                name="galleryCloseUp"
                value={form.galleryCloseUp}
                onChange={handleChange}
                placeholder="Optional image URL"
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[#5B3B32] mb-2">
                Model Pose URL
              </label>

              <input
                name="galleryModelPose"
                value={form.galleryModelPose}
                onChange={handleChange}
                placeholder="Optional image URL"
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
              />
            </div>
          </div>

          {/* IMAGE PREVIEW */}
          {imagePreviews.some(([, url]) => url) && (
            <div className="mt-8 border-t border-[#eadbd4] pt-7">
              <h3 className="heading-font text-2xl text-[#5B3B32] mb-5">
                Gallery Preview
              </h3>

              <div className="grid grid-cols-4 gap-5">
                {imagePreviews.map(([label, url, required]) =>
                  url ? (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-[#5B3B32] text-sm">
                          {label}
                        </p>

                        {required && (
                          <span className="text-[10px] bg-[#9A3F4D] text-white px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>

                      <div className="bg-[#f7f2ee] border border-[#eadbd4] rounded-2xl overflow-hidden">
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-52 object-cover object-top"
                        />
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </section>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#9A3F4D] text-white px-9 py-4 rounded-xl font-bold disabled:opacity-60"
          >
            {saving ? "SAVING PRODUCT..." : "SAVE PRODUCT"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/products")}
            className="border border-[#5B3B32] text-[#5B3B32] px-9 py-4 rounded-xl font-bold"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;