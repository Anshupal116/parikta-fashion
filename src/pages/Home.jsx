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

const collections = [
  { title: "Ethnic", subtitle: "Collection", image: suitsImg },
  { title: "Western", subtitle: "Collection", image: kurtiImg },
  { title: "Fusion", subtitle: "Collection", image: lehengaImg },
  { title: "Custom", subtitle: "Designs", image: sareeImg },
];

const whyChoose = [
  {
    icon: "❧",
    title: "Exclusive Designs",
    text: "Unique, limited edition pieces crafted just for you.",
  },
  {
    icon: "🧶",
    title: "Premium Fabrics",
    text: "Finest quality fabrics for luxurious comfort.",
  },
  {
    icon: "✂",
    title: "Handcrafted",
    text: "Expert craftsmanship with love and precision.",
  },
  {
    icon: "♢",
    title: "Secure & Trusted",
    text: "Safe payments, easy returns and dedicated support.",
  },
];

const storyCards = [
  {
    title: "Your Dream Outfit",
    tag: "Custom Design",
    text: "Bring your vision to life with our custom design service.",
    button: "Start Designing",
    link: "/customize",
  },
  {
    title: "Made for Special Moments",
    tag: "Wedding Collection",
    text: "Explore our exclusive wedding outfits.",
    button: "Explore Now",
    link: "/products",
  },
  {
    title: "Tips & Inspiration",
    tag: "Style Guide",
    text: "Explore fashion tips, trends and style inspiration.",
    button: "Read More",
    link: "/products",
  },
];

