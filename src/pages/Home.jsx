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

const banners = [
  {
    title: "Festive Edit",
    text: "Elegant ethnic wear for every special moment.",
    image: heroDress,
    link: "/products",
  },
  {
    title: "Custom Made",
    text: "Design your dream outfit with Parikta.",
    image: sareeImg,
    link: "/customize",
  },
];

const categories = [
  { name: "Suits", image: suitsImg },
  { name: "Sarees", image: sareeImg },
  { name: "Kurtis", image: kurtiImg },
  { name: "Lehengas", image: lehengaImg },
];

const reviews = [
  {
    name: "Ananya Sharma",
    text: "Beautiful finishing and premium fabric. The outfit looked exactly like a designer piece.",
  },
  {
    name: "Megha Verma",
    text: "Custom fitting was perfect. Packaging and overall experience felt very premium.",
  },
  {
    name: "Ritika Jain",
    text: "Loved the collection. Clean designs, rich colors and very elegant look.",
  },
];

function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="bg-[#f7f2ee]">
        <div className="relative h-[430px] md:h-[620px] overflow-hidden">
          <img
            src={heroDress}
            alt="Parikta Fashion"
            className="w-full h-full object-cover object-top"
          />

          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#2f241f]/65 via-[#2f241f]/20 to-transparent"></div>

          <div className="absolute inset-0 flex items-end md:items-center">
            <Container>
              <div className="max-w-xl pb-10 md:pb-0 text-white">
                <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#eadbd4]">
                  Parikta Fashion
                </p>

                <h1 className="heading-font text-4xl md:text-7xl mt-3 leading-tight">
                  Timeless Elegance
                </h1>

                <p className="text-sm md:text-lg leading-7 mt-4 max-w-md text-[#fffaf7]">
                  Premium women designer wear, custom outfits and elegant
                  festive fashion made with love.
                </p>

                <div className="flex gap-3 mt-7">
                  <Link to="/products">
                    <button className="bg-[#9A3F4D] text-white px-6 md:px-9 py-3 text-xs tracking-[0.2em] uppercase font-semibold">
                      Shop Now
                    </button>
                  </Link>

                  <Link to="/customize">
                    <button className="bg-white/90 text-[#9A3F4D] px-6 md:px-9 py-3 text-xs tracking-[0.2em] uppercase font-semibold">
                      Customize
                    </button>
                  </Link>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </section>

      {/* SERVICE STRIP */}
      <section className="bg-[#fffaf7] border-b border-[#eadbd4] py-4">
        <Container>
          <div className="grid grid-cols-3 gap-3 text-center">
            {["Free Shipping", "Custom Stitching", "Premium Fabric"].map(
              (item) => (
                <div key={item}>
                  <div className="text-[#9A3F4D] text-lg">♡</div>
                  <p className="text-[10px] md:text-xs tracking-[0.18em] uppercase text-[#5B3B32]">
                    {item}
                  </p>
                </div>
              )
            )}
          </div>
        </Container>
      </section>

      {/* BANNER CARDS */}
      <section className="bg-[#f7f2ee] py-8 md:py-12">
        <Container>
          <div className="grid md:grid-cols-2 gap-5">
            {banners.map((banner) => (
              <Link
                to={banner.link}
                key={banner.title}
                className="relative h-56 md:h-80 rounded-2xl overflow-hidden group"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-[#2f241f]/40"></div>

                <div className="absolute left-6 bottom-6 text-white">
                  <p className="text-xs tracking-[0.22em] uppercase text-[#eadbd4]">
                    New Season
                  </p>
                  <h2 className="heading-font text-4xl mt-1">
                    {banner.title}
                  </h2>
                  <p className="text-sm mt-2 max-w-xs">{banner.text}</p>
                  <p className="text-xs tracking-[0.2em] uppercase mt-4">
                    Explore →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CATEGORY */}
      <section className="bg-[#fffaf7] py-10 md:py-14">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-sm tracking-[0.28em] uppercase text-[#5B3B32] font-semibold">
              Shop By Category
            </h2>
            <div className="text-[#BFA996] mt-2">⌁</div>
          </div>

          <div className="grid grid-cols-4 gap-3 md:gap-6">
            {categories.map((item) => (
              <Link to="/products" key={item.name} className="text-center">
                <div className="aspect-square rounded-full overflow-hidden border border-[#eadbd4] bg-[#f7f2ee]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[11px] md:text-sm mt-3 text-[#5B3B32] font-semibold">
                  {item.name}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* PIECES WE LOVE */}
      <section className="bg-[#f7f2ee] py-10 md:py-14">
        <Container>
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                Curated
              </p>
              <h2 className="heading-font text-3xl md:text-5xl text-[#5B3B32]">
                Pieces We Love
              </h2>
            </div>

            <Link
              to="/products"
              className="text-xs tracking-[0.2em] uppercase text-[#9A3F4D] font-bold"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">
            {products.slice(0, 4).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </Container>
      </section>

      {/* DESIGNER STORY */}
      <section className="bg-[#fffaf7] py-10 md:py-16">
        <Container>
          <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-[#eadbd4] bg-[#f7f2ee]">
            <div className="h-72 md:h-[440px]">
              <img
                src={sareeImg}
                alt="Designer Story"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-7 md:p-12 flex items-center">
              <div>
                <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996] font-semibold">
                  Behind The Design
                </p>

                <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-3">
                  Crafted With Detail
                </h2>

                <p className="text-[#6d554d] leading-8 text-sm md:text-base mt-5">
                  At Parikta Fashion, every outfit is designed with a balance of
                  elegance, comfort and individuality. From fabric selection to
                  finishing, each piece is created to feel premium and personal.
                </p>

                <Link to="/customize">
                  <button className="mt-7 bg-[#9A3F4D] text-white px-7 py-3 text-xs tracking-[0.2em] uppercase font-semibold">
                    Start Custom Design
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="bg-[#f7f2ee] py-10 md:py-14">
        <Container>
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
              Trending
            </p>
            <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32]">
              Trending Products
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">
            {products.slice(0, 4).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </Container>
      </section>

      {/* REVIEWS */}
      <section className="bg-[#fffaf7] py-10 md:py-14">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-sm tracking-[0.28em] uppercase text-[#5B3B32] font-semibold">
              Happy Clients
            </h2>
            <div className="text-[#BFA996] mt-2">⌁</div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="bg-[#f7f2ee] border border-[#eadbd4] rounded-2xl p-6"
              >
                <p className="text-[#BFA996]">★★★★★</p>
                <p className="text-[#6d554d] text-sm leading-7 mt-4">
                  “{review.text}”
                </p>
                <h3 className="font-bold text-[#5B3B32] mt-5">
                  — {review.name}
                </h3>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-[#9A3F4D] py-10 text-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="heading-font text-4xl">Join Parikta Circle</h2>
            <p className="text-sm mt-3 text-[#fffaf7]">
              Get updates on new collections, custom offers and styling tips.
            </p>

            <div className="flex mt-6 bg-white rounded-full overflow-hidden p-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 text-[#5B3B32] outline-none text-sm"
              />
              <button className="bg-[#5B3B32] px-6 py-3 rounded-full text-xs tracking-[0.2em] uppercase">
                Subscribe
              </button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}

export default Home;