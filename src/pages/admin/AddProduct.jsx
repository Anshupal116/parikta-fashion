import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/productService";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

const initialForm = {
  name: "",
  sku: "",
  slug: "",
  type: "Ready-made",
  category: "Suit",
  status: "Active",

  price: "",
  mrp: "",
  gstRate: "5",
  badge: "",

  color: "",
  fabric: "",
  work: "",
  occasion: "",
  sleeve: "",
  neck: "",
  fit: "",
  length: "",
  pattern: "",
  packageContains: "",
  care: "",
  countryOfOrigin: "India",
  description: "",

  sizeStock: {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  },

  image: "",
  hoverImage: "",
  galleryFront: "",
  galleryBack: "",
  gallerySide: "",
  galleryCloseUp: "",
  galleryModelPose: "",
  videoUrl: "",

  metaTitle: "",
  metaDescription: "",
  keywords: "",

  weight: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  deliveryDays: "5-7",
  freeShipping: true,
  codAvailable: true,
  returnAvailable: true,

  featured: false,
  trending: false,
  recommended: false,
  showOnHome: false,

  measurementRequired: false,
  colorChangeAllowed: false,
  sleeveChangeAllowed: false,
  customDesignUploadAllowed: false,
  customizationExtraCharge: "",
};

const inputClass =
  "w-full rounded-xl border border-[#eadbd4] bg-white px-4 py-3.5 text-[#5B3B32] outline-none transition focus:border-[#9A3F4D] focus:ring-2 focus:ring-[#9A3F4D]/10";

const labelClass = "mb-2 block text-sm font-semibold text-[#5B3B32]";

