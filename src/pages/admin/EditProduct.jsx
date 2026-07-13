import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  updateProduct,
} from "../../services/productService";

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
          const product = response.product;

          setForm({
            name: product.name || "",
            type: product.type || "Ready-made",
            category: product.category || "Suit",
            color: product.color || "",
            price: product.price || "",
            mrp: product.mrp || "",
            discount: product.discount || "",
            badge: product.badge || "",
            stock: product.stock || "",
            image: product.image || "",
            hoverImage: product.hoverImage || "",
            galleryImage1: product.galleryImage1 || "",
            galleryImage2: product.galleryImage2 || "",
            galleryImage3: product.galleryImage3 || "",
            galleryImage4: product.galleryImage4 || "",
            galleryImage5: product.galleryImage5 || "",
            description: product.description || "",
          });
        } else {
          alert("Product not found");
          navigate("/admin-dashboard/products");
        }
      } catch (error) {
        console.error("Product load error:", error);
        alert("Product load failed");
        navigate("/admin-dashboard/products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
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
      console.error("Product update error:", error);
      alert(
        error?.response?.data?.message ||
          "Server error. Product update nahi hua."
      );
    } finally {
      setSaving(false);
    }
  };

  const imageFields = [
    {
      name: "image",
      label: "Main Image",
      placeholder: "Main Image URL",
      required: true,
    },
    {
      name: "hoverImage",
      label: "Hover Image",
      placeholder: "Hover Image URL",
    },
    {
      name: "galleryImage1",
      label: "Gallery Image 1 - Front",
      placeholder: "Front Image URL",
    },
    {
      name: "galleryImage2",
      label: "Gallery Image 2 - Back",
      placeholder: "Back Image URL",
    },
    {
      name: "galleryImage3",
      label: "Gallery Image 3 - Side",
      placeholder: "Side Image URL",
    },
    {
      name: "galleryImage4",
      label: "Gallery Image 4 - Close-up Work",
      placeholder: "Close-up Work Image URL",
    },
    {
      name: "galleryImage5",
      label: "Gallery Image 5 - Model Pose",
      placeholder: "Model Pose Image URL",
    },
  ];

  if (loading || !form) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

          <h2 className="text-2xl font-bold text-[#5B3B32]">
            Loading Product...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="heading-font text-3xl text-[#5B3B32] md:text-4xl">
          Edit Product
        </h1>

        <p className="mt-2 text-[#8b746b]">
          Product details aur images update karein.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-8"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Product Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Product Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            >
              <option value="Ready-made">Ready-made</option>
              <option value="Customize">Customize</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            >
              <option value="Suit">Suit</option>
              <option value="Saree">Saree</option>
              <option value="Kurti">Kurti</option>
              <option value="Lehenga">Lehenga</option>
              <option value="Gown">Gown</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Color
            </label>

            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Color"
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Selling Price
            </label>

            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="Selling Price"
              required
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              MRP
            </label>

            <input
              name="mrp"
              type="number"
              min="0"
              value={form.mrp}
              onChange={handleChange}
              placeholder="MRP"
              required
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Discount
            </label>

            <input
              name="discount"
              value={form.discount}
              onChange={handleChange}
              placeholder="Example: 30% OFF"
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Badge
            </label>

            <select
              name="badge"
              value={form.badge}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            >
              <option value="">Select Badge</option>
              <option value="New Arrival">New Arrival</option>
              <option value="Best Seller">Best Seller</option>
              <option value="Trending">Trending</option>
              <option value="Limited Edition">Limited Edition</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold text-[#5B3B32]">
              Stock Quantity
            </label>

            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock Quantity"
              className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
            />
          </div>
        </div>

        <div className="my-8 border-t border-[#eadbd4]" />

        <div>
          <h2 className="heading-font text-2xl text-[#5B3B32]">
            Product Images
          </h2>

          <p className="mt-1 text-sm text-[#8b746b]">
            Main, hover aur gallery images ke URLs update karein.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {imageFields.map((field) => (
            <div
              key={field.name}
              className={
                field.name === "image" || field.name === "hoverImage"
                  ? "md:col-span-1"
                  : ""
              }
            >
              <label className="mb-2 block font-semibold text-[#5B3B32]">
                {field.label}
              </label>

              <input
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
              />

              {form[field.name] && (
                <div className="mt-3 rounded-2xl border border-[#eadbd4] bg-white p-3">
                  <img
                    src={form[field.name]}
                    alt={`${field.label} Preview`}
                    className="h-64 w-full rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="my-8 border-t border-[#eadbd4]" />

        <div>
          <label className="mb-2 block font-semibold text-[#5B3B32]">
            Product Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product Description"
            rows="6"
            required
            className="w-full resize-none rounded-xl border border-[#eadbd4] bg-white p-4 outline-none transition focus:border-[#9A3F4D]"
          />
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#9A3F4D] px-8 py-4 font-bold text-white transition hover:bg-[#833642] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "UPDATING..." : "UPDATE PRODUCT"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => navigate("/admin-dashboard/products")}
            className="rounded-xl bg-[#5B3B32] px-8 py-4 font-bold text-white transition hover:bg-[#432b25] disabled:opacity-60"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;