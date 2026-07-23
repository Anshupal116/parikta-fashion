import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEdit2,
  FiPhone,
  FiShield,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { useCustomer } from "../../context/CustomerContext";

import loginDesktopImage from "../../assets/login-fashion-desktop.png";
import loginMobileImage from "../../assets/login-fashion-mobile.png";

const OTP_LENGTH = 6;
const RESEND_TIME = 30;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { sendOtp, verifyOtp, completeProfile } =
    useCustomer();

  const [step, setStep] = useState("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [secondsLeft, setSecondsLeft] =
    useState(RESEND_TIME);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const redirectPath = useMemo(() => {
    return (
      location.state?.from ||
      location.state?.redirectTo ||
      "/"
    );
  }, [location.state]);

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const cleanPhone = (value) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const handleSendOtp = async (event) => {
    event?.preventDefault();

    setError("");
    setNotice("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Valid 10-digit mobile number enter karo.");
      return;
    }

    try {
      setLoading(true);

      const response = await sendOtp(phone);

      if (!response.success) {
        setError(response.message || "OTP send failed");
        return;
      }

      setOtp("");
      setSecondsLeft(RESEND_TIME);
      setStep("otp");

      setNotice(
        response.developmentOtp
          ? `Development OTP: ${response.developmentOtp}`
          : "OTP sent successfully"
      );
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setError("");
    setNotice("");

    if (otp.length !== OTP_LENGTH) {
      setError("6-digit OTP enter karo.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp({
        phone,
        otp,
      });

      if (!response.success) {
        setError(
          response.message || "OTP verification failed"
        );
        return;
      }

      if (
        response.isNewCustomer ||
        response.requiresProfile
      ) {
        setStep("profile");
        return;
      }

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      setError("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (event) => {
    event.preventDefault();

    setError("");

    if (profile.name.trim().length < 2) {
      setError("Apna full name enter karo.");
      return;
    }

    try {
      setLoading(true);

      const response = await completeProfile({
        phone,
        otp,
        name: profile.name,
        email: profile.email,
      });

      if (!response.success) {
        setError(
          response.message || "Account creation failed"
        );
        return;
      }

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      setError("Account creation failed.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "profile") {
      setStep("otp");
      return;
    }

    if (step === "otp") {
      setStep("phone");
      setOtp("");
      setNotice("");
      return;
    }

    navigate(-1);
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f8f3ef] md:p-6">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#fffdfb] md:h-[90vh] md:max-h-[780px] md:max-w-6xl md:flex-row md:rounded-[32px] md:border md:border-[#eadbd4] md:shadow-[0_30px_90px_rgba(91,59,50,0.18)]">
        {/* ============================= */}
        {/* IMAGE SECTION */}
        {/* ============================= */}

        <section className="relative h-[44%] w-full shrink-0 overflow-hidden bg-[#5B3B32] md:h-full md:w-1/2">
          {/* Mobile image */}

          <img
            src={loginMobileImage}
            alt="Parikta Fashion"
            className="absolute inset-0 h-full w-full object-cover object-top md:hidden"
          />

          {/* Desktop image */}

          <img
            src={loginDesktopImage}
            alt="Parikta Fashion"
            className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#271310]/60 via-transparent to-black/10" />

          <button
            type="button"
            onClick={goBack}
            className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#5B3B32] shadow-lg transition hover:scale-105"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>

          {/* Desktop badges */}

          <div className="absolute inset-x-6 bottom-6 hidden rounded-2xl border border-white/15 bg-black/25 p-4 text-white backdrop-blur-md md:grid md:grid-cols-3 md:gap-4">
            <div className="text-center">
              <FiShield className="mx-auto mb-2 text-[#e7bd7c]" />

              <p className="text-xs font-semibold">
                Secure Login
              </p>
            </div>

            <div className="text-center">
              <FiCheckCircle className="mx-auto mb-2 text-[#e7bd7c]" />

              <p className="text-xs font-semibold">
                Easy Checkout
              </p>
            </div>

            <div className="text-center">
              <FiArrowRight className="mx-auto mb-2 text-[#e7bd7c]" />

              <p className="text-xs font-semibold">
                Fast Shopping
              </p>
            </div>
          </div>
        </section>

        {/* ============================= */}
        {/* FORM SECTION */}
        {/* ============================= */}

        <section className="flex min-h-0 flex-1 items-center justify-center bg-[#fffdfb] px-6 py-5 sm:px-8 md:w-1/2 md:px-14 lg:px-20">
          <div className="w-full max-w-md">
            {/* PHONE STEP */}

            {step === "phone" && (
              <form
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B08A6A]">
                    Welcome to Parikta
                  </p>

                  <h1 className="mt-2 font-serif text-3xl font-semibold text-[#3a2620] sm:text-4xl">
                    Let&apos;s get you in
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-[#8b746b]">
                    Login or sign up to continue shopping
                    your favourite styles.
                  </p>
                </div>

                <div className="flex overflow-hidden rounded-2xl border border-[#dfd1ca] bg-white transition focus-within:border-[#9A3F4D] focus-within:ring-4 focus-within:ring-[#9A3F4D]/10">
                  <div className="flex items-center gap-2 border-r border-[#eadbd4] px-4 text-[#5B3B32]">
                    <span className="text-lg">🇮🇳</span>

                    <span className="text-sm font-bold">
                      +91
                    </span>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        cleanPhone(event.target.value)
                      )
                    }
                    placeholder="Enter mobile number"
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base font-semibold text-[#2f2623] outline-none placeholder:font-normal placeholder:text-[#b1a19a]"
                    autoFocus
                  />

                  <div className="flex items-center pr-4 text-[#a28f87]">
                    <FiPhone size={18} />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7f1d2d] to-[#9A3F4D] py-4 text-sm font-bold tracking-wide text-white shadow-[0_14px_28px_rgba(127,29,45,0.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "SENDING OTP..."
                    : "CONTINUE"}

                  {!loading && (
                    <FiArrowRight size={18} />
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-[#8b746b]">
                  <FiShield className="text-[#B08A6A]" />

                  <span>
                    100% Secure · No spam · Only
                    verification
                  </span>
                </div>
              </form>
            )}

            {/* OTP STEP */}

            {step === "otp" && (
              <form
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B08A6A]">
                    Verify Mobile
                  </p>

                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#3a2620] sm:text-4xl">
                    Enter your OTP
                  </h2>

                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#9A3F4D]"
                  >
                    +91 {phone}

                    <FiEdit2 size={14} />
                  </button>
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, OTP_LENGTH)
                    )
                  }
                  placeholder="••••••"
                  className="w-full rounded-2xl border border-[#dfd1ca] bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.6em] text-[#2f2623] outline-none transition focus:border-[#9A3F4D] focus:ring-4 focus:ring-[#9A3F4D]/10"
                  autoFocus
                />

                {notice && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
                    {notice}
                  </p>
                )}

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7f1d2d] to-[#9A3F4D] py-4 text-sm font-bold tracking-wide text-white disabled:opacity-60"
                >
                  {loading
                    ? "VERIFYING..."
                    : "VERIFY & CONTINUE"}

                  {!loading && (
                    <FiCheckCircle size={18} />
                  )}
                </button>

                <button
                  type="button"
                  disabled={
                    secondsLeft > 0 || loading
                  }
                  onClick={handleSendOtp}
                  className="w-full text-center text-xs font-bold text-[#9A3F4D] disabled:text-[#a99891]"
                >
                  {secondsLeft > 0
                    ? `Resend OTP in ${secondsLeft}s`
                    : "RESEND OTP"}
                </button>
              </form>
            )}

            {/* PROFILE STEP */}

            {step === "profile" && (
              <form
                onSubmit={handleCompleteProfile}
                className="space-y-4"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B08A6A]">
                    Almost Done
                  </p>

                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#3a2620] sm:text-4xl">
                    Create your account
                  </h2>

                  <p className="mt-2 text-sm text-[#8b746b]">
                    Mobile verified: +91 {phone}
                  </p>
                </div>

                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Full name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-[#dfd1ca] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#9A3F4D] focus:ring-4 focus:ring-[#9A3F4D]/10"
                  autoFocus
                />

                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email address (optional)"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-[#dfd1ca] bg-white px-4 py-4 text-sm outline-none transition focus:border-[#9A3F4D] focus:ring-4 focus:ring-[#9A3F4D]/10"
                />

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7f1d2d] to-[#9A3F4D] py-4 text-sm font-bold tracking-wide text-white disabled:opacity-60"
                >
                  {loading
                    ? "CREATING ACCOUNT..."
                    : "CREATE ACCOUNT"}

                  {!loading && (
                    <FiArrowRight size={18} />
                  )}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-[11px] leading-5 text-[#9a8982]">
              By continuing, you agree to Parikta&apos;s{" "}
              <span className="font-semibold text-[#7f1d2d] underline">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="font-semibold text-[#7f1d2d] underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;