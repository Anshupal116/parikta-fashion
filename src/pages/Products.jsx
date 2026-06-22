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

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange("All");
    setColor("All");
    setSortBy("default");
  };

  const searchedProducts = products.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const categoryProducts = searchedProducts.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.type === selectedCategory;
  });

  const priceFilteredProducts = categoryProducts.filter((item) => {
    if (priceRange === "All") return true;
    if (priceRange === "under1000") return item.price < 1000;
    if (priceRange === "1000to3000")
      return item.price >= 1000 && item.price <= 3000;
    if (priceRange === "3000to8000")
      return item.price > 3000 && item.price <= 8000;
    if (priceRange === "above8000") return item.price > 8000;
    return true;
  });

  const colorFilteredProducts = priceFilteredProducts.filter((item) => {
    if (color === "All") return true;
    return item.color === color;
  });

  const finalProducts = [...colorFilteredProducts].sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    if (sortBy === "discount") return b.mrp - b.price - (a.mrp - a.price);
    return 0;
  });

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14">
        <Container>
          <div className="text-center mb-10">
            <p className="text-[#BFA996] font-semibold tracking-[0.25em]">
              PARIKTA COLLECTION
            </p>

            <h1 className="heading-font text-5xl text-[#5B3B32] mt-3">
              {search ? `Search Result: ${search}` : "Shop Collection"}
            </h1>

            <p className="text-[#8b746b] mt-3">
              {finalProducts.length} product(s) found
            </p>
          </div>

          <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6 mb-10">
            <div className="flex flex-wrap gap-3 mb-5">
              {["All", "Ready-made", "Customize"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full font-medium transition ${
                    selectedCategory === cat
                      ? "bg-[#9A3F4D] text-white"
                      : "bg-white border border-[#eadbd4] text-[#5B3B32]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="bg-white border border-[#eadbd4] rounded-full px-5 py-3 outline-none"
              >
                <option value="All">All Prices</option>
                <option value="under1000">Under ₹1,000</option>
                <option value="1000to3000">₹1,000 - ₹3,000</option>
                <option value="3000to8000">₹3,000 - ₹8,000</option>
                <option value="above8000">Above ₹8,000</option>
              </select>

              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="bg-white border border-[#eadbd4] rounded-full px-5 py-3 outline-none"
              >
                <option value="All">All Colors</option>
                <option value="Pink">Pink</option>
                <option value="Red">Red</option>
                <option value="Yellow">Yellow</option>
                <option value="Green">Green</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#eadbd4] rounded-full px-5 py-3 outline-none"
              >
                <option value="default">Sort By</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>

              <button
                onClick={clearFilters}
                className="bg-[#5B3B32] text-white px-5 py-3 rounded-full font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {finalProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
              <h2 className="text-2xl font-bold">No products found</h2>
              <p className="text-[#8b746b] mt-2">
                Try changing search, category, price or color filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {finalProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onQuickView={() => setQuickViewProduct(item)}
                />
              ))}
            </div>
          )}
        </Container>
      </main>

      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-4">
          <div className="bg-[#fffaf7] rounded-3xl max-w-4xl w-full p-6 relative">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-5 text-3xl text-[#5B3B32]"
            >
              ×
            </button>

            <div className="grid md:grid-cols-2 gap-8">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-[420px] object-cover rounded-2xl"
              />

              <div>
                <span className="inline-block bg-[#FDEAE6] text-[#9A3F4D] px-4 py-2 rounded-full text-sm font-semibold">
                  {quickViewProduct.type}
                </span>

                <h2 className="heading-font text-5xl text-[#5B3B32] mt-5">
                  {quickViewProduct.name}
                </h2>

                <p className="text-[#6d554d] mt-4 leading-7">
                  {quickViewProduct.description}
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <span className="text-3xl font-bold text-[#9A3F4D]">
                    ₹{quickViewProduct.price}
                  </span>

                  <span className="text-xl text-gray-400 line-through">
                    ₹{quickViewProduct.mrp}
                  </span>

                  <span className="text-green-600 font-bold">
                    {quickViewProduct.discount}
                  </span>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 bg-[#9A3F4D] text-white py-4 rounded-xl font-bold"
                  >
                    ADD TO BAG
                  </button>

                  <Link
                    to={`/product/${quickViewProduct.id}`}
                    className="flex-1 border-2 border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold text-center"
                  >
                    VIEW DETAILS
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