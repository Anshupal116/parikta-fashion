import { useEffect, useState } from "react";

export default function InstallApp() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Already installed?
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // Android / Chrome / Edge
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      setInstallPrompt(event);
      setShowInstall(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();

    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      console.log("Parikta Fashion installed");
    }

    setInstallPrompt(null);
    setShowInstall(false);
  };

  const handleIOSInstall = () => {
    setShowIOS(true);
  };

  if (!showInstall && !showIOS) {
    return null;
  }

  return (
    <>
      {/* INSTALL BANNER */}
      {showInstall && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md rounded-3xl border border-[#eadbd4] bg-[#fffaf7]/95 p-4 shadow-[0_20px_60px_rgba(91,59,50,0.20)] backdrop-blur-xl">

          <div className="flex items-center gap-3">

            {/* ICON */}
            <img
              src="/pwa-192.png"
              alt="Parikta Fashion"
              className="h-14 w-14 rounded-2xl object-cover shadow-sm"
            />

            {/* TEXT */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#5B3B32]">
                Install Parikta Fashion
              </p>

              <p className="mt-1 text-[11px] leading-4 text-[#8b746b]">
                Add Parikta Fashion to your home screen for a faster shopping experience.
              </p>
            </div>

            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setShowInstall(false)}
              className="self-start text-lg leading-none text-[#9a8178]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* BUTTON */}
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-[#9A3F4D] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#7d3140] active:scale-[0.98]"
          >
            Install App
          </button>
        </div>
      )}

      {/* IOS INSTRUCTIONS */}
      {showIOS && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[28px] bg-[#fffaf7] p-6 shadow-2xl">

            <div className="flex items-center justify-between">
              <h2 className="heading-font text-2xl text-[#5B3B32]">
                Install Parikta
              </h2>

              <button
                type="button"
                onClick={() => setShowIOS(false)}
                className="text-2xl text-[#8b746b]"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#6d554d]">
              iPhone/iPad par Parikta Fashion install karne ke liye:
            </p>

            <div className="mt-5 space-y-4">

              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9A3F4D] text-xs font-bold text-white">
                  1
                </span>

                <p className="text-sm leading-6 text-[#6d554d]">
                  Safari me neeche ya upar
                  <strong> Share </strong>
                  button tap karo.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9A3F4D] text-xs font-bold text-white">
                  2
                </span>

                <p className="text-sm leading-6 text-[#6d554d]">
                  <strong>Add to Home Screen</strong> select karo.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9A3F4D] text-xs font-bold text-white">
                  3
                </span>

                <p className="text-sm leading-6 text-[#6d554d]">
                  Phir <strong>Add</strong> par tap karo.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setShowIOS(false)}
              className="mt-6 w-full rounded-full bg-[#9A3F4D] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
            >
              Got It
            </button>

          </div>
        </div>
      )}
    </>
  );
}