function createSlug(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createSku(category, name) {
  const categoryCode = (category || "PRD").slice(0, 3).toUpperCase();
  const nameCode = (name || "ITEM")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `PAR-${categoryCode}-${nameCode || "ITEM"}-${random}`;
}

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const discountPercent = useMemo(() => {
    const mrp = Number(form.mrp);
    const price = Number(form.price);

    if (!mrp || !price || mrp < price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  }, [form.mrp, form.price]);

  const totalStock = useMemo(
    () =>
      Object.values(form.sizeStock).reduce(
        (sum, quantity) => sum + Number(quantity || 0),
        0
      ),
    [form.sizeStock]
  );

  const imagePreviews = [
    ["Main Image", form.image, true],
    ["Hover Image", form.hoverImage, true],
    ["Front", form.galleryFront, true],
    ["Back", form.galleryBack, true],
    ["Side", form.gallerySide, false],
    ["Close-up", form.galleryCloseUp, false],
    ["Model Pose", form.galleryModelPose, false],
  ];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => {
      const nextValue = type === "checkbox" ? checked : value;
      const nextForm = {
        ...previous,
        [name]: nextValue,
      };

      if (name === "name") {
        nextForm.slug = createSlug(value);
        nextForm.metaTitle = value;
      }

      return nextForm;
    });
  };

  const handleSizeChange = (size, value) => {
    setForm((previous) => ({
      ...previous,
      sizeStock: {
        ...previous.sizeStock,
        [size]: Math.max(0, Number(value || 0)),
      },
    }));
  };

  const generateSku = () => {
    setForm((previous) => ({
      ...previous,
      sku: createSku(previous.category, previous.name),
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Product name required hai.";
    if (!form.sku.trim()) return "SKU generate ya enter karo.";
    if (!form.slug.trim()) return "Slug required hai.";
    if (!form.description.trim()) return "Description required hai.";

    if (Number(form.price) <= 0 || Number(form.mrp) <= 0) {
      return "Selling price aur MRP valid hone chahiye.";
    }

    if (Number(form.mrp) < Number(form.price)) {
      return "MRP selling price se kam nahi ho sakta.";
    }

    if (
      !form.image.trim() ||
      !form.hoverImage.trim() ||
      !form.galleryFront.trim() ||
      !form.galleryBack.trim()
    ) {
      return "Main, Hover, Front aur Back image required hain.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      alert(validationError);
      return;
    }

    const productData = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      slug: form.slug.trim(),
      type: form.type,
      category: form.category,
      status: form.status,
      isActive: form.status === "Active",

      price: Number(form.price),
      mrp: Number(form.mrp),
      discount: discountPercent ? `${discountPercent}% OFF` : "",
      discountPercent,
      gstRate: Number(form.gstRate || 0),
      badge: form.badge,

      color: form.color.trim(),
      description: form.description.trim(),

      specifications: {
        fabric: form.fabric.trim(),
        work: form.work.trim(),
        occasion: form.occasion.trim(),
        sleeve: form.sleeve.trim(),
        neck: form.neck.trim(),
        fit: form.fit.trim(),
        length: form.length.trim(),
        pattern: form.pattern.trim(),
        packageContains: form.packageContains.trim(),
        care: form.care.trim(),
        countryOfOrigin: form.countryOfOrigin.trim(),
      },

      fabric: form.fabric.trim(),
      work: form.work.trim(),
      occasion: form.occasion.trim(),
      care: form.care.trim(),

      sizeStock: form.sizeStock,
      stock: totalStock,

      image: form.image.trim(),
      hoverImage: form.hoverImage.trim(),
      galleryImages: {
        front: form.galleryFront.trim(),
        back: form.galleryBack.trim(),
        side: form.gallerySide.trim(),
        closeUp: form.galleryCloseUp.trim(),
        modelPose: form.galleryModelPose.trim(),
      },
      videoUrl: form.videoUrl.trim(),

      seo: {
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        keywords: form.keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },

      shipping: {
        weight: Number(form.weight || 0),
        lengthCm: Number(form.lengthCm || 0),
        widthCm: Number(form.widthCm || 0),
        heightCm: Number(form.heightCm || 0),
        deliveryDays: form.deliveryDays.trim(),
        freeShipping: form.freeShipping,
        codAvailable: form.codAvailable,
        returnAvailable: form.returnAvailable,
      },

      flags: {
        featured: form.featured,
        trending: form.trending,
        recommended: form.recommended,
        showOnHome: form.showOnHome,
      },

      customization: {
        measurementRequired: form.measurementRequired,
        colorChangeAllowed: form.colorChangeAllowed,
        sleeveChangeAllowed: form.sleeveChangeAllowed,
        customDesignUploadAllowed: form.customDesignUploadAllowed,
        extraCharge: Number(form.customizationExtraCharge || 0),
      },
    };

    try {
      setSaving(true);

      const response = await createProduct(productData);

      if (response.success) {
        alert("Product added successfully ✅");
        navigate("/admin-dashboard/products");
        return;
      }

      alert(response.message || "Product add failed");
    } catch (error) {
      console.error("Product create error:", error);
      alert(error.message || "Server error. Product add nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#BFA996]">
            Product Management
          </p>
          <h1 className="heading-font mt-2 text-4xl text-[#5B3B32] md:text-5xl">
            Add New Product
          </h1>
          <p className="mt-2 text-[#8b746b]">
            Complete product information, inventory, gallery and SEO.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-[#eadbd4] bg-[#fffaf7] px-5 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[#BFA996]">
              Total Stock
            </p>
            <p className="text-2xl font-bold text-[#5B3B32]">{totalStock}</p>
          </div>

          <div className="rounded-2xl border border-[#eadbd4] bg-[#fffaf7] px-5 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[#BFA996]">
              Discount
            </p>
            <p className="text-2xl font-bold text-[#9A3F4D]">
              {discountPercent}%
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-8">
            <Section eyebrow="Product Information" title="Basic Details">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Product Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Designer Embroidered Suit"
                    className={inputClass}
                  />
                </Field>

                <Field label="Product Type *">
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Ready-made">Ready-made</option>
                    <option value="Customize">Customize</option>
                  </select>
                </Field>

                <Field label="Category *">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Suit">Suit</option>
                    <option value="Saree">Saree</option>
                    <option value="Kurti">Kurti</option>
                    <option value="Lehenga">Lehenga</option>
                    <option value="Gown">Gown</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Product Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </Field>

                <Field label="SKU *">
                  <div className="flex gap-2">
                    <input
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="PAR-SUI-0001"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={generateSku}
                      className="shrink-0 rounded-xl bg-[#5B3B32] px-4 text-sm font-semibold text-white"
                    >
                      Generate
                    </button>
                  </div>
                </Field>

                <Field label="Slug *">
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="designer-embroidered-suit"
                    className={inputClass}
                  />
                </Field>

                <Field label="Color">
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Wine Red"
                    className={inputClass}
                  />
                </Field>

                <Field label="Badge">
                  <select
                    name="badge"
                    value={form.badge}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">No Badge</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Trending">Trending</option>
                    <option value="Limited Edition">Limited Edition</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section eyebrow="Commercial Details" title="Pricing & Tax">
              <div className="grid gap-5 md:grid-cols-4">
                <Field label="Selling Price *">
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="2999"
                    className={inputClass}
                  />
                </Field>

                <Field label="MRP *">
                  <input
                    name="mrp"
                    type="number"
                    min="0"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="3999"
                    className={inputClass}
                  />
                </Field>

                <Field label="Discount">
                  <div className={`${inputClass} bg-[#f7f2ee] font-bold text-[#9A3F4D]`}>
                    {discountPercent}% OFF
                  </div>
                </Field>

                <Field label="GST Rate">
                  <select
                    name="gstRate"
                    value={form.gstRate}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section eyebrow="Product Specification" title="Design & Description">
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["fabric", "Fabric", "Premium Georgette"],
                  ["work", "Work", "Hand Embroidery"],
                  ["occasion", "Occasion", "Wedding, Festive"],
                  ["sleeve", "Sleeve Type", "Full Sleeve"],
                  ["neck", "Neck Type", "Round Neck"],
                  ["fit", "Fit", "Regular Fit"],
                  ["length", "Length", "Ankle Length"],
                  ["pattern", "Pattern", "Embroidered"],
                  ["packageContains", "Package Contains", "Kurta, Bottom, Dupatta"],
                  ["care", "Care Instructions", "Dry clean only"],
                  ["countryOfOrigin", "Country of Origin", "India"],
                ].map(([name, label, placeholder]) => (
                  <Field key={name} label={label}>
                    <input
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  </Field>
                ))}

                <div className="md:col-span-2">
                  <Field label="Product Description *">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Write complete product description..."
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section eyebrow="Inventory" title="Size-wise Stock">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                {SIZE_OPTIONS.map((size) => (
                  <Field key={size} label={size}>
                    <input
                      type="number"
                      min="0"
                      value={form.sizeStock[size]}
                      onChange={(event) =>
                        handleSizeChange(size, event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f2ee] px-5 py-4 text-sm text-[#5B3B32]">
                Total stock automatically calculated:{" "}
                <strong>{totalStock}</strong>
              </div>
            </Section>

            <Section eyebrow="Product Gallery" title="Images & Video">
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["image", "Main Image URL *"],
                  ["hoverImage", "Hover Image URL *"],
                  ["galleryFront", "Gallery Front URL *"],
                  ["galleryBack", "Gallery Back URL *"],
                  ["gallerySide", "Gallery Side URL"],
                  ["galleryCloseUp", "Close-up Work URL"],
                  ["galleryModelPose", "Model Pose URL"],
                  ["videoUrl", "Product Video URL"],
                ].map(([name, label]) => (
                  <Field key={name} label={label}>
                    <input
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </Field>
                ))}
              </div>

              {imagePreviews.some(([, url]) => url) && (
                <div className="mt-8 border-t border-[#eadbd4] pt-7">
                  <h3 className="heading-font mb-5 text-2xl text-[#5B3B32]">
                    Gallery Preview
                  </h3>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {imagePreviews.map(([label, url, required]) =>
                      url ? (
                        <div key={label}>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-[#5B3B32]">
                              {label}
                            </p>
                            {required && (
                              <span className="rounded-full bg-[#9A3F4D] px-2 py-1 text-[9px] text-white">
                                Required
                              </span>
                            )}
                          </div>

                          <img
                            src={url}
                            alt={label}
                            className="h-52 w-full rounded-2xl border border-[#eadbd4] bg-[#f7f2ee] object-cover object-top"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </Section>

            <Section eyebrow="Search Visibility" title="SEO Details">
              <div className="grid gap-5">
                <Field label="Meta Title">
                  <input
                    name="metaTitle"
                    value={form.metaTitle}
                    onChange={handleChange}
                    placeholder="Designer Wedding Suit | Parikta"
                    className={inputClass}
                  />
                </Field>

                <Field label="Meta Description">
                  <textarea
                    name="metaDescription"
                    value={form.metaDescription}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Short search-engine description..."
                    className={inputClass}
                  />
                </Field>

                <Field label="Keywords">
                  <input
                    name="keywords"
                    value={form.keywords}
                    onChange={handleChange}
                    placeholder="designer suit, wedding wear, festive suit"
                    className={inputClass}
                  />
                </Field>
              </div>
            </Section>

            <Section eyebrow="Order Fulfilment" title="Shipping & Availability">
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  ["weight", "Weight (kg)"],
                  ["lengthCm", "Length (cm)"],
                  ["widthCm", "Width (cm)"],
                  ["heightCm", "Height (cm)"],
                  ["deliveryDays", "Estimated Delivery"],
                ].map(([name, label]) => (
                  <Field key={name} label={label}>
                    <input
                      name={name}
                      type={name === "deliveryDays" ? "text" : "number"}
                      min="0"
                      value={form[name]}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                ))}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <CheckBox
                  name="freeShipping"
                  checked={form.freeShipping}
                  onChange={handleChange}
                  label="Free Shipping"
                />
                <CheckBox
                  name="codAvailable"
                  checked={form.codAvailable}
                  onChange={handleChange}
                  label="COD Available"
                />
                <CheckBox
                  name="returnAvailable"
                  checked={form.returnAvailable}
                  onChange={handleChange}
                  label="Return Available"
                />
              </div>
            </Section>

            <Section eyebrow="Store Placement" title="Homepage Controls">
              <div className="grid gap-3 md:grid-cols-2">
                <CheckBox
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  label="Featured Product"
                />
                <CheckBox
                  name="trending"
                  checked={form.trending}
                  onChange={handleChange}
                  label="Trending Product"
                />
                <CheckBox
                  name="recommended"
                  checked={form.recommended}
                  onChange={handleChange}
                  label="Recommended Product"
                />
                <CheckBox
                  name="showOnHome"
                  checked={form.showOnHome}
                  onChange={handleChange}
                  label="Show on Homepage"
                />
              </div>
            </Section>

            {form.type === "Customize" && (
              <Section eyebrow="Made to Measure" title="Customization Options">
                <div className="grid gap-3 md:grid-cols-2">
                  <CheckBox
                    name="measurementRequired"
                    checked={form.measurementRequired}
                    onChange={handleChange}
                    label="Measurement Required"
                  />
                  <CheckBox
                    name="colorChangeAllowed"
                    checked={form.colorChangeAllowed}
                    onChange={handleChange}
                    label="Color Change Allowed"
                  />
                  <CheckBox
                    name="sleeveChangeAllowed"
                    checked={form.sleeveChangeAllowed}
                    onChange={handleChange}
                    label="Sleeve Change Allowed"
                  />
                  <CheckBox
                    name="customDesignUploadAllowed"
                    checked={form.customDesignUploadAllowed}
                    onChange={handleChange}
                    label="Customer Design Upload"
                  />
                </div>

                <div className="mt-5 max-w-sm">
                  <Field label="Customization Extra Charge">
                    <input
                      name="customizationExtraCharge"
                      type="number"
                      min="0"
                      value={form.customizationExtraCharge}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>
            )}
          </div>

          <aside className="xl:sticky xl:top-28 xl:h-fit">
            <div className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] shadow-sm">
              <div className="border-b border-[#eadbd4] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#BFA996]">
                  Live Preview
                </p>
                <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                  Customer View
                </h2>
              </div>

              <div className="p-5">
                <div className="relative overflow-hidden rounded-2xl bg-[#f7f2ee]">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt={form.name || "Product preview"}
                      className="h-[430px] w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-[430px] items-center justify-center text-sm text-[#9a837a]">
                      Main image preview
                    </div>
                  )}

                  {form.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#9A3F4D] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {form.badge}
                    </span>
                  )}
                </div>

                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[#BFA996]">
                  {form.category} · {form.type}
                </p>

                <h3 className="heading-font mt-2 text-3xl text-[#5B3B32]">
                  {form.name || "Product Name"}
                </h3>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold text-[#9A3F4D]">
                    ₹{form.price || "0"}
                  </span>

                  {form.mrp && (
                    <span className="text-gray-400 line-through">
                      ₹{form.mrp}
                    </span>
                  )}

                  {discountPercent > 0 && (
                    <span className="font-semibold text-green-600">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#7a625a]">
                  {form.description ||
                    "Product description customer ko yahan dikhai degi."}
                </p>

                <div className="mt-5 rounded-2xl bg-[#f7f2ee] p-4 text-sm text-[#5B3B32]">
                  <div className="flex justify-between">
                    <span>Stock</span>
                    <strong>{totalStock}</strong>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>Status</span>
                    <strong>{form.status}</strong>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#9A3F4D] px-9 py-4 font-bold text-white transition hover:bg-[#7e303d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "SAVING PRODUCT..." : "SAVE PRODUCT"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/products")}
            className="rounded-xl border border-[#5B3B32] px-9 py-4 font-bold text-[#5B3B32]"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 md:p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#BFA996]">
          {eyebrow}
        </p>
        <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function CheckBox({ name, checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#eadbd4] bg-white px-4 py-4 text-sm font-semibold text-[#5B3B32]">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#9A3F4D]"
      />
      {label}
    </label>
  );
}

export default AddProduct;