function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="bg-[#f7f2ee]">
        <div className="grid lg:grid-cols-2">
          <div className="order-2 lg:order-1 flex items-center px-6 md:px-14 lg:px-20 py-12 lg:py-20">
            <div className="max-w-xl text-center lg:text-left">
              <h1 className="heading-font text-4xl md:text-6xl lg:text-7xl text-[#2f241f] leading-tight">
                Timeless Elegance,
              </h1>

              <h2 className="logo-font text-5xl md:text-7xl text-[#9A3F4D] mt-1">
                Made for You
              </h2>

              <div className="w-28 h-px bg-[#BFA996] my-6 mx-auto lg:mx-0"></div>

              <p className="text-[#5B3B32] text-sm md:text-base leading-7 max-w-md mx-auto lg:mx-0">
                From traditional grace to modern charm, each outfit is crafted
                to make you feel beautiful, every single day.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <Link to="/products">
                  <button className="bg-[#9A3F4D] text-white px-7 py-3 text-xs tracking-[0.18em] uppercase font-semibold">
                    Shop Collection
                  </button>
                </Link>

                <Link to="/customize">
                  <button className="border border-[#9A3F4D] text-[#9A3F4D] px-7 py-3 text-xs tracking-[0.18em] uppercase font-semibold">
                    Custom Designs
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-10 max-w-md mx-auto lg:mx-0">
                {["Premium Quality", "Custom Designs", "Secure Payments"].map(
                  (item) => (
                    <div key={item} className="text-center">
                      <div className="w-11 h-11 rounded-full border border-[#BFA996] mx-auto flex items-center justify-center text-[#9A3F4D]">
                        ♡
                      </div>
                      <p className="text-[10px] mt-2 uppercase tracking-wider text-[#5B3B32]">
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 h-[360px] md:h-[520px] lg:h-[640px] overflow-hidden">
            <img
              src={heroDress}
              alt="Parikta Fashion"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="bg-[#fffaf7] py-12 md:py-16">
        <Container>
          <div className="text-center mb-9">
            <h2 className="tracking-[0.24em] text-sm text-[#5B3B32] uppercase font-semibold">
              Explore Our Collections
            </h2>
            <div className="text-[#BFA996] mt-2">⌁</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {collections.map((item) => (
              <Link
                to={item.title === "Custom" ? "/customize" : "/products"}
                key={item.title}
                className="relative h-52 md:h-60 rounded-xl overflow-hidden group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-[#5B3B32]/35"></div>

                <div className="absolute left-6 bottom-6 text-white">
                  <h3 className="heading-font text-3xl tracking-[0.12em]">
                    {item.title}
                  </h3>
                  <p className="tracking-[0.22em] text-xs uppercase">
                    {item.subtitle}
                  </p>
                  <p className="mt-4 text-xs tracking-[0.18em] uppercase font-semibold">
                    Explore →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* DESIGNER PARTITION */}
      <section className="bg-[#f7f2ee] py-12 md:py-16">
        <Container>
          <div className="bg-[#fffaf7] rounded-3xl overflow-hidden border border-[#eadbd4] grid lg:grid-cols-2">
            <div className="h-72 md:h-[430px]">
              <img
                src={sareeImg}
                alt="Designer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8 md:p-12 flex items-center relative">
              <div className="absolute right-8 bottom-8 text-[#eadbd4] text-8xl hidden md:block">
                ❦
              </div>

              <div className="relative z-10 max-w-lg">
                <p className="tracking-[0.22em] text-xs text-[#BFA996] uppercase font-semibold">
                  The Heart Behind Parikta
                </p>

                <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-4">
                  Meet The Designer
                </h2>

                <div className="w-24 h-px bg-[#BFA996] my-5"></div>

                <p className="text-[#6d554d] leading-8 text-sm md:text-base">
                  Parikta is more than a brand — it is a dream stitched with
                  passion and perfection. Every design reflects creativity,
                  attention to detail and a promise of timeless elegance.
                </p>

                <Link to="/customize">
                  <button className="mt-7 bg-[#9A3F4D] text-white px-7 py-3 text-xs tracking-[0.18em] uppercase font-semibold">
                    Know More About Custom Design
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* WHY CHOOSE */}
      <section className="bg-[#fffaf7] py-12">
        <Container>
          <div className="text-center mb-10">
            <h2 className="tracking-[0.24em] text-sm text-[#5B3B32] uppercase font-semibold">
              Why Choose Parikta?
            </h2>
            <div className="text-[#BFA996] mt-2">⌁</div>
          </div>

          <div className="bg-[#f7f2ee] rounded-3xl border border-[#eadbd4] grid grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((item) => (
              <div
                key={item.title}
                className="p-6 text-center border-[#eadbd4] lg:border-r last:border-r-0"
              >
                <div className="text-4xl text-[#9A3F4D]">{item.icon}</div>
                <h3 className="font-bold uppercase text-xs tracking-wider text-[#5B3B32] mt-4">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-[#8b746b] mt-3 leading-6">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-[#f7f2ee] py-12 md:py-16">
        <Container>
          <div className="text-center mb-10">
            <h2 className="tracking-[0.24em] text-sm text-[#5B3B32] uppercase font-semibold">
              New Arrivals
            </h2>
            <div className="text-[#BFA996] mt-2">⌁</div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.slice(0, 4).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/products">
              <button className="border border-[#9A3F4D] text-[#9A3F4D] px-8 py-3 text-xs tracking-[0.18em] uppercase font-semibold">
                View All Products
              </button>
            </Link>
          </div>
        </Container>
      </section>

      {/* DESIGN STORIES */}
      <section className="bg-[#fffaf7] py-12 md:py-16">
        <Container>
          <div className="grid md:grid-cols-3 gap-5">
            {storyCards.map((card) => (
              <Link
                to={card.link}
                key={card.title}
                className="bg-[#f7f2ee] border border-[#eadbd4] rounded-2xl p-7 min-h-56 flex flex-col justify-between hover:shadow-md duration-300"
              >
                <div>
                  <p className="tracking-[0.2em] text-[11px] text-[#BFA996] uppercase font-semibold">
                    {card.tag}
                  </p>

                  <h3 className="heading-font text-3xl text-[#5B3B32] mt-3">
                    {card.title}
                  </h3>

                  <p className="text-[#8b746b] text-sm leading-7 mt-4">
                    {card.text}
                  </p>
                </div>

                <p className="text-[#9A3F4D] text-xs tracking-[0.18em] uppercase font-bold mt-6">
                  {card.button} →
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* INSTAGRAM STYLE STRIP */}
      <section className="bg-[#f7f2ee] py-12">
        <Container>
          <div className="text-center mb-8">
            <h2 className="tracking-[0.24em] text-sm text-[#5B3B32] uppercase font-semibold">
              Follow Us @PariktaFashion
            </h2>
            <div className="text-[#BFA996] mt-2">⌁</div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[suitsImg, sareeImg, kurtiImg, lehengaImg, heroDress, suitsImg].map(
              (img, index) => (
                <div
                  key={index}
                  className="h-28 md:h-40 rounded-xl overflow-hidden"
                >
                  <img
                    src={img}
                    alt="Instagram"
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}
          </div>
        </Container>
      </section>

      <section className="bg-[#FDEAE6] py-5">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              "Made With Love",
              "Premium Quality",
              "Custom Designs",
              "Worldwide Shipping",
              "Secure Payments",
            ].map((item) => (
              <div key={item} className="text-[#5B3B32]">
                <div className="text-xl mb-1">♡</div>
                <p className="text-[10px] tracking-[0.18em] uppercase">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}

export default Home;