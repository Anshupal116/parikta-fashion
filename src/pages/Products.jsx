import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";

function Products() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("All");
  const [color, setColor] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange("All");
    setColor("All");
    setSortBy("default");
  };

  const categories = ["All", "Ready-made", "Customize"];
  const colors = ["All", "Pink", "Red", "Yellow", "Green"];

  const searchedProducts = products.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.color?.toLowerCase().includes(q)
    );
  });

  const filteredProducts = searchedProducts
    .filter((item) => {
      if (selectedCategory === "All") return true;
      return item.type === selectedCategory;
    })
    .filter((item) => {
      if (priceRange === "All") return true;
      if (priceRange === "under1000") return item.price < 1000;
      if (priceRange === "1000to3000")
        return item.price >= 1000 && item.price <= 3000;
      if (priceRange === "3000to8000")
        return item.price > 3000 && item.price <= 8000;
      if (priceRange === "above8000") return item.price > 8000;
      return true;
    })
    .filter((item) => {
      if (color === "All") return true;
      return item.color === color;
    });

  const finalProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    if (sortBy === "discount") return b.mrp - b.price - (a.mrp - a.price);
    if (sortBy === "newest") return b.id - a.id;
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
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold ${
                selectedCategory === cat
                  ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                  : "bg-white border-[#eadbd4] text-[#5B3B32]"
              }`}
            >
              {cat}
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

      <main className="bg-[#f7f2ee] min-h-screen">
        <section className="bg-[#fffaf7] border-b border-[#eadbd4]">
          <Container>
            <div className="py-10 md:py-16 text-center max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.32em] uppercase text-[#BFA996] font-semibold">
                Parikta Collection
              </p>

              <h1 className="heading-font text-4xl md:text-6xl text-[#5B3B32] mt-3">
                {search ? `Search: ${search}` : "Shop Designer Collection"}
              </h1>

              <p className="text-[#8b746b] text-sm md:text-base leading-7 mt-4">
                Explore premium ready-made and custom outfits crafted with
                timeless elegance.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-6 md:py-10">
          <Container>
            <div className="lg:hidden mb-5">
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-5 py-2 rounded-full text-xs tracking-[0.12em] uppercase border ${
                      selectedCategory === cat
                        ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                        : "bg-[#fffaf7] text-[#5B3B32] border-[#eadbd4]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="bg-[#5B3B32] text-white py-3 rounded-xl text-xs tracking-[0.18em] uppercase font-semibold"
                >
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#fffaf7] border border-[#eadbd4] rounded-xl px-4 py-3 outline-none text-[#5B3B32] text-sm"
                >
                  <option value="default">Sort</option>
                  <option value="newest">Newest</option>
                  <option value="low-high">Low to High</option>
                  <option value="high-low">High to Low</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>

              <p className="text-[#8b746b] text-sm mt-4">
                {finalProducts.length} product(s) found
              </p>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-8">
              <aside className="hidden lg:block bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6 h-fit sticky top-32">
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
                <div className="hidden lg:flex items-center justify-between mb-7">
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
                  <div className="bg-[#fffaf7] rounded-3xl p-12 text-center border border-[#eadbd4]">
                    <h2 className="heading-font text-3xl text-[#5B3B32]">
                      No products found
                    </h2>
                    <p className="text-[#8b746b] mt-2">
                      Try changing search, category, price or color filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-7">
                    {finalProducts.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onQuickView={() => setQuickViewProduct(item)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      </main>

      {filterOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div
            onClick={() => setFilterOpen(false)}
            className="absolute inset-0 bg-black/55"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-[#fffaf7] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-font text-3xl text-[#5B3B32]">
                Filters
              </h2>

              <button
                onClick={() => setFilterOpen(false)}
                className="text-3xl text-[#5B3B32]"
              >
                ×
              </button>
            </div>

            <FilterContent />

            <button
              onClick={() => setFilterOpen(false)}
              className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold mt-6"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center px-4">
          <div className="bg-[#fffaf7] rounded-3xl max-w-4xl w-full p-5 md:p-6 relative">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-5 text-3xl text-[#5B3B32]"
            >
              ×
            </button>

            <div className="grid md:grid-cols-2 gap-7">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-[340px] md:h-[420px] object-cover rounded-2xl"
              />

              <div>
                <span className="inline-block bg-[#FDEAE6] text-[#9A3F4D] px-4 py-2 rounded-full text-sm font-semibold">
                  {quickViewProduct.type}
                </span>

                <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-5">
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

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 bg-[#9A3F4D] text-white py-4 rounded-xl font-bold text-sm"
                  >
                    ADD TO BAG
                  </button>

                  <Link
                    to={`/product/${quickViewProduct.id}`}
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