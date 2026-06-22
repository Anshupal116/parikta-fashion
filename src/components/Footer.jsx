function Footer() {
  return (
    <footer className="bg-[#3f2d28] text-white py-14 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div>
          <h2 className="logo-font text-5xl text-[#E8D7CC]">Parikta</h2>
          <p className="tracking-[0.35em] text-xs text-[#BFA996] mt-1">
            FASHION
          </p>
          <p className="mt-5 text-[#d8c6bc]">
            Premium designer wear and custom made outfits crafted with love.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-[#E8D7CC]">Shop</h3>
          <ul className="space-y-2 text-[#d8c6bc]">
            <li>Suits</li>
            <li>Sarees</li>
            <li>Lehengas</li>
            <li>Kurti Sets</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-[#E8D7CC]">Company</h3>
          <ul className="space-y-2 text-[#d8c6bc]">
            <li>About Us</li>
            <li>Customize</li>
            <li>Privacy Policy</li>
            <li>Return Policy</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-[#E8D7CC]">Contact</h3>
          <p className="text-[#d8c6bc]">support@pariktafashion.com</p>
          <p className="text-[#d8c6bc] mt-2">+91 9876543210</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#6d554d] mt-10 pt-6 text-center text-[#bfa996]">
        © 2026 Parikta Fashion. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;