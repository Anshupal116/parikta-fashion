import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#3f2d28] text-white py-10 md:py-14 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4 md:gap-10">
        <div>
          <h2 className="logo-font text-4xl md:text-5xl text-[#E8D7CC]">
            Parikta
          </h2>
          <p className="tracking-[0.25em] md:tracking-[0.35em] text-[9px] md:text-xs text-[#BFA996] mt-1">
            FASHION
          </p>
          <p className="mt-4 text-[#d8c6bc] text-[10px] md:text-base leading-5 md:leading-7">
            Premium designer wear and custom made outfits.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-3 md:mb-4 text-[#E8D7CC] text-xs md:text-base">
            Shop
          </h3>
          <ul className="space-y-2 text-[#d8c6bc] text-[10px] md:text-base">
            <li>Suits</li>
            <li>Sarees</li>
            <li>Lehengas</li>
            <li>Kurti Sets</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3 md:mb-4 text-[#E8D7CC] text-xs md:text-base">
            Company
          </h3>
          <ul className="space-y-2 text-[#d8c6bc] text-[10px] md:text-base">
            <li>About</li>
            <li>Customize</li>
            <li>Privacy</li>
            <li>Returns</li>
            <Link to="/faq">FAQ</Link>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3 md:mb-4 text-[#E8D7CC] text-xs md:text-base">
            Contact
          </h3>
          <p className="text-[#d8c6bc] text-[10px] md:text-base break-words">
            support@pariktafashion.com
          </p>
          <p className="text-[#d8c6bc] mt-2 text-[10px] md:text-base">
            +91 9876543210
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#6d554d] mt-8 md:mt-10 pt-5 md:pt-6 text-center text-[#bfa996] text-[10px] md:text-sm">
        © 2026 Parikta Fashion. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;