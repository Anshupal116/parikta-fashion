import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

import suitsImg from "../assets/categories/suits.png";
import sareeImg from "../assets/categories/saree.png";
import kurtiImg from "../assets/categories/kurti.png";
import lehengaImg from "../assets/categories/lehenga.png";
import heroDress from "../assets/hero-dress.png";

const looks = [
  {
    title: "Wedding Grace",
    category: "Bridal & Festive",
    image: lehengaImg,
    link: "/products",
  },
  {
    title: "Elegant Saree Mood",
    category: "Timeless Drapes",
    image: sareeImg,
    link: "/products",
  },
  {
    title: "Modern Suit Story",
    category: "Ethnic Comfort",
    image: suitsImg,
    link: "/products",
  },
  {
    title: "Daily Luxe",
    category: "Kurti Sets",
    image: kurtiImg,
    link: "/products",
  },
  {
    title: "Custom Made",
    category: "Designed For You",
    image: heroDress,
    link: "/customize",
  },
];

function Lookbook() {
  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen">
        <section className="bg-[#fffaf7] border-b border-[#eadbd4] py-14 md:py-20">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.32em] uppercase text-[#BFA996] font-semibold">
                Parikta Lookbook
              </p>

              <h1 className="heading-font text-5xl md:text-7xl text-[#5B3B32] mt-4">
                Style Stories
              </h1>

              <p className="text-[#6d554d] leading-8 mt-5">
                Explore premium outfit moods for weddings, festive events,
                parties and custom-made moments.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-10 md:py-16">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
              {looks.map((look, index) => (
                <Link
                  to={look.link}
                  key={look.title}
                  className={`relative rounded-3xl overflow-hidden group ${
                    index === 0 ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="h-[360px] md:h-[460px]">
                    <img
                      src={look.image}
                      alt={look.title}
                      className="w-full h-full object-cover group-hover:scale-105 duration-700"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#2f241f]/75 via-[#2f241f]/20 to-transparent"></div>

                  <div className="absolute left-6 bottom-6 text-white">
                    <p className="text-xs tracking-[0.25em] uppercase text-[#eadbd4]">
                      {look.category}
                    </p>

                    <h2 className="heading-font text-4xl md:text-5xl mt-2">
                      {look.title}
                    </h2>

                    <p className="text-xs tracking-[0.2em] uppercase mt-5 font-semibold">
                      Explore Look →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#fffaf7] border-y border-[#eadbd4] py-12">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996] font-semibold">
                Custom Styling
              </p>

              <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-3">
                Want Your Own Look?
              </h2>

              <p className="text-[#6d554d] leading-8 mt-4">
                Share your reference image and measurements. We will help you
                create your dream outfit.
              </p>

              <Link to="/customize">
                <button className="mt-7 bg-[#9A3F4D] text-white px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold">
                  Start Custom Design
                </button>
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Lookbook;