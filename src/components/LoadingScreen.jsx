import { useEffect, useState } from "react";

function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2300);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#fffaf7] flex items-center justify-center overflow-hidden">
      <div className="absolute w-72 h-72 rounded-full bg-[#FDEAE6] blur-3xl opacity-80 animate-pulse"></div>

      <div className="relative text-center px-6">
        <p className="loading-fade tracking-[0.45em] text-xs text-[#BFA996] font-semibold uppercase">
          Welcome To
        </p>

        <h1 className="loading-logo logo-font text-7xl md:text-9xl text-[#9A3F4D] mt-3">
          Parikta
        </h1>

        <p className="loading-fade-delay tracking-[0.5em] text-xs text-[#BFA996] font-semibold">
          FASHION
        </p>

        <div className="loading-line w-32 h-px bg-[#BFA996] mx-auto my-7"></div>

        <p className="loading-text heading-font text-2xl md:text-3xl text-[#5B3B32]">
          Elegance in Every Thread
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;