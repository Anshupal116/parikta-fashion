import { Link } from "react-router-dom";
import { FiInstagram, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#2f241f] text-white">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <h2 className="logo-font text-6xl text-[#E8D7CC] leading-none">
                Parikta
              </h2>
              <p className="tracking-[0.45em] text-[10px] text-[#BFA996] font-semibold mt-1">
                FASHION
              </p>
            </Link>

            <p className="text-[#cdbbb1] mt-5 text-sm leading-7">
              Premium women designer wear and custom outfits crafted with
              timeless elegance, comfort and luxury finish.
            </p>

            <div className="flex gap-3 mt-5">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#9A3F4D]"
              >
                <FiInstagram />
              </a>

              <a
                href="https://wa.me/919711111111"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366]"
              >
                <FaWhatsapp />
              </a>

              <a
                href="mailto:support@pariktafashion.com"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#9A3F4D]"
              >
                <FiMail />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[#E8D7CC] font-bold text-sm tracking-[0.2em] uppercase mb-4">
              Shop
            </h3>
            <ul className="space-y-3 text-[#cdbbb1] text-sm">
              <li><Link to="/products">New Arrivals</Link></li>
              <li><Link to="/products">Suits</Link></li>
              <li><Link to="/products">Sarees</Link></li>
              <li><Link to="/products">Lehengas</Link></li>
              <li><Link to="/products">Kurti Sets</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#E8D7CC] font-bold text-sm tracking-[0.2em] uppercase mb-4">
              Brand
            </h3>
            <ul className="space-y-3 text-[#cdbbb1] text-sm">
              <li><Link to="/about">About Parikta</Link></li>
              <li><Link to="/lookbook">Lookbook</Link></li>
              <li><Link to="/customize">Custom Design</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#E8D7CC] font-bold text-sm tracking-[0.2em] uppercase mb-4">
              Customer Care
            </h3>
            <ul className="space-y-3 text-[#cdbbb1] text-sm">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Shipping Info</Link></li>
              <li><Link to="/contact">Return Policy</Link></li>
              <li><Link to="/contact">Size Guide</Link></li>
              <li><Link to="/contact">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#E8D7CC] font-bold text-sm tracking-[0.2em] uppercase mb-4">
              Contact
            </h3>

            <div className="space-y-4 text-[#cdbbb1] text-sm">
              <p className="flex gap-3">
                <FiPhone className="mt-1 shrink-0" />
                +91 9711111111
              </p>

              <p className="flex gap-3 break-all">
                <FiMail className="mt-1 shrink-0" />
                support@pariktafashion.com
              </p>

              <p className="flex gap-3">
                <FiMapPin className="mt-1 shrink-0" />
                India
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row gap-3 items-center justify-between text-[#BFA996] text-xs">
          <p>© 2026 Parikta Fashion. All Rights Reserved.</p>

          <div className="flex gap-5">
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;