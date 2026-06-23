import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton() {
  const phoneNumber = "7834896704";
  const message = "Hi Parikta Fashion, I want to know more about your collection.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed right-4 bottom-24 md:bottom-6 z-50 group"
    >
      <div className="flex items-center gap-3 bg-[#25D366] px-4 py-3 rounded-full shadow-xl hover:scale-105 duration-300">
  <FaWhatsapp size={26} color="white" />

  <span className="hidden md:block text-white font-semibold text-sm">
    Chat With Us
  </span>
</div>
    </a>
  );
}

export default WhatsAppButton;