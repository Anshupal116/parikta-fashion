import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "All";
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const validCategories = ["All", "Saree", "Suit", "Kurti", "Lehenga", "Gown", "Other"];

  const [selectedCategory, setSelectedCategory] = useState(
    validCategories.includes(categoryFromUrl) ? categoryFromUrl : "All"
  );
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("All");
  const [color, setColor] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedType !== "All",
    priceRange !== "All",
    color !== "All",
  ].filter(Boolean).length;

  const categories = [
    { label: "All", value: "All" },
    { label: "Sarees", value: "Saree" },
    { label: "Suits", value: "Suit" },
    { label: "Kurtis", value: "Kurti" },
    { label: "Lehengas", value: "Lehenga" },
    { label: "Gowns", value: "Gown" },
    { label: "Other", value: "Other" },
  ];

  const productTypes = ["All", "Ready-made", "Customize"];
  const colors = ["All", "Pink", "Red", "Yellow", "Green"];

  useEffect(() => {
    setSelectedCategory(
      validCategories.includes(categoryFromUrl) ? categoryFromUrl : "All"
    );
  }, [categoryFromUrl]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const nextParams = new URLSearchParams(searchParams);

    if (category === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    setSearchParams(nextParams);
  };

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();

        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Products load failed:", error);

        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const modalOpen = filterOpen || Boolean(quickViewProduct);
    document.body.style.overflow = modalOpen ? "hidden" : "";

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setFilterOpen(false);
      setQuickViewProduct(null);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [filterOpen, quickViewProduct]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedType("All");
    setPriceRange("All");
    setColor("All");
    setSortBy("default");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    setSearchParams(nextParams);
  };

  const searchedProducts = products.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.name?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.color?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  const finalProducts = searchedProducts
    .filter(
      (item) =>
        selectedCategory === "All" || item.category === selectedCategory
    )
    .filter(
      (item) => selectedType === "All" || item.type === selectedType
    )
    .filter((item) => {
      if (priceRange === "All") return true;
      if (priceRange === "under1000") return item.price < 1000;
      if (priceRange === "1000to3000") return item.price >= 1000 && item.price <= 3000;
      if (priceRange === "3000to8000") return item.price > 3000 && item.price <= 8000;
      if (priceRange === "above8000") return item.price > 8000;
      return true;
    })
    .filter((item) => color === "All" || item.color === color)
    .sort((a, b) => {
      if (sortBy === "low-high") return a.price - b.price;
      if (sortBy === "high-low") return b.price - a.price;
      if (sortBy === "discount") return b.mrp - b.price - (a.mrp - a.price);
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const FilterContent = () => (
    <div className="space-y-7">
      <div>
        <h3 className="text-xs tracking-[0.25em] uppercase text-[#BFA996] font-bold mb-4">
          Category
        </h3>

        <div className="grid gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold ${
                selectedCategory === cat.value
                  ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                  : "bg-white border-[#eadbd4] text-[#5B3B32]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>


      <div>
        <h3 className="text-xs tracking-[0.25em] uppercase text-[#BFA996] font-bold mb-4">
          Product Type
        </h3>

        <div className="grid gap-3">
          {productTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold ${
                selectedType === type
                  ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                  : "bg-white border-[#eadbd4] text-[#5B3B32]"
              }`}
            >
              {type === "All" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.25em] uppercase text-[#BFA996] font-bold mb-4">
          Price
        </h3>

        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="w-full bg-white border border-[#eadbd4] rounded-xl px-4 py-3 outline-none text-[#5B3B32]"
        >
          <option value="All">All Prices</option>
          <option value="under1000">Under ₹1,000</option>
          <option value="1000to3000">₹1,000 - ₹3,000</option>
          <option value="3000to8000">₹3,000 - ₹8,000</option>
          <option value="above8000">Above ₹8,000</option>
        </select>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.25em] uppercase text-[#BFA996] font-bold mb-4">
          Color
        </h3>

        <div className="flex flex-wrap gap-3">
          {colors.map((clr) => (
            <button
              key={clr}
              onClick={() => setColor(clr)}
              className={`px-4 py-2 rounded-full border text-sm ${
                color === clr
                  ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                  : "bg-white border-[#eadbd4] text-[#5B3B32]"
              }`}
            >
              {clr}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full bg-[#5B3B32] text-white py-3 rounded-xl font-semibold"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f2ee]">
        <section className="border-b border-[#eadbd4] bg-[#fffaf7]">
          <Container>
            <div className="mx-auto max-w-3xl py-8 text-center sm:py-10 md:py-16">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#BFA996] sm:text-xs sm:tracking-[0.32em]">
                Parikta Collection
              </p>

              <h1 className="heading-font mt-3 text-[2.35rem] leading-[1.05] text-[#5B3B32] sm:text-5xl md:text-6xl">
                {search
                  ? `Search: ${search}`
                  : selectedCategory === "All"
                  ? "Shop Designer Collection"
                  : `Designer ${
                      categories.find((cat) => cat.value === selectedCategory)?.label
                    }`}
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8b746b] sm:mt-4 md:text-base md:leading-7">
                Explore premium ready-made and custom outfits from MongoDB.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-5 sm:py-7 md:py-10">
          <Container>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:ml-[312px] xl:grid-cols-4 md:gap-7">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-[#eadbd4] bg-[#fffaf7]"
                  >
                    <div className="aspect-[3/4] animate-pulse bg-[#eadbd4]/70" />
                    <div className="space-y-3 p-3">
                      <div className="h-3 w-1/3 animate-pulse rounded bg-[#eadbd4]" />
                      <div className="h-4 w-full animate-pulse rounded bg-[#eadbd4]" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#eadbd4]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-5 lg:hidden">
                  <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategoryChange(cat.value)}
                        className={`min-h-11 shrink-0 snap-start touch-manipulation rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition active:scale-[0.98] ${
                          selectedCategory === cat.value
                            ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                            : "bg-[#fffaf7] text-[#5B3B32] border-[#eadbd4]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="sticky top-[92px] z-30 -mx-4 grid grid-cols-2 gap-2.5 border-y border-[#eadbd4] bg-[#f7f2ee]/95 px-4 py-3 backdrop-blur sm:top-[96px]">
                    <button
                      type="button"
                      onClick={() => setFilterOpen(true)}
                      className="relative flex min-h-12 touch-manipulation items-center justify-center rounded-xl bg-[#5B3B32] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white active:scale-[0.98]"
                    >
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#5B3B32]">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="min-h-12 rounded-xl border border-[#eadbd4] bg-[#fffaf7] px-3 py-3 text-sm text-[#5B3B32] outline-none"
                    >
                      <option value="default">Sort</option>
                      <option value="newest">Newest</option>
                      <option value="low-high">Low to High</option>
                      <option value="high-low">High to Low</option>
                      <option value="discount">Best Discount</option>
                    </select>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-[#8b746b]">
                      <span className="font-bold text-[#5B3B32]">
                        {finalProducts.length}
                      </span>{" "}
                      product{finalProducts.length === 1 ? "" : "s"}
                    </p>

                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-bold uppercase tracking-[0.12em] text-[#9A3F4D]"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
                  <aside className="sticky top-28 hidden h-fit rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-[0_12px_35px_rgba(91,59,50,0.05)] lg:block">
                    <div className="mb-7">
                      <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                        Filters
                      </p>

                      <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
                        Refine Style
                      </h2>
                    </div>

                    <FilterContent />
                  </aside>

                  <div>
                    <div className="mb-7 hidden items-center justify-between lg:flex">
                      <div>
                        <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                          Showing Collection
                        </p>

                        <h2 className="heading-font text-4xl text-[#5B3B32]">
                          {finalProducts.length} Products
                        </h2>
                      </div>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#fffaf7] border border-[#eadbd4] rounded-full px-5 py-3 outline-none text-[#5B3B32]"
                      >
                        <option value="default">Sort By</option>
                        <option value="newest">Newest First</option>
                        <option value="low-high">Price: Low to High</option>
                        <option value="high-low">Price: High to Low</option>
                        <option value="discount">Best Discount</option>
                      </select>
                    </div>

                    {finalProducts.length === 0 ? (
                      <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] px-5 py-12 text-center sm:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEAE6] text-2xl">
                          ✦
                        </div>
                        <h2 className="heading-font mt-5 text-3xl text-[#5B3B32]">
                          No products found
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8b746b]">
                          Try changing your filters or explore the complete collection.
                        </p>
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-6 min-h-12 rounded-full bg-[#9A3F4D] px-7 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4 xl:gap-7">
                        {finalProducts.map((item) => (
                          <ProductCard
                            key={item._id}
                            item={item}
                            onQuickView={() => setQuickViewProduct(item)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </Container>
        </section>
      </main>

      {filterOpen && (
        <div
          className="fixed inset-0 z-[10050] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <button
            type="button"
            onClick={() => setFilterOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Close filters"
          />

          <div className="absolute bottom-0 left-0 right-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] bg-[#fffaf7] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[#eadbd4] px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BFA996]">
                  Refine Collection
                </p>
                <h2 className="heading-font text-3xl text-[#5B3B32]">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4] bg-white text-2xl text-[#5B3B32]"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <FilterContent />
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#eadbd4] bg-[#fffaf7] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-12 rounded-xl border border-[#9A3F4D] px-4 py-3 text-xs font-bold uppercase tracking-[0.13em] text-[#9A3F4D]"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="min-h-12 rounded-xl bg-[#9A3F4D] px-4 py-3 text-xs font-bold uppercase tracking-[0.13em] text-white"
              >
                Show {finalProducts.length}
              </button>
            </div>
          </div>
        </div>
      )}

      {quickViewProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5"
          style={{ zIndex: 2147483647 }}
          onClick={() => setQuickViewProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Product quick view"
        >
          <div
            className="relative my-auto max-h-[calc(100dvh-24px)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-[24px] bg-[#fffaf7] p-4 shadow-2xl sm:max-h-[calc(100dvh-40px)] sm:rounded-3xl sm:p-5 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close quick view"
              className="sticky top-0 z-20 ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4] bg-white/95 text-2xl text-[#5B3B32] shadow-sm backdrop-blur sm:absolute sm:right-4 sm:top-4"
            >
              ×
            </button>

            <div className="grid gap-5 md:grid-cols-2 md:gap-7">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="h-[300px] w-full rounded-2xl object-cover object-top sm:h-[360px] md:h-[420px]"
              />

              <div>
                <span className="inline-block bg-[#FDEAE6] text-[#9A3F4D] px-4 py-2 rounded-full text-sm font-semibold">
                  {quickViewProduct.category} · {quickViewProduct.type}
                </span>

                <h2 className="heading-font mt-4 text-3xl leading-tight text-[#5B3B32] sm:text-4xl md:mt-5 md:text-5xl">
                  {quickViewProduct.name}
                </h2>

                <p className="text-[#6d554d] mt-4 leading-7 text-sm md:text-base">
                  {quickViewProduct.description}
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <span className="text-2xl md:text-3xl font-bold text-[#9A3F4D]">
                    ₹{quickViewProduct.price}
                  </span>

                  <span className="text-lg text-gray-400 line-through">
                    ₹{quickViewProduct.mrp}
                  </span>

                  <span className="text-green-600 font-bold text-sm">
                    {quickViewProduct.discount}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-8">
                  <button
                    onClick={() => {
                      addToCart({ ...quickViewProduct, id: quickViewProduct._id });
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 bg-[#9A3F4D] text-white py-4 rounded-xl font-bold text-sm"
                  >
                    ADD TO BAG
                  </button>

                  <Link
                    to={`/product/${quickViewProduct._id}`}
                    className="flex-1 border-2 border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold text-center text-sm"
                  >
                    DETAILS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Products;