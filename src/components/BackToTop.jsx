import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="
fixed
bottom-24 md:bottom-6
left-4 md:left-6
z-[90]
w-14 h-14
rounded-full
bg-[#fffaf7]
border border-[#eadbd4]
text-[#9A3F4D]
shadow-xl
flex items-center justify-center
hover:-translate-y-1
duration-300
"
    >
      <FiArrowUp size={20} />
    </button>
  );
}

export default BackToTop;