import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

const faqs = [
  {
    question: "Custom outfit banne me kitna time lagta hai?",
    answer:
      "Usually custom outfit 7–15 working days me ready hota hai. Heavy embroidery ya bridal designs me extra time lag sakta hai.",
  },
  {
    question: "Measurements kaise dene hain?",
    answer:
      "Aap Customize page par bust, waist, hip, shoulder aur length measurements inches me submit kar sakte hain.",
  },
  {
    question: "COD available hai?",
    answer:
      "Haan, selected locations par COD available hai. Custom orders ke liye advance payment required ho sakti hai.",
  },
  {
    question: "Ready-made products return ho sakte hain?",
    answer:
      "Ready-made products eligible condition me return/exchange ho sakte hain. Custom stitched products usually returnable nahi hote.",
  },
  {
    question: "Reference image upload kar sakte hain?",
    answer:
      "Haan, aap Customize page par apni reference image upload karke design instructions de sakte hain.",
  },
  {
    question: "Delivery charges kya hain?",
    answer:
      "Prepaid orders par free shipping available hai. Kuch locations par delivery charges apply ho sakte hain.",
  },
];

function FAQ() {
  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen">
        <section className="bg-[#fffaf7] border-b border-[#eadbd4] py-14 md:py-20">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.32em] uppercase text-[#BFA996] font-semibold">
                Help Center
              </p>

              <h1 className="heading-font text-5xl md:text-7xl text-[#5B3B32] mt-4">
                Frequently Asked Questions
              </h1>

              <p className="text-[#6d554d] leading-8 mt-5">
                Custom orders, delivery, measurements aur returns ke common
                questions yahan clear kar diye gaye hain.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-[#fffaf7] border border-[#eadbd4] rounded-2xl p-5 md:p-6 group"
                >
                  <summary className="cursor-pointer flex justify-between items-center gap-4 font-bold text-[#5B3B32]">
                    <span>{faq.question}</span>
                    <span className="text-[#9A3F4D] text-2xl group-open:rotate-45 duration-300">
                      +
                    </span>
                  </summary>

                  <p className="text-[#6d554d] leading-7 mt-4 text-sm md:text-base">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default FAQ;