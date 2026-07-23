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
import loginFashion from "../../assets/login-fashion.png";

import { useCustomer } from "../../context/CustomerContext";

const OTP_LENGTH = 6;
const RESEND_TIME = 30;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sendOtp,
    verifyOtp,
    completeProfile,
  } = useCustomer();

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

  const redirectPath = useMemo(
    () =>
      location.state?.from ||
      location.state?.redirectTo ||
      "/",
    [location.state]
  );

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, secondsLeft]);

  const cleanPhone = (value) =>
    value.replace(/\D/g, "").slice(0, 10);

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
        setError(response.message || "OTP verification failed");
        return;
      }

      if (
        response.isNewCustomer ||
        response.requiresProfile
      ) {
        setStep("profile");
        return;
      }

      navigate(redirectPath, { replace: true });
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
        setError(response.message || "Signup failed");
        return;
      }

      navigate(redirectPath, { replace: true });
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
    <main className="h-[100dvh] overflow-hidden bg-[#f8f3ef]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col bg-[#fffdfb] sm:my-6 sm:h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-[#eadbd4] sm:shadow-[0_24px_70px_rgba(91,59,50,0.14)]">
        <header className="relative h-[38%] min-h-[220px] shrink-0 overflow-hidden bg-[#5B3B32]">
          <img
            src={loginFashion}
            alt="Parikta Fashion"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#2c1713]/90 via-[#5B3B32]/35 to-black/10" />

          <button
            type="button"
            onClick={goBack}
            className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#5B3B32] shadow-lg"
            aria-label="Go back"
          >
            <FiArrowLeft size={19} />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#f0cf9b]">
              PARIKTA FASHION
            </p>

            <h1 className="heading-font mt-2 text-3xl leading-tight">
              Your wardrobe,
              <br />
              beautifully yours.
            </h1>

            <div className="mt-3 flex items-center gap-2 text-xs text-white/85">
              <FiShield className="text-[#f0cf9b]" />
              Secure login • Cart preserved
            </div>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col justify-center px-5 py-4 sm:px-7">
          {step === "phone" && (
            <form
              onSubmit={handleSendOtp}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B08A6A]">
                  Login or Sign Up
                </p>

                <h2 className="heading-font mt-1 text-3xl text-[#2f2623]">
                  Continue with mobile
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8b746b]">
                  Ek hi mobile number se login aur signup dono
                  ho jayega.
                </p>
              </div>

              <div className="flex overflow-hidden rounded-2xl border border-[#dfd1ca] bg-white focus-within:border-[#9A3F4D] focus-within:ring-4 focus-within:ring-[#9A3F4D]/10">
                <div className="flex items-center gap-2 border-r border-[#eadbd4] px-4 text-[#5B3B32]">
                  <FiPhone size={17} />
                  <span className="text-sm font-bold">+91</span>
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(cleanPhone(event.target.value))
                  }
                  placeholder="Mobile number"
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base font-semibold text-[#2f2623] outline-none placeholder:font-normal placeholder:text-[#b1a19a]"
                  autoFocus
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9A3F4D] py-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(154,63,77,0.25)] disabled:opacity-60"
              >
                {loading ? "SENDING OTP..." : "CONTINUE"}
                {!loading && <FiArrowRight size={18} />}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B08A6A]">
                  Verify OTP
                </p>

                <h2 className="heading-font mt-1 text-3xl text-[#2f2623]">
                  Enter 6-digit code
                </h2>

                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#9A3F4D]"
                >
                  +91 {phone}
                  <FiEdit2 size={12} />
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
                className="w-full rounded-2xl border border-[#dfd1ca] bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.6em] text-[#2f2623] outline-none focus:border-[#9A3F4D] focus:ring-4 focus:ring-[#9A3F4D]/10"
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9A3F4D] py-4 text-sm font-bold text-white disabled:opacity-60"
              >
                {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
                {!loading && <FiCheckCircle size={18} />}
              </button>

              <button
                type="button"
                disabled={secondsLeft > 0 || loading}
                onClick={handleSendOtp}
                className="w-full text-center text-xs font-bold text-[#9A3F4D] disabled:text-[#a99891]"
              >
                {secondsLeft > 0
                  ? `Resend OTP in ${secondsLeft}s`
                  : "RESEND OTP"}
              </button>
            </form>
          )}

          {step === "profile" && (
            <form
              onSubmit={handleCompleteProfile}
              className="space-y-3"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B08A6A]">
                  Almost Done
                </p>

                <h2 className="heading-font mt-1 text-3xl text-[#2f2623]">
                  Create your account
                </h2>

                <p className="mt-1 text-xs text-[#8b746b]">
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
                className="w-full rounded-2xl border border-[#dfd1ca] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9A3F4D] focus:ring-4 focus:ring-[#9A3F4D]/10"
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
                placeholder="Email (optional)"
                autoComplete="email"
                className="w-full rounded-2xl border border-[#dfd1ca] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#9A3F4D] focus:ring-4 focus:ring-[#9A3F4D]/10"
              />

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9A3F4D] py-4 text-sm font-bold text-white disabled:opacity-60"
              >
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT"}
                {!loading && <FiArrowRight size={18} />}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-[10px] leading-4 text-[#9a8982]">
            By continuing, you agree to Parikta&apos;s Terms
            and Privacy Policy.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;
