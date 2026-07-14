import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import SEO from "../components/SEO";


import heroDress from "../assets/hero-dress.png";
import suitsImg from "../assets/categories/suits.png";
import sareeImg from "../assets/categories/saree.png";
import kurtiImg from "../assets/categories/kurti.png";
import lehengaImg from "../assets/categories/lehenga.png";
import { useRecentlyViewed } from "../context/RecentlyViewedContext"; 


import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

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
  const { recentlyViewed } = useRecentlyViewed();

  const [products, setProducts] = useState([]);
const [loadingProducts, setLoadingProducts] = useState(true);

useEffect(() => {
  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  loadProducts();
}, []);

  return (
    <>
    <SEO
    title="Parikta Fashion | Premium Women's Ethnic Wear Online"
    description="Discover premium suits, kurtis, sarees, dresses and designer ethnic wear for women at Parikta Fashion. Shop elegant styles online."
    canonical="https://www.parikta.com/"
    image="https://www.parikta.com/og-image.jpg"
  />

      <Navbar />

      {/* CINEMATIC HERO */}
<section className="relative bg-[#14100e] overflow-hidden">
  <div className="relative h-[560px] md:h-[720px]">
    <img
      src={heroDress}
      alt="Parikta Fashion"
      className="absolute inset-0 w-full h-full object-cover object-top scale-105"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-[#14100e] via-[#14100e]/35 to-transparent"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-[#14100e]/70 via-transparent to-[#14100e]/20"></div>

    <Container>
      <div className="relative z-10 h-[560px] md:h-[720px] flex items-end md:items-center pb-12 md:pb-0">
        <div className="max-w-xl text-white">
          <p className="text-[11px] md:text-xs tracking-[0.38em] uppercase text-[#e8d7cc]">
            Premium Women Designer Wear
          </p>

          <h1 className="heading-font text-5xl md:text-7xl lg:text-8xl leading-none mt-4">
            Elegance
          </h1>

          <h2 className="logo-font text-6xl md:text-8xl text-[#E2B7B1] -mt-1">
            in Every Thread
          </h2>

          <p className="text-sm md:text-base leading-7 text-[#fffaf7] mt-5 max-w-md">
            Discover timeless ethnic, western and custom outfits crafted with
            premium fabrics, delicate details and a luxury finish.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <Link to="/products">
              <button className="bg-[#9A3F4D] text-white px-7 py-3 text-xs tracking-[0.2em] uppercase font-semibold">
                Shop Collection
              </button>
            </Link>

            <Link to="/customize">
              <button className="bg-white/90 text-[#9A3F4D] px-7 py-3 text-xs tracking-[0.2em] uppercase font-semibold">
                Custom Design
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-md">
            {["Premium Fabric", "Custom Fit", "Designer Finish"].map((item) => (
              <div
                key={item}
                className="border border-white/25 bg-white/10 backdrop-blur-sm px-3 py-3 text-center"
              >
                <p className="text-[10px] tracking-[0.18em] uppercase">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  </div>
</section>

{/* FEATURED COLLECTION SLIDER */}
<section className="bg-[#fffaf7] py-12 md:py-16 border-b border-[#eadbd4]">
  <Container>
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[#BFA996]">
          New Season Edit
        </p>

        <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-2">
          Featured Collections
        </h2>
      </div>

      <Link
        to="/products"
        className="hidden md:block text-xs tracking-[0.2em] uppercase text-[#9A3F4D] font-bold"
      >
        View All
      </Link>
    </div>

    <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
      {[
        {
          title: "Royal Wedding",
          text: "Handcrafted elegance for special occasions.",
          image: lehengaImg,
          link: "/products",
        },
        {
          title: "Festive Grace",
          text: "Rich colors, soft fabrics and timeless details.",
          image: sareeImg,
          link: "/products",
        },
        {
          title: "Modern Ethnic",
          text: "Everyday comfort with designer finish.",
          image: suitsImg,
          link: "/products",
        },
        {
          title: "Custom Couture",
          text: "Create your dream outfit with Parikta.",
          image: heroDress,
          link: "/customize",
        },
      ].map((item) => (
        <Link
          to={item.link}
          key={item.title}
          className="min-w-[82%] sm:min-w-[48%] lg:min-w-[32%] snap-start relative h-[360px] md:h-[460px] rounded-3xl overflow-hidden group"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#2f241f]/80 via-[#2f241f]/20 to-transparent"></div>

          <div className="absolute left-6 right-6 bottom-6 text-white">
            <p className="text-xs tracking-[0.24em] uppercase text-[#eadbd4]">
              Parikta Edit
            </p>

            <h3 className="heading-font text-4xl mt-2">
              {item.title}
            </h3>

            <p className="text-sm leading-6 mt-3 text-[#fffaf7]">
              {item.text}
            </p>

            <p className="mt-5 text-xs tracking-[0.2em] uppercase font-bold">
              Explore →
            </p>
          </div>
        </Link>
      ))}
    </div>
  </Container>
</section>

{/* PARIKTA STATS */}
<section className="bg-[#f7f2ee] py-12 md:py-16">
  <Container>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {[
        ["500+", "Happy Clients"],
        ["100+", "Custom Designs"],
        ["4.9★", "Average Rating"],
        ["50+", "New Arrivals"],
      ].map(([number, label]) => (
        <div
          key={label}
          className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6 text-center"
        >
          <h3 className="heading-font text-4xl md:text-5xl text-[#9A3F4D]">
            {number}
          </h3>

          <p className="mt-3 text-xs tracking-[0.18em] uppercase text-[#5B3B32]">
            {label}
          </p>
        </div>
      ))}
    </div>
  </Container>
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
  {loadingProducts ? (
    <p className="text-center text-[#8b746b] col-span-full">
      Loading products...
    </p>
  ) : (
    products.slice(0, 4).map((item) => (
      <ProductCard key={item._id} item={item} />
    ))
  )}
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
  {loadingProducts ? (
    <p className="text-center text-[#8b746b] col-span-full">
      Loading products...
    </p>
  ) : (
    products.slice(0, 4).map((item) => (
      <ProductCard key={item._id} item={item} />
    ))
  )}
</div>
        </Container>
      </section>
{recentlyViewed.length > 0 && (
  <section className="bg-[#fffaf7] py-10 md:py-14 border-t border-[#eadbd4]">
    <Container>
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
            Recently Viewed
          </p>

          <h2 className="heading-font text-3xl md:text-5xl text-[#5B3B32]">
            Continue Your Style Journey
          </h2>
        </div>

        <Link
          to="/products"
          className="text-xs tracking-[0.18em] uppercase text-[#9A3F4D] font-bold"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">
  {loadingProducts ? (
    <p className="text-center text-[#8b746b] col-span-full">
      Loading products...
    </p>
  ) : (
    products.slice(0, 4).map((item) => (
      <ProductCard key={item._id} item={item} />
    ))
  )}
</div>
    </Container>
  </section>
)}
  
      {/* CLIENT LOVE */}
<section className="bg-[#f7f2ee] py-12 md:py-16">
  <Container>
    <div className="text-center mb-10">
      <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
        Client Love
      </p>

      <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-2">
        Loved By Our Clients
      </h2>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {[
        {
          name: "Ananya Sharma",
          image: sareeImg,
          review:
            "The fitting was absolutely perfect. It felt like a designer outfit made exclusively for me.",
        },
        {
          name: "Megha Verma",
          image: lehengaImg,
          review:
            "Premium fabric, elegant detailing and beautiful finishing. Highly recommended.",
        },
        {
          name: "Ritika Jain",
          image: suitsImg,
          review:
            "Parikta made my festive look unforgettable. The craftsmanship is amazing.",
        },
      ].map((item) => (
        <div
          key={item.name}
          className="bg-[#fffaf7] rounded-3xl overflow-hidden border border-[#eadbd4]"
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-72 object-cover"
          />

          <div className="p-6">
            <div className="text-[#C9A227] text-lg">
              ★★★★★
            </div>

            <p className="text-[#6d554d] text-sm leading-7 mt-4">
              "{item.review}"
            </p>

            <h3 className="mt-5 font-bold text-[#5B3B32]">
              — {item.name}
            </h3>
          </div>
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
           {/* INSTAGRAM GALLERY */}
<section className="bg-[#fffaf7] py-12 md:py-16">
  <Container>
    <div className="text-center mb-8">
      <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
        Follow Our Journey
      </p>

      <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-2">
        @PariktaFashion
      </h2>

      <p className="text-[#8b746b] text-sm mt-3">
        Daily styles, custom designs and behind-the-scenes moments.
      </p>
    </div>

    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
      {[suitsImg, sareeImg, kurtiImg, lehengaImg, heroDress, sareeImg].map(
        (img, index) => (
          <a
            key={index}
            href="https://instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="relative aspect-square overflow-hidden rounded-xl group"
          >
            <img
              src={img}
              alt="Parikta Instagram"
              className="w-full h-full object-cover group-hover:scale-110 duration-500"
            />

            <div className="absolute inset-0 bg-[#5B3B32]/0 group-hover:bg-[#5B3B32]/45 duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-xs tracking-[0.18em] uppercase">
                View
              </span>
            </div>
          </a>
        )
      )}
    </div>

    <div className="text-center mt-8">
      <a href="https://instagram.com/" target="_blank" rel="noreferrer">
        <button className="border border-[#9A3F4D] text-[#9A3F4D] px-8 py-3 text-xs tracking-[0.18em] uppercase font-semibold">
          Follow On Instagram
        </button>
      </a>
    </div>
  </Container>
</section>
<section className="py-14 md:py-20 bg-[#5B3B32] text-white">
  <Container>
    <div className="max-w-4xl mx-auto text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-[#E8D7CC]">
        Custom Couture
      </p>

      <h2 className="heading-font text-4xl md:text-6xl mt-4">
        Ready To Create Your Dream Outfit?
      </h2>

      <p className="text-[#E8D7CC] mt-5 leading-7">
        Share your inspiration, measurements and ideas.
        Our team will craft a unique outfit made just for you.
      </p>

      <Link to="/customize">
        <button className="mt-8 bg-[#9A3F4D] px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold">
          Start Custom Design
        </button>
      </Link>
    </div>
  </Container>
</section>
      <Footer />
    </>
  );
}

export default Home;