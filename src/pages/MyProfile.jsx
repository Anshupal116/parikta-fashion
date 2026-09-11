import { useEffect, useState } from "react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPackage,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiHome,
  FiEdit2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

import { useCustomer } from "../context/CustomerContext";

function MyProfile() {
  const navigate = useNavigate();

  const {
    customer,
    token,
    isLoggedIn,
    authLoading,

    addresses,
    addressesLoading,

    loadAddresses,
    deleteAddress,
    setDefaultAddress,

    logoutCustomer,
  } = useCustomer();

  const [deletingId, setDeletingId] =
    useState(null);

  const [defaultLoadingId, setDefaultLoadingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  // =====================================
  // AUTH CHECK
  // =====================================

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !token) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/profile",
        },
      });

      return;
    }

    loadAddresses();
  }, [
    authLoading,
    isLoggedIn,
    token,
    navigate,
  ]);

  // =====================================
  // DELETE ADDRESS
  // =====================================

  const handleDeleteAddress = async (
    address
  ) => {
    const id =
      address._id || address.id;

    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");

      const response =
        await deleteAddress(id);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Address delete failed"
        );
      }

      setMessage(
        "Address deleted successfully."
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to delete address."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================
  // SET DEFAULT ADDRESS
  // =====================================

  const handleSetDefault = async (
    address
  ) => {
    const id =
      address._id || address.id;

    if (!id) return;

    try {
      setDefaultLoadingId(id);
      setMessage("");

      const response =
        await setDefaultAddress(id);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to set default address"
        );
      }

      await loadAddresses();

      setMessage(
        "Default address updated."
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to update default address."
      );
    } finally {
      setDefaultLoadingId(null);
    }
  };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    logoutCustomer();

    navigate("/", {
      replace: true,
    });
  };

  // =====================================
  // LOADING
  // =====================================

  if (
    authLoading ||
    !customer
  ) {
    return (
      <div className="min-h-screen bg-[#f7f2ee]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

            <p className="mt-4 text-sm font-semibold text-[#75635c]">
              Loading profile...
            </p>

          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f2ee] pb-16 pt-6 sm:pt-10">

        <Container>

          <div className="mx-auto max-w-6xl">

            {/* =====================================
                HEADER
            ===================================== */}

            <div className="mb-7">

              <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                MY ACCOUNT
              </p>

              <h1 className="heading-font mt-1 text-4xl text-[#5B3B32] sm:text-5xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#75635c]">
                Manage your profile, saved
                addresses and orders from one
                place.
              </p>

            </div>

            {/* =====================================
                MESSAGE
            ===================================== */}

            {message && (
              <div className="mb-6 rounded-2xl border border-[#eadbd4] bg-white px-5 py-4 text-sm font-semibold text-[#5B3B32] shadow-sm">
                {message}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">

              {/* =====================================
                  LEFT PROFILE CARD
              ===================================== */}

              <aside className="h-fit rounded-[28px] border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">

                {/* AVATAR */}

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D]">

                    <FiUser
                      size={40}
                    />

                  </div>

                  <h2 className="heading-font mt-5 text-3xl text-[#5B3B32]">
                    {customer.name ||
                      "Customer"}
                  </h2>

                  <p className="mt-1 text-sm text-[#8b746b]">
                    Parikta Fashion
                    Customer
                  </p>

                </div>

                {/* PROFILE DETAILS */}

                <div className="mt-7 space-y-4">

                  {/* PHONE */}

                  <div className="flex gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEAE6] text-[#9A3F4D]">
                      <FiPhone />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#BFA996]">
                        MOBILE
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-[#5B3B32]">
                        {customer.phone ||
                          customer.mobile ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="flex gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEAE6] text-[#9A3F4D]">
                      <FiMail />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#BFA996]">
                        EMAIL
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-[#5B3B32]">
                        {customer.email ||
                          "Not added"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* PROFILE BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/profile/edit"
                    )
                  }
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-[#9A3F4D] bg-white py-3 text-sm font-bold text-[#9A3F4D] transition hover:bg-[#FDEAE6]"
                >
                  <FiEdit2 size={16} />
                  Edit Profile
                </button>

                {/* ORDERS */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/orders")
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9A3F4D] py-3 text-sm font-bold text-white transition hover:bg-[#7f1d2d]"
                >
                  <FiPackage size={17} />
                  My Orders
                </button>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#8b746b] transition hover:bg-[#FDEAE6] hover:text-[#9A3F4D]"
                >
                  <FiLogOut size={17} />
                  Logout
                </button>

              </aside>

              {/* =====================================
                  RIGHT CONTENT
              ===================================== */}

              <section className="space-y-6">

                {/* =====================================
                    ACCOUNT OVERVIEW
                ===================================== */}

                <div className="rounded-[28px] border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm sm:p-7">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                        ACCOUNT
                      </p>

                      <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                        Account Overview
                      </h2>

                    </div>

                    <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D] sm:flex">
                      <FiUser size={21} />
                    </div>

                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl bg-[#f7f2ee] p-4">

                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#BFA996]">
                        NAME
                      </p>

                      <p className="mt-2 font-bold text-[#5B3B32]">
                        {customer.name ||
                          "Not available"}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-[#f7f2ee] p-4">

                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#BFA996]">
                        PHONE
                      </p>

                      <p className="mt-2 font-bold text-[#5B3B32]">
                        {customer.phone ||
                          customer.mobile ||
                          "Not available"}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-[#f7f2ee] p-4 sm:col-span-2">

                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#BFA996]">
                        EMAIL
                      </p>

                      <p className="mt-2 break-words font-bold text-[#5B3B32]">
                        {customer.email ||
                          "Email not added"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* =====================================
                    ADDRESSES
                ===================================== */}

                <div className="rounded-[28px] border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm sm:p-7">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-semibold tracking-[0.18em] text-[#BFA996]">
                        DELIVERY
                      </p>

                      <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                        My Addresses
                      </h2>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/checkout/address"
                        )
                      }
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-[#9A3F4D] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#7f1d2d] sm:text-sm"
                    >
                      <FiPlus size={16} />
                      <span className="hidden sm:inline">
                        Add Address
                      </span>
                      <span className="sm:hidden">
                        Add
                      </span>
                    </button>

                  </div>

                  {/* ADDRESS LOADING */}

                  {addressesLoading ? (
                    <div className="flex justify-center py-12">

                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />

                    </div>
                  ) : addresses.length ===
                    0 ? (

                    /* EMPTY */

                    <div className="mt-6 rounded-2xl border border-dashed border-[#d9c7be] bg-[#f7f2ee] px-5 py-10 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#9A3F4D]">
                        <FiMapPin
                          size={24}
                        />
                      </div>

                      <h3 className="mt-4 font-bold text-[#5B3B32]">
                        No saved addresses
                      </h3>

                      <p className="mt-1 text-sm text-[#75635c]">
                        Add an address for
                        faster checkout.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/checkout/address"
                          )
                        }
                        className="mt-5 rounded-xl bg-[#9A3F4D] px-5 py-3 text-sm font-bold text-white"
                      >
                        Add Your First Address
                      </button>

                    </div>
                  ) : (

                    /* ADDRESS LIST */

                    <div className="mt-6 grid gap-4">

                      {addresses.map(
                        (address) => {

                          const id =
                            address._id ||
                            address.id;

                          const isDefault =
                            address.isDefault ||
                            address.default ||
                            address.is_default;

                          return (
                            <div
                              key={id}
                              className={`rounded-2xl border p-4 transition sm:p-5 ${
                                isDefault
                                  ? "border-[#9A3F4D] bg-[#FDEAE6]/50"
                                  : "border-[#eadbd4] bg-white"
                              }`}
                            >

                              <div className="flex items-start gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEAE6] text-[#9A3F4D]">

                                  {isDefault ? (
                                    <FiHome />
                                  ) : (
                                    <FiMapPin />
                                  )}

                                </div>

                                <div className="min-w-0 flex-1">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="font-bold text-[#5B3B32]">
                                      {address.name ||
                                        customer.name ||
                                        "Address"}
                                    </h3>

                                    {isDefault && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-[#9A3F4D] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                                        <FiCheck
                                          size={11}
                                        />
                                        Default
                                      </span>
                                    )}

                                  </div>

                                  <p className="mt-2 text-sm leading-6 text-[#75635c]">

                                    {address.house &&
                                      `${address.house}, `}

                                    {address.area &&
                                      `${address.area}, `}

                                    {address.landmark &&
                                      `${address.landmark}, `}

                                    {address.city},{" "}
                                    {
                                      address.state
                                    }{" "}
                                    -{" "}
                                    {
                                      address.pincode
                                    }

                                  </p>

                                  {address.phone && (
                                    <p className="mt-2 text-xs font-semibold text-[#5B3B32]">
                                      Mobile:{" "}
                                      {
                                        address.phone
                                      }
                                    </p>
                                  )}

                                </div>

                              </div>

                              {/* ADDRESS ACTIONS */}

                              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eadbd4] pt-4">

                                {!isDefault && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSetDefault(
                                        address
                                      )
                                    }
                                    disabled={
                                      defaultLoadingId ===
                                      id
                                    }
                                    className="rounded-lg border border-[#9A3F4D] bg-white px-3 py-2 text-xs font-bold text-[#9A3F4D] disabled:opacity-50"
                                  >
                                    {defaultLoadingId ===
                                    id
                                      ? "Updating..."
                                      : "Set Default"}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      "/checkout/address"
                                    )
                                  }
                                  className="flex items-center gap-1 rounded-lg bg-[#f7f2ee] px-3 py-2 text-xs font-bold text-[#5B3B32]"
                                >
                                  <FiEdit2
                                    size={13}
                                  />
                                  Manage
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteAddress(
                                      address
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    id
                                  }
                                  className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50"
                                >
                                  <FiTrash2
                                    size={13}
                                  />

                                  {deletingId ===
                                  id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>

                {/* =====================================
                    ORDERS CARD
                ===================================== */}

                <div className="rounded-[28px] border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm sm:p-7">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDEAE6] text-[#9A3F4D]">
                      <FiPackage
                        size={21}
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-xs font-semibold tracking-[0.16em] text-[#BFA996]">
                        SHOPPING
                      </p>

                      <h2 className="heading-font mt-1 text-2xl text-[#5B3B32]">
                        My Orders
                      </h2>

                      <p className="mt-1 text-sm text-[#75635c]">
                        Track and manage your
                        previous orders.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/orders"
                        )
                      }
                      className="hidden rounded-xl bg-[#9A3F4D] px-4 py-3 text-sm font-bold text-white sm:block"
                    >
                      View Orders
                    </button>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/orders")
                    }
                    className="mt-5 w-full rounded-xl bg-[#9A3F4D] py-3 text-sm font-bold text-white sm:hidden"
                  >
                    View My Orders
                  </button>

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

export default MyProfile;