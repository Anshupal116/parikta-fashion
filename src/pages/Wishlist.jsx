import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";

function Wishlist() {
  const { wishlistItems } = useWishlist();

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14">
        <Container>
          <div className="text-center mb-10">
            <p className="text-[#BFA996] font-semibold tracking-[0.25em]">
              SAVED STYLES
            </p>

            <h1 className="heading-font text-5xl text-[#5B3B32] mt-3">
              My Wishlist
            </h1>

            <p className="text-[#8b746b] mt-3">
              {wishlistItems.length} favourite outfit(s) saved
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">♡</div>

              <h2 className="heading-font text-3xl text-[#5B3B32]">
                Your wishlist is empty
              </h2>

              <p className="text-[#8b746b] mt-2">
                Save your favourite outfits here.
              </p>

              <Link to="/products">
                <button className="mt-6 bg-[#9A3F4D] text-white px-8 py-3 rounded-full font-bold hover:bg-[#7d3140]">
                  Explore Collection
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {wishlistItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default Wishlist;