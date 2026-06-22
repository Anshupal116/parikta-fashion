import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";

import heroDress from "../assets/hero-dress.png";
import suitsImg from "../assets/categories/suits.png";
import sareeImg from "../assets/categories/saree.png";
import kurtiImg from "../assets/categories/kurti.png";
import lehengaImg from "../assets/categories/lehenga.png";

import { products } from "../data/products";

const categories = [
  { name: "Suits", image: suitsImg },
  { name: "Lehenga", image: lehengaImg },
  { name: "Sarees", image: sareeImg },
  { name: "Kurti Sets", image: kurtiImg },
];

const features = [
  { icon: "🚚", title: "Free Shipping", text: "On orders above ₹999" },
  { icon: "🏅", title: "Premium Quality", text: "Finest fabrics & work" },
  { icon: "🧵", title: "Custom Stitching", text: "Perfect fit, made for you" },
  { icon: "🔁", title: "Easy Returns", text: "Hassle-free returns" },
];

function Home() {
  return (
    <>
      <Navbar />

      <section className="bg-[#f7f2ee]">
        <div className="grid lg:grid-cols-2 min-h-[620px]">
          <div className="flex items-center px-8 lg:px-24 py-16 relative overflow-hidden">
            <div className="absolute left-0 top-10 text-[#d8c6bc] text-[220px] opacity-40">
              ❧
            </div>

            <div className="relative z-10 max-w-xl">
              <p className="tracking-[0.25em] text-[#BFA996] font-semibold text-sm mb-5">
                TIMELESS BEAUTY. EFFORTLESS YOU.
              </p>

              <h1 className="heading-font text-6xl lg:text-7xl text-[#5B3B32] leading-tight">
                Grace in Every
              </h1>

              <h2 className="logo-font text-8xl text-[#9A3F4D] -mt-2">
                Thread
              </h2>

              <p className="text-[#6d554d] text-lg mt-6 leading-8">
                Explore our exclusive collection of designer outfits crafted
                with elegance, premium fabric and perfect custom fitting.
              </p>

              <div className="flex gap-4 mt-8">
                <Link to="/products">
                  <button className="bg-[#9A3F4D] text-white px-10 py-4 font-semibold tracking-wider border-2 border-[#BFA996]">
                    SHOP NOW →
                  </button>
                </Link>

                <Link to="/customize">
                  <button className="border-2 border-[#9A3F4D] text-[#9A3F4D] px-10 py-4 font-semibold tracking-wider">
                    CUSTOM MADE
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <img
              src={heroDress}
              alt="Parikta Fashion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7f2ee]/40 to-transparent"></div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 border-b border-[#eadbd4]">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#FDEAE6] flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#5B3B32]">{item.title}</h3>
                  <p className="text-sm text-[#8b746b]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-[#fffaf7]">
        <Container>
          <div className="text-center mb-12">
            <div className="text-[#BFA996] text-2xl">♡</div>
            <h2 className="heading-font text-4xl tracking-widest text-[#5B3B32]">
              SHOP BY CATEGORY
            </h2>
            <p className="text-[#9b8378] mt-2">
              Handpicked styles for every occasion
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((item) => (
              <Link to="/products" key={item.name} className="text-center group">
                <div className="w-40 h-40 md:w-52 md:h-52 mx-auto rounded-full overflow-hidden border-4 border-[#eadbd4] p-2 bg-white group-hover:border-[#BFA996] duration-300">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 duration-500"
                  />
                </div>
                <h3 className="mt-4 font-semibold text-[#5B3B32]">
                  {item.name}
                </h3>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-[#f7f2ee]">
        <Container>
          <div className="text-center mb-12">
            <p className="text-[#BFA996] font-semibold tracking-widest">
              NEW COLLECTION
            </p>
            <h2 className="heading-font text-5xl text-[#5B3B32] mt-2">
              New Arrivals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {products.slice(0, 4).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}

export default Home;