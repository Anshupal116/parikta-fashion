import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiPhone,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiStar,
  FiArrowRight,
} from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Container from "../../components/Container";
import { useCustomer } from "../../context/CustomerContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCustomer } = useCustomer();

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectPath =
    location.state?.from ||
    location.state?.redirectTo ||
    "/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    setForm((previousForm) => ({
      ...previousForm,
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!form.password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginCustomer(form);

      if (response?.success) {
        navigate(redirectPath, { replace: true });
        return;
      }

      setError(response?.message || "Login failed. Please try again.");
    } catch (loginError) {
      console.error("Login error:", loginError);

      setError(
        loginError?.response?.data?.message ||
          loginError?.message ||
          "Unable to login right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f4f1] py-5 md:py-14">
        <Container>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#eadbd4] bg-[#fffdfb] shadow-[0_24px_70px_rgba(91,59,50,0.12)]">
            <div className="grid min-h-[720px] grid-cols-1 lg:grid-cols-2">
              <section className="relative min-h-[330px] overflow-hidden bg-[#f3e7df] lg:min-h-full">
                <img
                  src="/images/login-fashion.jpg"
                  alt="Parikta luxury fashion"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#2c1713]/70 via-[#5b3b32]/30 to-transparent lg:bg-gradient-to-t lg:from-[#2c1713]/85 lg:via-[#5b3b32]/30 lg:to-transparent" />

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/90 text-[#5B3B32] shadow-lg backdrop-blur-md transition hover:scale-105"
                >
                  <FiArrowLeft size={20} />
                </button>

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white md:p-8 lg:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f0cf9b]">
                    PARIKTA FASHION
                  </p>

                  <h1 className="heading-font mt-3 max-w-md text-4xl leading-tight sm:text-5xl lg:text-6xl">
                    Welcome Back to Timeless Elegance
                  </h1>

                  <p className="mt-4 max-w-md text-sm leading-6 text-white/85 sm:text-base">
                    Sign in to continue shopping your favourite premium styles.
                  </p>
                </div>
              </section>

              <section className="flex items-center p-5 sm:p-8 lg:p-12">
                <div className="mx-auto w-full max-w-md">
                  <div className="text-center lg:text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#B08A6A]">
                      Member Login
                    </p>

                    <h2 className="heading-font mt-3 text-4xl text-[#2f2623] sm:text-5xl">
                      Sign In
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[#8b746b]">
                      Login to continue with faster checkout, saved addresses
                      and order tracking.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-semibold text-[#5B3B32]"
                      >
                        Mobile Number
                      </label>

                      <div className="flex overflow-hidden rounded-2xl border border-[#dfd1ca] bg-white transition focus-within:border-[#9A3F4D] focus-within:ring-4 focus-within:ring-[#9A3F4D]/10">
                        <div className="flex items-center gap-2 border-r border-[#eadbd4] px-4 text-[#5B3B32]">
                          <FiPhone size={17} />
                          <span className="text-sm font-semibold">+91</span>
                        </div>

                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Enter 10-digit mobile number"
                          className="min-w-0 flex-1 bg-transparent px-4 py-4 text-[#2f2623] outline-none placeholder:text-[#b1a19a]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                          htmlFor="password"
                          className="text-sm font-semibold text-[#5B3B32]"
                        >
                          Password
                        </label>

                        <Link
                          to="/forgot-password"
                          className="text-xs font-bold text-[#9A3F4D] transition hover:text-[#7d3140]"
                        >
                          Forgot Password?
                        </Link>
                      </div>

                      <div className="flex items-center overflow-hidden rounded-2xl border border-[#dfd1ca] bg-white transition focus-within:border-[#9A3F4D] focus-within:ring-4 focus-within:ring-[#9A3F4D]/10">
                        <div className="px-4 text-[#5B3B32]">
                          <FiLock size={17} />
                        </div>

                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          className="min-w-0 flex-1 bg-transparent py-4 pr-2 text-[#2f2623] outline-none placeholder:text-[#b1a19a]"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((currentValue) => !currentValue)
                          }
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="flex h-12 w-12 shrink-0 items-center justify-center text-[#8b746b] transition hover:text-[#9A3F4D]"
                        >
                          {showPassword ? (
                            <FiEyeOff size={18} />
                          ) : (
                            <FiEye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9A3F4D] py-4 font-bold text-white shadow-[0_14px_28px_rgba(154,63,77,0.24)] transition hover:-translate-y-0.5 hover:bg-[#7d3140] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          SIGNING IN...
                        </>
                      ) : (
                        <>
                          CONTINUE
                          <FiArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="my-7 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#eadbd4]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a08e87]">
                      New to Parikta?
                    </span>
                    <div className="h-px flex-1 bg-[#eadbd4]" />
                  </div>

                  <Link
                    to="/register"
                    state={{ from: redirectPath }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#9A3F4D] bg-white py-4 font-bold text-[#9A3F4D] transition hover:bg-[#FDEAE6]"
                  >
                    CREATE ACCOUNT
                    <FiArrowRight size={18} />
                  </Link>

                  <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                    {[
                      [FiShield, "Secure"],
                      [FiTruck, "Free Delivery"],
                      [FiRefreshCw, "Easy Returns"],
                      [FiStar, "Premium"],
                    ].map(([Icon, label]) => (
                      <div
                        key={label}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#eadbd4] bg-[#fffaf7] px-3 py-3 text-center"
                      >
                        <Icon size={15} className="text-[#9A3F4D]" />
                        <span className="text-[11px] font-semibold text-[#5B3B32]">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-7 text-center text-[11px] leading-5 text-[#9a8982]">
                    By continuing, you agree to Parikta&apos;s{" "}
                    <Link to="/terms" className="font-semibold text-[#7d3140]">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="font-semibold text-[#7d3140]"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default Login;