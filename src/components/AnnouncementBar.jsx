function AnnouncementBar() {
  const messages = [
    "Free Shipping On Orders Above ₹999",
    "Custom Stitching Available",
    "Premium Designer Collection",
    "New Arrivals Live Now",
    "COD Available On Selected Orders",
  ];

  return (
    <div className="bg-[#9A3F4D] text-white overflow-hidden">
      <div className="whitespace-nowrap flex animate-marquee py-2 text-[11px] md:text-sm tracking-[0.22em] uppercase">
        {[...messages, ...messages].map((msg, index) => (
          <span key={index} className="mx-8">
            ✦ {msg}
          </span>
        ))}
      </div>
    </div>
  );
}

export default AnnouncementBar;