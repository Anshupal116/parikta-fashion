function AnnouncementBar() {
  const messages = [
    "Free Shipping On Orders Above ₹999",
    "Custom Stitching Available",
    "Premium Designer Collection",
    "New Arrivals Live Now",
    "COD Available On Selected Orders",
  ];

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#9A3F4D] text-white">
      <div className="flex w-max min-w-full whitespace-nowrap animate-marquee py-2 text-[10px] sm:text-[11px] md:text-sm tracking-[0.16em] sm:tracking-[0.22em] uppercase">
        {[...messages, ...messages].map((msg, index) => (
          <span key={`${msg}-${index}`} className="shrink-0 mx-5 sm:mx-8">
            ✦ {msg}
          </span>
        ))}
      </div>
    </div>
  );
}

export default AnnouncementBar;
