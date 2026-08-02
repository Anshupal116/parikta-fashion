import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

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

      <main className="min-h-screen bg-[#f7f2ee] pb-24 pt-4 sm:pt-6 md:pb-14 md:pt-10">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 text-center sm:mb-10">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#BFA996] sm:text-xs">
                SAVED STYLES
              </p>

              <h1 className="heading-font mt-2 text-[2.2rem] leading-tight text-[#5B3B32] sm:text-5xl">
                My Wishlist
              </h1>

              <p className="mt-3 text-sm text-[#8b746b] sm:text-base">
                {wishlistItems.length} favourite outfit(s) saved
              </p>
            </div>

            {wishlistItems.length===0 ? (
              <div className="rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] px-5 py-12 text-center shadow-sm sm:rounded-3xl sm:p-12">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FDEAE6]">
                  <FiHeart className="text-[#9A3F4D]" size={34}/>
                </div>

                <h2 className="heading-font text-3xl text-[#5B3B32]">
                  Your wishlist is empty
                </h2>

                <p className="mx-auto mt-3 max-w-md text-[#8b746b]">
                  Save your favourite outfits and they'll appear here.
                </p>

                <Link to="/products">
                  <button className="mt-7 min-h-12 rounded-xl bg-[#9A3F4D] px-8 font-bold text-white transition hover:bg-[#7d3140] active:scale-[0.98]">
                    Explore Collection
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-7">
                {wishlistItems.map((item)=>(
                  <div key={item.id} className="min-w-0">
                    <ProductCard item={item}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>

      <Footer/>
    </>
  );
}

export default Wishlist;