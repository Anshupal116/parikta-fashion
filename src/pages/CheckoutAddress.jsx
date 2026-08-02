import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiEdit2,
  FiLoader,
  FiMapPin,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import CheckoutStepper from "../components/CheckoutStepper";

import { useCart } from "../context/CartContext";
import { useCustomer } from "../context/CustomerContext";
import { lookupPincode } from "../services/customerService";

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

const inputClass =
  "min-h-12 w-full rounded-xl border border-[#eadbd4] bg-white px-4 py-3 text-base text-[#5B3B32] outline-none transition focus:border-[#9A3F4D] focus:ring-2 focus:ring-[#9A3F4D]/10";

function CheckoutAddress() {
  const navigate = useNavigate();
  const { cartItems, finalTotal } = useCart();

  const {
    isLoggedIn,
    authLoading,
    customer,
    addresses,
    selectedCheckoutAddress,
    addressesLoading,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    selectCheckoutAddress,
  } = useCustomer();

  const [selectedId, setSelectedId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState("");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login", {
        replace: true,
        state: { from: "/checkout/address" },
      });
      return;
    }

    if (cartItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [authLoading, isLoggedIn, cartItems.length, navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadAddresses();
  }, [isLoggedIn]);

  useEffect(() => {
    const selected =
      selectedCheckoutAddress?._id ||
      selectedCheckoutAddress?.id ||
      "";

    setSelectedId(selected);

    if (!addressesLoading && addresses.length === 0) {
      setShowForm(true);
      setForm((current) => ({
        ...current,
        name: current.name || customer?.name || "",
        phone: current.phone || customer?.phone || "",
        email: current.email || customer?.email || "",
      }));
    }
  }, [
    selectedCheckoutAddress,
    addresses,
    addressesLoading,
    customer,
  ]);

  useEffect(() => {
    const pincode = form.pincode;

    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus("");
      setPincodeLoading(false);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      try {
        setPincodeLoading(true);
        setPincodeStatus("");

        const data = await lookupPincode(pincode);

        if (!active) return;

        setForm((current) => ({
          ...current,
          city: data.city || current.city,
          state: data.state || current.state,
        }));

        setPincodeStatus("City and state filled automatically");
      } catch (lookupError) {
        if (!active) return;

        setPincodeStatus(
          lookupError.response?.data?.message ||
            "Pincode lookup failed. City and state manually enter karo."
        );
      } finally {
        if (active) {
          setPincodeLoading(false);
        }
      }
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.pincode]);

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (item) =>
          String(item._id || item.id) === String(selectedId)
      ),
    [addresses, selectedId]
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let nextValue = type === "checkbox" ? checked : value;

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      nextValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Full name enter karo.";

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      return "Valid 10-digit phone number enter karo.";
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Valid email enter karo.";
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      return "Valid 6-digit pincode enter karo.";
    }

    if (!form.house.trim()) {
      return "House / flat details enter karo.";
    }

    if (!form.area.trim()) {
      return "Area / locality enter karo.";
    }

    if (!form.city.trim()) return "City enter karo.";
    if (!form.state.trim()) return "State enter karo.";

    return "";
  };

  const saveAddress = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        type: form.type,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        pincode: form.pincode.trim(),
        house: form.house.trim(),
        area: form.area.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        isDefault: form.isDefault,
      };

      const response = form.id
        ? await updateAddress(form.id, payload)
        : await addAddress(payload);

      if (!response?.success) {
        setError(response?.message || "Address save failed");
        return;
      }

      const savedAddress =
        response.address ||
        response.selectedCheckoutAddress;

      const savedId =
        savedAddress?._id || savedAddress?.id;

      if (savedId) {
        setSelectedId(savedId);
        await selectCheckoutAddress(savedId);
      }

      setForm(emptyForm);
      setShowForm(false);
      setPincodeStatus("");
      await loadAddresses();
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          saveError.message ||
          "Address save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const editAddress = (item) => {
    setForm({
      ...emptyForm,
      ...item,
      id: item._id || item.id,
    });

    setShowForm(true);
    setError("");
    setPincodeStatus("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      "Is address ko delete karna hai?"
    );

    if (!confirmed) return;

    const response = await deleteAddress(addressId);

    if (!response?.success) {
      setError(response?.message || "Address delete failed");
      return;
    }

    await loadAddresses();
  };

  const selectAddress = async (item) => {
    const addressId = item._id || item.id;

    setSelectedId(addressId);
    setError("");

    const response = await selectCheckoutAddress(addressId);

    if (!response?.success) {
      setError(
        response?.message || "Address select nahi hua"
      );
    }
  };

  const continueToPayment = async () => {
    if (!selectedAddress) {
      setError(
        "Delivery ke liye ek address select karo."
      );
      return;
    }

    const response = await selectCheckoutAddress(
      selectedAddress._id || selectedAddress.id
    );

    if (!response?.success) {
      setError(
        response?.message ||
          "Checkout address save nahi hua"
      );
      return;
    }

    navigate("/checkout/payment");
  };

  if (authLoading || addressesLoading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f2ee]">
          <div className="text-center text-[#5B3B32]">
            <FiLoader
              size={30}
              className="mx-auto animate-spin text-[#9A3F4D]"
            />
            <p className="mt-3 font-semibold">
              Loading addresses...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f2ee] pb-36 pt-4 sm:pt-6 md:pb-14 md:pt-10">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 grid grid-cols-[44px_1fr_44px] items-center gap-2 sm:mb-7">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-[#eadbd4] bg-white text-[#5B3B32] active:scale-95"
                aria-label="Back to cart"
              >
                <FiArrowLeft size={21} />
              </button>

              <div className="min-w-0 text-center">
                <h1 className="heading-font text-[2rem] leading-tight text-[#5B3B32] sm:text-3xl md:text-4xl">
                  Delivery Address
                </h1>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-[#BFA996] sm:text-xs">
                  STEP 2 OF 3
                </p>
              </div>

              <div className="h-11 w-11" />
            </div>

            <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-4 sm:mb-8 sm:p-5">
              <CheckoutStepper activeStep="address" />
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
              <section className="min-w-0 space-y-5">
                {addresses.length > 0 && (
                  <div className="rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] p-4 shadow-sm sm:p-5 md:rounded-3xl md:p-7">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold tracking-[0.17em] text-[#BFA996] sm:text-xs">
                          SAVED ADDRESSES
                        </p>
                        <h2 className="heading-font mt-1 text-[1.8rem] leading-tight text-[#5B3B32] sm:text-3xl">
                          Select delivery address
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...emptyForm,
                            name: customer?.name || "",
                            phone: customer?.phone || "",
                            email: customer?.email || "",
                          });
                          setShowForm(true);
                          setError("");
                        }}
                        className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#9A3F4D] px-4 py-2 text-sm font-bold text-[#9A3F4D] sm:flex"
                      >
                        <FiPlus /> Add New
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {addresses.map((item) => {
                        const itemId = item._id || item.id;
                        const selected =
                          String(selectedId) === String(itemId);

                        return (
                          <article
                            key={itemId}
                            onClick={() => selectAddress(item)}
                            className={`cursor-pointer rounded-2xl border p-4 transition active:scale-[0.995] sm:p-5 ${
                              selected
                                ? "border-[#9A3F4D] bg-[#FDEAE6]/60 shadow-sm"
                                : "border-[#eadbd4] bg-white hover:border-[#cbaea3]"
                            }`}
                          >
                            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
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
                                  <h3 className="break-words font-bold text-[#5B3B32]">
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

                                <p className="mt-3 break-words text-sm leading-6 text-[#75635c] sm:text-base">
                                  {item.house}, {item.area}
                                  {item.landmark
                                    ? `, ${item.landmark}`
                                    : ""}
                                  <br />
                                  {item.city}, {item.state} -{" "}
                                  {item.pincode}
                                </p>

                                <p className="mt-2 text-sm font-semibold text-[#5B3B32] sm:text-base">
                                  Mobile: {item.phone}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-4">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      editAddress(item);
                                    }}
                                    className="flex min-h-10 touch-manipulation items-center gap-2 text-sm font-bold text-[#9A3F4D]"
                                  >
                                    <FiEdit2 /> Edit
                                  </button>

                                  {!item.isDefault && (
                                    <button
                                      type="button"
                                      onClick={async (event) => {
                                        event.stopPropagation();
                                        const response =
                                          await setDefaultAddress(itemId);

                                        if (!response?.success) {
                                          setError(
                                            response?.message ||
                                              "Default address update failed"
                                          );
                                          return;
                                        }

                                        await loadAddresses();
                                      }}
                                      className="min-h-10 text-sm font-bold text-green-700"
                                    >
                                      Set Default
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDelete(itemId);
                                    }}
                                    className="flex min-h-10 touch-manipulation items-center gap-2 text-sm font-bold text-red-600"
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
                        setForm({
                          ...emptyForm,
                          name: customer?.name || "",
                          phone: customer?.phone || "",
                          email: customer?.email || "",
                        });
                        setShowForm(true);
                        setError("");
                      }}
                      className="mt-5 flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-dashed border-[#9A3F4D] bg-white py-3 font-bold text-[#9A3F4D] sm:hidden"
                    >
                      <FiPlus /> ADD NEW ADDRESS
                    </button>
                  </div>
                )}

                {showForm && (
                  <form
                    onSubmit={saveAddress}
                    className="rounded-[26px] border border-[#eadbd4] bg-[#fffaf7] p-4 shadow-sm sm:p-5 md:rounded-3xl md:p-7"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.17em] text-[#BFA996] sm:text-xs">
                          {form.id
                            ? "EDIT ADDRESS"
                            : "NEW ADDRESS"}
                        </p>
                        <h2 className="heading-font mt-1 text-[1.8rem] leading-tight text-[#5B3B32] sm:text-3xl">
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
                          className="min-h-10 shrink-0 text-sm font-bold text-[#9A3F4D]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                        placeholder="Full Name"
                        className={inputClass}
                      />

                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="Phone Number"
                        className={inputClass}
                      />

                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        autoComplete="email"
                        placeholder="Email Address (optional)"
                        className={`${inputClass} md:col-span-2`}
                      />

                      <div>
                        <div className="relative">
                          <input
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            inputMode="numeric"
                            autoComplete="postal-code"
                            placeholder="Pincode"
                            className={inputClass}
                          />

                          {pincodeLoading && (
                            <FiLoader
                              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#9A3F4D]"
                              size={18}
                            />
                          )}
                        </div>

                        {pincodeStatus && (
                          <p
                            className={`mt-2 text-xs font-semibold ${
                              pincodeStatus.includes(
                                "automatically"
                              )
                                ? "text-green-700"
                                : "text-amber-700"
                            }`}
                          >
                            {pincodeStatus}
                          </p>
                        )}
                      </div>

                      <input
                        name="house"
                        value={form.house}
                        onChange={handleChange}
                        autoComplete="address-line1"
                        placeholder="House / Flat / Building"
                        className={inputClass}
                      />

                      <input
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                        autoComplete="address-line2"
                        placeholder="Area / Locality"
                        className={`${inputClass} md:col-span-2`}
                      />

                      <input
                        name="landmark"
                        value={form.landmark}
                        onChange={handleChange}
                        placeholder="Landmark (optional)"
                        className={`${inputClass} md:col-span-2`}
                      />

                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        autoComplete="address-level2"
                        placeholder="City"
                        className={inputClass}
                      />

                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        autoComplete="address-level1"
                        placeholder="State"
                        className={inputClass}
                      />
                    </div>

                    <div className="mt-5">
                      <p className="mb-3 text-sm font-bold text-[#5B3B32]">
                        Save address as
                      </p>

                      <div className="grid grid-cols-3 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                        {["Home", "Office", "Other"].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                type,
                              }))
                            }
                            className={`min-h-11 rounded-full border px-3 py-2 text-sm font-bold sm:px-5 ${
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

                    <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-[#5B3B32]">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={form.isDefault}
                        onChange={handleChange}
                        className="h-5 w-5 accent-[#9A3F4D]"
                      />
                      Make this my default address
                    </label>

                    <button
                      type="submit"
                      disabled={saving}
                      className="mt-6 min-h-13 w-full rounded-xl bg-[#9A3F4D] py-4 font-bold text-white transition active:scale-[0.99] hover:bg-[#7d3140] disabled:opacity-60"
                    >
                      {saving
                        ? "SAVING..."
                        : form.id
                        ? "UPDATE ADDRESS"
                        : "SAVE ADDRESS"}
                    </button>
                  </form>
                )}
              </section>

              <aside className="hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm lg:sticky lg:top-28 lg:block">
                <div className="flex items-center gap-3">
                  <FiMapPin
                    className="text-[#9A3F4D]"
                    size={22}
                  />
                  <h2 className="heading-font text-2xl text-[#5B3B32]">
                    Delivery
                  </h2>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#75635c]">
                  Selected address MongoDB me save hoga aur isi address par order deliver kiya jayega.
                </p>

                <div className="mt-6 border-t border-[#eadbd4] pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#75635c]">
                      Order Total
                    </span>
                    <span className="shrink-0 text-xl font-bold text-[#9A3F4D]">
                      ₹
                      {Number(finalTotal || 0).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={continueToPayment}
                  className="mt-6 min-h-13 w-full rounded-xl bg-[#9A3F4D] py-4 font-bold text-white"
                >
                  CONTINUE TO PAYMENT
                </button>
              </aside>
            </div>
          </div>
        </Container>
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-[#eadbd4] bg-[#fffaf7]/96 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(91,59,50,0.12)] backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-[auto_1fr] items-center gap-2.5">
          <div className="min-w-[88px]">
            <p className="text-[8px] font-semibold tracking-[0.13em] text-[#8b746b]">
              TOTAL
            </p>
            <p className="text-base font-bold text-[#9A3F4D]">
              ₹
              {Number(finalTotal || 0).toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={continueToPayment}
            className="min-h-12 min-w-0 rounded-xl bg-[#9A3F4D] px-3 py-3 text-[11px] font-bold text-white active:scale-[0.98] sm:text-sm"
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