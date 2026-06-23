import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

import designerImg from "../assets/categories/saree.png";
import craftImg from "../assets/categories/lehenga.png";

function About() {
  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen">
        <section className="bg-[#fffaf7] border-b border-[#eadbd4] py-14 md:py-20">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.32em] uppercase text-[#BFA996] font-semibold">
                About Parikta
              </p>

              <h1 className="heading-font text-5xl md:text-7xl text-[#5B3B32] mt-4">
                Fashion Crafted With Heart
              </h1>

              <p className="text-[#6d554d] leading-8 mt-5">
                Parikta Fashion is built for women who love elegance, comfort
                and individuality. Every outfit is designed to feel premium,
                personal and timeless.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="h-80 md:h-[520px] rounded-3xl overflow-hidden border border-[#eadbd4]">
                <img
                  src={designerImg}
                  alt="Parikta Designer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8 md:p-12">
                <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996] font-semibold">
                  Our Story
                </p>

                <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-3">
                  Designed For Every Mood
                </h2>

                <p className="text-[#6d554d] leading-8 mt-5">
                  From festive occasions to special celebrations, Parikta
                  Fashion brings together traditional charm and modern design.
                  Our ready-made and custom outfits are created with a focus on
                  fit, fabric and finishing.
                </p>

                <p className="text-[#6d554d] leading-8 mt-4">
                  Whether you choose from our collection or customize your own
                  outfit, our goal is simple: make you feel confident,
                  graceful and beautifully you.
                </p>

                <Link to="/customize">
                  <button className="mt-7 bg-[#9A3F4D] text-white px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold">
                    Start Custom Design
                  </button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#fffaf7] py-12 md:py-16 border-y border-[#eadbd4]">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
              {[
                ["500+", "Happy Clients"],
                ["100+", "Custom Designs"],
                ["4.9/5", "Client Rating"],
                ["Premium", "Fabric Quality"],
              ].map(([number, label]) => (
                <div key={label} className="bg-[#f7f2ee] rounded-2xl p-6">
                  <h3 className="heading-font text-4xl text-[#9A3F4D]">
                    {number}
                  </h3>
                  <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8 md:p-12 order-2 lg:order-1">
                <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996] font-semibold">
                  Our Craft
                </p>

                <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-3">
                  Details That Define Luxury
                </h2>

                <div className="grid gap-5 mt-7">
                  {[
                    "Carefully selected premium fabrics",
                    "Elegant embroidery and finishing",
                    "Comfortable fitting for everyday elegance",
                    "Custom designs for your unique occasion",
                  ].map((item) => (
                    <div key={item} className="flex gap-4">
                      <span className="text-[#9A3F4D]">♡</span>
                      <p className="text-[#6d554d]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-80 md:h-[520px] rounded-3xl overflow-hidden border border-[#eadbd4] order-1 lg:order-2">
                <img
                  src={craftImg}
                  alt="Parikta Craft"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default About;