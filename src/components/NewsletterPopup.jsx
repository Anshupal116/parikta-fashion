import { useEffect, useState } from "react";

function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const subscribed = localStorage.getItem("parikta_newsletter");

    if (!subscribed) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    localStorage.setItem("parikta_newsletter", "closed");
    setShow(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    localStorage.setItem("parikta_newsletter", email);
    setShow(false);
    alert("Thank you for joining Parikta Circle 💌");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/55 flex items-center justify-center px-4">
      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-[28px] max-w-md w-full overflow-hidden shadow-2xl relative">
        <button
          onClick={closePopup}
          className="absolute top-4 right-5 text-3xl text-[#5B3B32] z-10"
        >
          ×
        </button>

        <div className="bg-[#FDEAE6] px-7 py-8 text-center">
          <p className="text-xs tracking-[0.32em] uppercase text-[#BFA996] font-semibold">
            Welcome To
          </p>

          <h2 className="logo-font text-6xl text-[#9A3F4D] mt-2">
            Parikta
          </h2>

          <p className="tracking-[0.42em] text-[10px] text-[#BFA996] font-semibold">
            FASHION
          </p>
        </div>

        <div className="p-7 text-center">
          <h3 className="heading-font text-3xl text-[#5B3B32]">
            Get 10% Off
          </h3>

          <p className="text-[#6d554d] text-sm leading-7 mt-3">
            Join Parikta Circle and receive exclusive collection updates,
            custom design offers and styling tips.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#eadbd4] rounded-full px-5 py-3 outline-none focus:border-[#9A3F4D] text-[#5B3B32]"
            />

            <button
              type="submit"
              className="w-full bg-[#9A3F4D] text-white py-3 rounded-full mt-4 text-xs tracking-[0.22em] uppercase font-bold hover:bg-[#7d3140]"
            >
              Get My Offer
            </button>
          </form>

          <button
            onClick={closePopup}
            className="mt-4 text-xs text-[#8b746b] underline"
          >
            No thanks, continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewsletterPopup;