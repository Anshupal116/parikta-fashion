import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheck, FiEdit2, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import CheckoutStepper from "../components/CheckoutStepper";

import { useCart } from "../context/CartContext";

const STORAGE_KEY = "pariktaSavedAddresses";
const SELECTED_ADDRESS_KEY = "pariktaCheckoutAddress";

const emptyForm = {
  id: "",
  name: "",
  phone: "",
  email: "",
  pincode: "",
  house: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  type: "Home",
  isDefault: false,
};

const readSavedAddresses = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

function CheckoutAddress() {
  const navigate = useNavigate();
  const { cartItems, finalTotal } = useCart();

  const [addresses, setAddresses] = useState(readSavedAddresses);
  const [selectedId, setSelectedId] = useState("");
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cartItems.length, navigate]);

  useEffect(() => {
    const selected = sessionStorage.getItem(SELECTED_ADDRESS_KEY);
    if (!selected) return;

    try {
      const parsed = JSON.parse(selected);
      setSelectedId(parsed.id || "");
    } catch {
      sessionStorage.removeItem(SELECTED_ADDRESS_KEY);
    }
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedId),
    [addresses, selectedId]
  );

  const persistAddresses = (next) => {
    setAddresses(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let nextValue = type === "checkbox" ? checked : value;

    if (name === "phone") nextValue = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") nextValue = value.replace(/\D/g, "").slice(0, 6);

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Full name enter karo.";
    if (!/^\d{10}$/.test(form.phone)) return "Valid 10-digit phone number enter karo.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Valid email enter karo.";
    if (!/^\d{6}$/.test(form.pincode)) return "Valid 6-digit pincode enter karo.";
    if (!form.house.trim()) return "House / flat details enter karo.";
    if (!form.area.trim()) return "Area / locality enter karo.";
    if (!form.city.trim()) return "City enter karo.";
    if (!form.state.trim()) return "State enter karo.";
    return "";
  };

  const saveAddress = (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const id = form.id || `address-${Date.now()}`;
    const normalized = {
      ...form,
      id,
      name: form.name.trim(),
      email: form.email.trim(),
      house: form.house.trim(),
      area: form.area.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
    };

    let next = form.id
      ? addresses.map((item) => (item.id === form.id ? normalized : item))
      : [...addresses, normalized];

    if (normalized.isDefault || next.length === 1) {
      next = next.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }));
    }

    persistAddresses(next);
    setSelectedId(id);
    sessionStorage.setItem(
      SELECTED_ADDRESS_KEY,
      JSON.stringify(next.find((item) => item.id === id))
    );
    setForm(emptyForm);
    setShowForm(false);
    setError("");
  };

  const editAddress = (item) => {
    setForm(item);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAddress = (id) => {
    const next = addresses.filter((item) => item.id !== id);
    persistAddresses(next);

    if (selectedId === id) {
      setSelectedId("");
      sessionStorage.removeItem(SELECTED_ADDRESS_KEY);
    }

    if (next.length === 0) setShowForm(true);
  };

  const selectAddress = (item) => {
    setSelectedId(item.id);
    sessionStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(item));
  };

  const continueToPayment = () => {
    if (!selectedAddress) {
      setError("Delivery ke liye ek address select karo.");
      return;
    }

    sessionStorage.setItem(
      SELECTED_ADDRESS_KEY,
      JSON.stringify(selectedAddress)
    );
    navigate("/checkout/payment");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f2ee] pb-28 pt-6 md:pb-14 md:pt-10">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbd4] bg-white text-[#5B3B32]"
              >
                <FiArrowLeft size={21} />
              </button>

              <div className="text-center">
                <h1 className="heading-font text-3xl text-[#5B3B32] md:text-4xl">
                  Delivery Address
                </h1>
                <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                  STEP 2 OF 3
                </p>
              </div>

              <div className="h-11 w-11" />
            </div>

            <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-5">
              <CheckoutStepper activeStep="address" />
            </div>

            <div className="grid items-start gap-7 lg:grid-cols-[1fr_340px]">
              <section className="space-y-5">
                {addresses.length > 0 && (
                  <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-7">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                          SAVED ADDRESSES
                        </p>
                        <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                          Select delivery address
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForm(emptyForm);
                          setShowForm(true);
                          setError("");
                        }}
                        className="hidden items-center gap-2 rounded-full border border-[#9A3F4D] px-4 py-2 text-sm font-bold text-[#9A3F4D] sm:flex"
                      >
                        <FiPlus /> Add New
                      </button>
                    </div>

                    <div className="space-y-4">
                      {addresses.map((item) => {
                        const selected = selectedId === item.id;

                        return (
                          <article
                            key={item.id}
                            onClick={() => selectAddress(item)}
                            className={`cursor-pointer rounded-2xl border p-5 transition ${
                              selected
                                ? "border-[#9A3F4D] bg-[#FDEAE6]/60 shadow-sm"
                                : "border-[#eadbd4] bg-white hover:border-[#cbaea3]"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[#9A3F4D] bg-[#9A3F4D] text-white"
                                    : "border-[#cdbbb2] bg-white"
                                }`}
                              >
                                {selected && <FiCheck size={14} />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-bold text-[#5B3B32]">
                                    {item.name}
                                  </h3>
                                  <span className="rounded-full bg-[#f2e5df] px-3 py-1 text-xs font-semibold text-[#9A3F4D]">
                                    {item.type}
                                  </span>
                                  {item.isDefault && (
                                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                      Default
                                    </span>
                                  )}
                                </div>

                                <p className="mt-3 leading-6 text-[#75635c]">
                                  {item.house}, {item.area}
                                  {item.landmark ? `, ${item.landmark}` : ""}
                                  <br />
                                  {item.city}, {item.state} - {item.pincode}
                                </p>

                                <p className="mt-2 font-semibold text-[#5B3B32]">
                                  Mobile: {item.phone}
                                </p>

                                <div className="mt-4 flex gap-3">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      editAddress(item);
                                    }}
                                    className="flex items-center gap-2 text-sm font-bold text-[#9A3F4D]"
                                  >
                                    <FiEdit2 /> Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      deleteAddress(item.id);
                                    }}
                                    className="flex items-center gap-2 text-sm font-bold text-red-600"
                                  >
                                    <FiTrash2 /> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setForm(emptyForm);
                        setShowForm(true);
                        setError("");
                      }}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#9A3F4D] bg-white py-4 font-bold text-[#9A3F4D] sm:hidden"
                    >
                      <FiPlus /> ADD NEW ADDRESS
                    </button>
                  </div>
                )}

                {showForm && (
                  <form
                    onSubmit={saveAddress}
                    className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-7"
                  >
                    <div className="mb-6 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                          {form.id ? "EDIT ADDRESS" : "NEW ADDRESS"}
                        </p>
                        <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                          Address details
                        </h2>
                      </div>

                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setForm(emptyForm);
                            setError("");
                          }}
                          className="text-sm font-bold text-[#9A3F4D]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {error && (
                      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D]"
                      />

                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        inputMode="numeric"
                        placeholder="Phone Number"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D]"
                      />

                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="Email Address (optional)"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D] md:col-span-2"
                      />

                      <input
                        name="pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        inputMode="numeric"
                        placeholder="Pincode"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D]"
                      />

                      <input
                        name="house"
                        value={form.house}
                        onChange={handleChange}
                        placeholder="House / Flat / Building"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D]"
                      />

                      <input
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                        placeholder="Area / Locality"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D] md:col-span-2"
                      />

                      <input
                        name="landmark"
                        value={form.landmark}
                        onChange={handleChange}
                        placeholder="Landmark (optional)"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D] md:col-span-2"
                      />

                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D]"
                      />

                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="rounded-xl border border-[#eadbd4] bg-white p-4 outline-none focus:border-[#9A3F4D]"
                      />
                    </div>

                    <div className="mt-5">
                      <p className="mb-3 text-sm font-bold text-[#5B3B32]">
                        Save address as
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {["Home", "Office", "Other"].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() =>
                              setForm((current) => ({ ...current, type }))
                            }
                            className={`rounded-full border px-5 py-2 text-sm font-bold ${
                              form.type === type
                                ? "border-[#9A3F4D] bg-[#9A3F4D] text-white"
                                : "border-[#d9cbc4] bg-white text-[#5B3B32]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#5B3B32]">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={form.isDefault}
                        onChange={handleChange}
                        className="h-4 w-4 accent-[#9A3F4D]"
                      />
                      Make this my default address
                    </label>

                    <button
                      type="submit"
                      className="mt-6 w-full rounded-xl bg-[#9A3F4D] py-4 font-bold text-white transition hover:bg-[#7d3140]"
                    >
                      {form.id ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
                    </button>
                  </form>
                )}
              </section>

              <aside className="hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm lg:sticky lg:top-28 lg:block">
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-[#9A3F4D]" size={22} />
                  <h2 className="heading-font text-2xl text-[#5B3B32]">
                    Delivery
                  </h2>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#75635c]">
                  Selected address par order deliver kiya jayega. Payment step par aap COD ya online payment choose kar sakte ho.
                </p>

                <div className="mt-6 border-t border-[#eadbd4] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#75635c]">Order Total</span>
                    <span className="text-xl font-bold text-[#9A3F4D]">
                      ₹{Number(finalTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={continueToPayment}
                  className="mt-6 w-full rounded-xl bg-[#9A3F4D] py-4 font-bold text-white"
                >
                  CONTINUE TO PAYMENT
                </button>
              </aside>
            </div>
          </div>
        </Container>
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-[#eadbd4] bg-[#fffaf7]/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-[105px]">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-[#8b746b]">
              TOTAL
            </p>
            <p className="text-lg font-bold text-[#9A3F4D]">
              ₹{Number(finalTotal || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <button
            type="button"
            onClick={continueToPayment}
            className="flex-1 rounded-full bg-[#9A3F4D] py-3.5 font-bold text-white"
          >
            CONTINUE TO PAYMENT
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CheckoutAddress;
