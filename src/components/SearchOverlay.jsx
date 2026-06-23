import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { products } from "../data/products";

function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const popularSearches = ["Saree", "Lehenga", "Kurti", "Suit", "Custom"];

  const filteredProducts = products.filter((item) => {
    const search = query.toLowerCase();

    return (
      item.name.toLowerCase().includes(search) ||
      item.type.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim()) {
      navigate(`/products?search=${query}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/60">
      <div className="bg-[#fffaf7] min-h-[70vh] rounded-b-[32px] shadow-2xl">
        <div className="max-w-5xl mx-auto px-5 py-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#BFA996]">
                Parikta Search
              </p>
              <h2 className="heading-font text-4xl text-[#5B3B32]">
                Find Your Style
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-4xl text-[#5B3B32]"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saree, lehenga, kurti..."
              className="w-full bg-[#f7f2ee] border border-[#eadbd4] rounded-full px-6 py-4 outline-none text-[#5B3B32] focus:border-[#9A3F4D]"
            />
          </form>

          <div className="mt-6">
            <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996] mb-3">
              Popular Searches
            </p>

            <div className="flex flex-wrap gap-3">
              {popularSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => setQuery(item)}
                  className="bg-[#FDEAE6] text-[#5B3B32] px-5 py-2 rounded-full text-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {query && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996]">
                  Live Results
                </p>

                <button
                  onClick={() => {
                    navigate(`/products?search=${query}`);
                    onClose();
                  }}
                  className="text-[#9A3F4D] text-xs tracking-[0.18em] uppercase font-bold"
                >
                  View All
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-[#f7f2ee] rounded-2xl p-6 text-center">
                  <p className="text-[#5B3B32] font-semibold">
                    No products found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredProducts.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      onClick={onClose}
                      className="bg-[#f7f2ee] rounded-2xl overflow-hidden border border-[#eadbd4]"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full aspect-[3/4] object-cover"
                      />

                      <div className="p-3 text-center">
                        <h3 className="text-sm font-semibold text-[#5B3B32] line-clamp-1">
                          {item.name}
                        </h3>

                        <p className="text-[#9A3F4D] font-bold text-sm mt-1">
                          ₹{item.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute inset-0 -z-10"
      ></button>
    </div>
  );
}

export default SearchOverlay;