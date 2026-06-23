import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

function Contact() {
  const phoneNumber = "919711111111";
  const whatsappMessage =
    "Hi Parikta Fashion, I want to know more about your collection.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen">
        <section className="bg-[#fffaf7] border-b border-[#eadbd4] py-14 md:py-20">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.32em] uppercase text-[#BFA996] font-semibold">
                Contact Parikta
              </p>

              <h1 className="heading-font text-5xl md:text-7xl text-[#5B3B32] mt-4">
                We’d Love To Hear From You
              </h1>

              <p className="text-[#6d554d] leading-8 mt-5">
                For orders, custom designs, size help or styling consultation,
                connect with Parikta Fashion.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="grid lg:grid-cols-[40%_60%] gap-8">
              <div className="space-y-5">
                {[
                  ["WhatsApp", "+91 9711111111", whatsappUrl],
                  ["Email", "support@pariktafashion.com", "mailto:support@pariktafashion.com"],
                  ["Instagram", "@pariktafashion", "https://instagram.com/"],
                ].map(([title, value, link]) => (
                  <a
                    key={title}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6 hover:shadow-md duration-300"
                  >
                    <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996] font-semibold">
                      {title}
                    </p>
                    <h3 className="heading-font text-3xl text-[#5B3B32] mt-2">
                      {value}
                    </h3>
                  </a>
                ))}

                <div className="bg-[#FDEAE6] border border-[#eadbd4] rounded-3xl p-6">
                  <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996] font-semibold">
                    Consultation
                  </p>
                  <h3 className="heading-font text-3xl text-[#5B3B32] mt-2">
                    Custom Design Help
                  </h3>
                  <p className="text-[#6d554d] leading-7 mt-3">
                    Share your reference design and measurements. Our team will
                    help you create your dream outfit.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Message sent successfully ✅");
                }}
                className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-7 md:p-10"
              >
                <p className="text-xs tracking-[0.25em] uppercase text-[#BFA996] font-semibold">
                  Send Message
                </p>

                <h2 className="heading-font text-4xl text-[#5B3B32] mt-2 mb-7">
                  Contact Form
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                  <input
                    placeholder="Your Name"
                    required
                    className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
                  />

                  <input
                    placeholder="Phone Number"
                    required
                    className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D]"
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] md:col-span-2"
                  />

                  <textarea
                    rows="6"
                    placeholder="Write your message..."
                    required
                    className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] md:col-span-2"
                  />
                </div>

                <button className="mt-6 bg-[#9A3F4D] text-white px-8 py-4 rounded-xl text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#7d3140]">
                  Send Message
                </button>
              </form>
            </div>
          </Container>
        </section>

        <section className="bg-[#fffaf7] py-12 border-y border-[#eadbd4]">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
              {[
                ["10 AM - 7 PM", "Support Hours"],
                ["24-48 Hrs", "Custom Reply"],
                ["COD", "Available"],
                ["Premium", "Quality"],
              ].map(([title, label]) => (
                <div key={label} className="bg-[#f7f2ee] rounded-2xl p-6">
                  <h3 className="heading-font text-3xl text-[#9A3F4D]">
                    {title}
                  </h3>
                  <p className="text-xs tracking-[0.18em] uppercase text-[#5B3B32] mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Contact;