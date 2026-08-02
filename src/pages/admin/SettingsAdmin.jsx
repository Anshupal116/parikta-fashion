import { useEffect, useMemo, useRef, useState } from "react";

import {
  getAdminSettings,
  resetAdminSettings,
  updateAdminSettings,
} from "../../services/settingsService";
import { useSettings } from "../../context/SettingsContext";

const defaultSettings = {
  store: {
    storeName: "Parikta Fashion",
    tagline: "Timeless Indian Elegance",
    logoUrl: "",
    faviconUrl: "",
    gstNumber: "",
    panNumber: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
  },
  contact: {
    displayPhone: "+91 9711111111",
    whatsapp: "919711111111",
    supportEmail: "support@pariktafashion.com",
    orderEmail: "orders@pariktafashion.com",
    supportHours: "Monday to Saturday, 10:00 AM - 7:00 PM",
  },
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "Delhi",
    pincode: "",
    country: "India",
    googleMapsUrl: "",
  },
  shipping: {
    freeShippingEnabled: true,
    freeShippingLimit: "999",
    shippingCharge: "80",
    codEnabled: true,
    codCharge: "0",
    estimatedDeliveryMin: "3",
    estimatedDeliveryMax: "7",
    returnWindowDays: "7",
  },
  social: {
    instagram: "https://instagram.com/",
    facebook: "",
    pinterest: "",
    youtube: "",
    twitter: "",
  },
  website: {
    announcementEnabled: true,
    announcementText: "Free shipping on orders above ₹999",
    maintenanceMode: false,
    showWhatsappButton: true,
    showNewsletter: true,
    footerCopyright: `© ${new Date().getFullYear()} Parikta Fashion. All rights reserved.`,
  },
  seo: {
    metaTitle: "Parikta Fashion | Premium Indian Wear",
    metaDescription:
      "Shop premium Indian ethnic wear, sarees, suits and curated fashion at Parikta Fashion.",
    metaKeywords: "Indian fashion, ethnic wear, sarees, suits, Parikta Fashion",
    googleAnalyticsId: "",
    facebookPixelId: "",
    googleVerificationCode: "",
  },
  notifications: {
    orderPlacedEmail: true,
    orderStatusEmail: true,
    lowStockAlert: true,
    lowStockThreshold: "5",
    customerReviewAlert: true,
    newsletterEnabled: true,
  },
};

const tabs = [
  { id: "store", label: "Store" },
  { id: "contact", label: "Contact" },
  { id: "shipping", label: "Shipping" },
  { id: "social", label: "Social" },
  { id: "website", label: "Website" },
  { id: "seo", label: "SEO" },
  { id: "notifications", label: "Notifications" },
  { id: "backup", label: "Backup" },
];

const inputClass =
  "w-full rounded-xl border border-[#eadbd4] bg-white px-4 py-3 text-[#5B3B32] outline-none transition focus:border-[#9A3F4D] focus:ring-2 focus:ring-[#9A3F4D]/10";

const labelClass =
  "mb-2 block text-sm font-semibold text-[#5B3B32]";

const cardClass =
  "rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm";

const clone = (value) => JSON.parse(JSON.stringify(value));

const getAdminToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("parikta_admin_token") ||
  localStorage.getItem("admin_token") ||
  localStorage.getItem("token") ||
  "";

const isValidEmail = (value) =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-[#eadbd4] bg-white p-4">
      <div>
        <p className="font-semibold text-[#5B3B32]">{label}</p>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#8b746b]">
            {description}
          </p>
        )}
      </div>

      <span className="relative mt-1 inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />

        <span className="h-7 w-12 rounded-full bg-[#d8c7bf] transition peer-checked:bg-[#9A3F4D]" />

        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Field({
  label,
  error,
  hint,
  className = "",
  as = "input",
  ...props
}) {
  const Component = as;

  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>

      <Component
        {...props}
        className={`${inputClass} ${
          error ? "border-red-400 focus:border-red-500" : ""
        }`}
      />

      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[#9b857c]">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="heading-font text-3xl text-[#5B3B32]">{title}</h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b746b]">
          {description}
        </p>
      )}
    </div>
  );
}

function SettingsAdmin() {
  const { loadSettings: refreshPublicSettings } = useSettings();

  const [settings, setSettings] = useState(defaultSettings);
  const [savedSnapshot, setSavedSnapshot] = useState(defaultSettings);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("store");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const importInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadAdminSettings = async () => {
      try {
        setInitialLoading(true);

        const token = getAdminToken();
        const response = await getAdminSettings(token);

        if (!active) return;

        if (!response?.success || !response?.settings) {
          throw new Error(
            response?.message || "Settings load failed"
          );
        }

        const incoming = response.settings;

        const merged = {
          store: {
            ...defaultSettings.store,
            ...(incoming.store || {}),
          },
          contact: {
            ...defaultSettings.contact,
            ...(incoming.contact || {}),
          },
          address: {
            ...defaultSettings.address,
            ...(incoming.address || {}),
          },
          shipping: {
            ...defaultSettings.shipping,
            ...(incoming.shipping || {}),
          },
          social: {
            ...defaultSettings.social,
            ...(incoming.social || {}),
          },
          website: {
            ...defaultSettings.website,
            ...(incoming.website || {}),
          },
          seo: {
            ...defaultSettings.seo,
            ...(incoming.seo || {}),
          },
          notifications: {
            ...defaultSettings.notifications,
            ...(incoming.notifications || {}),
          },
        };

        setSettings(merged);
        setSavedSnapshot(clone(merged));
      } catch (error) {
        console.error("Admin settings load error:", error);

        if (active) {
          window.alert(
            error.response?.data?.message ||
              error.message ||
              "Settings load nahi hui"
          );
        }
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    };

    loadAdminSettings();

    return () => {
      active = false;
    };
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSnapshot),
    [settings, savedSnapshot]
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateField = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    const errorKey = `${section}.${field}`;

    setErrors((current) => {
      if (!current[errorKey]) return current;

      const next = { ...current };
      delete next[errorKey];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!settings.store.storeName.trim()) {
      nextErrors["store.storeName"] = "Store name is required";
    }

    if (
      settings.contact.supportEmail &&
      !isValidEmail(settings.contact.supportEmail)
    ) {
      nextErrors["contact.supportEmail"] = "Enter a valid support email";
    }

    if (
      settings.contact.orderEmail &&
      !isValidEmail(settings.contact.orderEmail)
    ) {
      nextErrors["contact.orderEmail"] = "Enter a valid order email";
    }

    [
      ["social.instagram", settings.social.instagram],
      ["social.facebook", settings.social.facebook],
      ["social.pinterest", settings.social.pinterest],
      ["social.youtube", settings.social.youtube],
      ["social.twitter", settings.social.twitter],
      ["address.googleMapsUrl", settings.address.googleMapsUrl],
      ["store.logoUrl", settings.store.logoUrl],
      ["store.faviconUrl", settings.store.faviconUrl],
    ].forEach(([key, value]) => {
      if (!isValidUrl(value)) {
        nextErrors[key] = "Enter a complete URL including https://";
      }
    });

    const nonNegativeFields = [
      ["shipping.freeShippingLimit", settings.shipping.freeShippingLimit],
      ["shipping.shippingCharge", settings.shipping.shippingCharge],
      ["shipping.codCharge", settings.shipping.codCharge],
      ["shipping.returnWindowDays", settings.shipping.returnWindowDays],
      [
        "notifications.lowStockThreshold",
        settings.notifications.lowStockThreshold,
      ],
    ];

    nonNegativeFields.forEach(([key, value]) => {
      if (value !== "" && Number(value) < 0) {
        nextErrors[key] = "Value cannot be negative";
      }
    });

    if (
      Number(settings.shipping.estimatedDeliveryMin || 0) >
      Number(settings.shipping.estimatedDeliveryMax || 0)
    ) {
      nextErrors["shipping.estimatedDeliveryMax"] =
        "Maximum days must be greater than minimum days";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstSection = Object.keys(nextErrors)[0].split(".")[0];
      setActiveTab(firstSection === "address" ? "contact" : firstSection);
      return false;
    }

    return true;
  };

  const saveSettings = async (event) => {
    event?.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);

      const token = getAdminToken();
      const response = await updateAdminSettings(
        settings,
        token
      );

      if (!response?.success || !response?.settings) {
        throw new Error(
          response?.message || "Settings save failed"
        );
      }

      const incoming = response.settings;

      const saved = {
        store: {
          ...defaultSettings.store,
          ...(incoming.store || {}),
        },
        contact: {
          ...defaultSettings.contact,
          ...(incoming.contact || {}),
        },
        address: {
          ...defaultSettings.address,
          ...(incoming.address || {}),
        },
        shipping: {
          ...defaultSettings.shipping,
          ...(incoming.shipping || {}),
        },
        social: {
          ...defaultSettings.social,
          ...(incoming.social || {}),
        },
        website: {
          ...defaultSettings.website,
          ...(incoming.website || {}),
        },
        seo: {
          ...defaultSettings.seo,
          ...(incoming.seo || {}),
        },
        notifications: {
          ...defaultSettings.notifications,
          ...(incoming.notifications || {}),
        },
      };

      setSettings(saved);
      setSavedSnapshot(clone(saved));
      setToast("Settings saved successfully");

      await refreshPublicSettings();
    } catch (error) {
      console.error("Settings save error:", error);

      const apiErrors =
        error.response?.data?.errors || {};

      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);

        const firstSection =
          Object.keys(apiErrors)[0].split(".")[0];

        setActiveTab(
          firstSection === "address"
            ? "contact"
            : firstSection
        );
      }

      window.alert(
        error.response?.data?.message ||
          error.message ||
          "Settings save nahi ho paayi"
      );
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    const confirmed = window.confirm(
      "All settings ko default values par reset karna hai?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const token = getAdminToken();
      const response = await resetAdminSettings(token);

      if (!response?.success || !response?.settings) {
        throw new Error(
          response?.message || "Settings reset failed"
        );
      }

      const incoming = response.settings;

      const next = {
        store: {
          ...defaultSettings.store,
          ...(incoming.store || {}),
        },
        contact: {
          ...defaultSettings.contact,
          ...(incoming.contact || {}),
        },
        address: {
          ...defaultSettings.address,
          ...(incoming.address || {}),
        },
        shipping: {
          ...defaultSettings.shipping,
          ...(incoming.shipping || {}),
        },
        social: {
          ...defaultSettings.social,
          ...(incoming.social || {}),
        },
        website: {
          ...defaultSettings.website,
          ...(incoming.website || {}),
        },
        seo: {
          ...defaultSettings.seo,
          ...(incoming.seo || {}),
        },
        notifications: {
          ...defaultSettings.notifications,
          ...(incoming.notifications || {}),
        },
      };

      setSettings(next);
      setSavedSnapshot(clone(next));
      setErrors({});
      setActiveTab("store");
      setToast("Default settings restored");

      await refreshPublicSettings();
    } catch (error) {
      console.error("Settings reset error:", error);

      window.alert(
        error.response?.data?.message ||
          error.message ||
          "Settings reset nahi hui"
      );
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    if (!isDirty) return;

    const confirmed = window.confirm("Unsaved changes discard karni hain?");
    if (!confirmed) return;

    setSettings(clone(savedSnapshot));
    setErrors({});
    setToast("Unsaved changes discarded");
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `parikta-settings-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setToast("Settings exported");
  };

  const importSettings = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid settings file");
      }

      const merged = {
        store: { ...defaultSettings.store, ...(parsed.store || {}) },
        contact: { ...defaultSettings.contact, ...(parsed.contact || {}) },
        address: { ...defaultSettings.address, ...(parsed.address || {}) },
        shipping: { ...defaultSettings.shipping, ...(parsed.shipping || {}) },
        social: { ...defaultSettings.social, ...(parsed.social || {}) },
        website: { ...defaultSettings.website, ...(parsed.website || {}) },
        seo: { ...defaultSettings.seo, ...(parsed.seo || {}) },
        notifications: {
          ...defaultSettings.notifications,
          ...(parsed.notifications || {}),
        },
      };

      setSettings(merged);
      setErrors({});
      setToast("Settings imported. Save to MongoDB to apply.");
    } catch (error) {
      console.error("Settings import error:", error);
      window.alert("Invalid settings JSON file");
    } finally {
      event.target.value = "";
    }
  };

  const renderStoreTab = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <SectionHeader
          title="Store Identity"
          description="Store ki public branding aur basic business information manage karo."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Store Name"
            value={settings.store.storeName}
            onChange={(event) =>
              updateField("store", "storeName", event.target.value)
            }
            error={errors["store.storeName"]}
            placeholder="Parikta Fashion"
          />

          <Field
            label="Store Tagline"
            value={settings.store.tagline}
            onChange={(event) =>
              updateField("store", "tagline", event.target.value)
            }
            placeholder="Timeless Indian Elegance"
          />

          <Field
            label="Logo URL"
            value={settings.store.logoUrl}
            onChange={(event) =>
              updateField("store", "logoUrl", event.target.value)
            }
            error={errors["store.logoUrl"]}
            placeholder="https://..."
            hint="Public image URL use karo."
          />

          <Field
            label="Favicon URL"
            value={settings.store.faviconUrl}
            onChange={(event) =>
              updateField("store", "faviconUrl", event.target.value)
            }
            error={errors["store.faviconUrl"]}
            placeholder="https://..."
          />

          <Field
            label="GST Number"
            value={settings.store.gstNumber}
            onChange={(event) =>
              updateField(
                "store",
                "gstNumber",
                event.target.value.toUpperCase()
              )
            }
            placeholder="07ABCDE1234F1Z5"
          />

          <Field
            label="PAN Number"
            value={settings.store.panNumber}
            onChange={(event) =>
              updateField(
                "store",
                "panNumber",
                event.target.value.toUpperCase()
              )
            }
            placeholder="ABCDE1234F"
          />

          <div>
            <label className={labelClass}>Currency</label>

            <select
              value={settings.store.currency}
              onChange={(event) =>
                updateField("store", "currency", event.target.value)
              }
              className={inputClass}
            >
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="AED">AED - UAE Dirham</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Timezone</label>

            <select
              value={settings.store.timezone}
              onChange={(event) =>
                updateField("store", "timezone", event.target.value)
              }
              className={inputClass}
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeader
          title="Brand Preview"
          description="Saved branding website header ya footer me isi form me use ho sakti hai."
        />

        <div className="rounded-3xl border border-[#eadbd4] bg-gradient-to-br from-[#FDEAE6] to-white p-6">
          <div className="flex items-center gap-4">
            {settings.store.logoUrl ? (
              <img
                src={settings.store.logoUrl}
                alt={settings.store.storeName}
                className="h-16 w-16 rounded-2xl border border-[#eadbd4] bg-white object-contain p-2"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9A3F4D] text-2xl font-bold text-white">
                {settings.store.storeName?.charAt(0) || "P"}
              </div>
            )}

            <div>
              <h3 className="heading-font text-3xl text-[#5B3B32]">
                {settings.store.storeName || "Your Store"}
              </h3>

              <p className="mt-1 text-[#8b746b]">
                {settings.store.tagline || "Your store tagline"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <SectionHeader
          title="Contact Details"
          description="Customer support, order communication aur WhatsApp details."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Display Phone Number"
            value={settings.contact.displayPhone}
            onChange={(event) =>
              updateField("contact", "displayPhone", event.target.value)
            }
            placeholder="+91 9711111111"
          />

          <Field
            label="WhatsApp Number"
            value={settings.contact.whatsapp}
            onChange={(event) =>
              updateField(
                "contact",
                "whatsapp",
                event.target.value.replace(/[^\d]/g, "")
              )
            }
            placeholder="919711111111"
            hint="Country code ke saath, + sign ke bina."
          />

          <Field
            label="Support Email"
            type="email"
            value={settings.contact.supportEmail}
            onChange={(event) =>
              updateField("contact", "supportEmail", event.target.value)
            }
            error={errors["contact.supportEmail"]}
            placeholder="support@pariktafashion.com"
          />

          <Field
            label="Order Email"
            type="email"
            value={settings.contact.orderEmail}
            onChange={(event) =>
              updateField("contact", "orderEmail", event.target.value)
            }
            error={errors["contact.orderEmail"]}
            placeholder="orders@pariktafashion.com"
          />

          <Field
            label="Customer Care Timing"
            value={settings.contact.supportHours}
            onChange={(event) =>
              updateField("contact", "supportHours", event.target.value)
            }
            className="md:col-span-2"
            placeholder="Monday to Saturday, 10:00 AM - 7:00 PM"
          />
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeader
          title="Business Address"
          description="Invoice, contact page aur footer ke liye address details."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Address Line 1"
            value={settings.address.line1}
            onChange={(event) =>
              updateField("address", "line1", event.target.value)
            }
            className="md:col-span-2"
            placeholder="Shop / Building / Street"
          />

          <Field
            label="Address Line 2"
            value={settings.address.line2}
            onChange={(event) =>
              updateField("address", "line2", event.target.value)
            }
            className="md:col-span-2"
            placeholder="Area / Landmark"
          />

          <Field
            label="City"
            value={settings.address.city}
            onChange={(event) =>
              updateField("address", "city", event.target.value)
            }
            placeholder="Delhi"
          />

          <Field
            label="State"
            value={settings.address.state}
            onChange={(event) =>
              updateField("address", "state", event.target.value)
            }
            placeholder="Delhi"
          />

          <Field
            label="Pincode"
            value={settings.address.pincode}
            onChange={(event) =>
              updateField(
                "address",
                "pincode",
                event.target.value.replace(/[^\d]/g, "").slice(0, 6)
              )
            }
            placeholder="110001"
          />

          <Field
            label="Country"
            value={settings.address.country}
            onChange={(event) =>
              updateField("address", "country", event.target.value)
            }
            placeholder="India"
          />

          <Field
            label="Google Maps URL"
            value={settings.address.googleMapsUrl}
            onChange={(event) =>
              updateField("address", "googleMapsUrl", event.target.value)
            }
            error={errors["address.googleMapsUrl"]}
            className="md:col-span-2"
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>
    </div>
  );

  const renderShippingTab = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <SectionHeader
          title="Shipping Rules"
          description="Checkout par apply hone wale shipping aur COD rules."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Toggle
            label="Free Shipping"
            description="Order limit complete hone par shipping free karo."
            checked={settings.shipping.freeShippingEnabled}
            onChange={(value) =>
              updateField("shipping", "freeShippingEnabled", value)
            }
          />

          <Toggle
            label="Cash on Delivery"
            description="Customers ko COD payment option dikhaye."
            checked={settings.shipping.codEnabled}
            onChange={(value) =>
              updateField("shipping", "codEnabled", value)
            }
          />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field
            label="Free Shipping Limit (₹)"
            type="number"
            min="0"
            value={settings.shipping.freeShippingLimit}
            onChange={(event) =>
              updateField(
                "shipping",
                "freeShippingLimit",
                event.target.value
              )
            }
            error={errors["shipping.freeShippingLimit"]}
            disabled={!settings.shipping.freeShippingEnabled}
          />

          <Field
            label="Standard Shipping Charge (₹)"
            type="number"
            min="0"
            value={settings.shipping.shippingCharge}
            onChange={(event) =>
              updateField("shipping", "shippingCharge", event.target.value)
            }
            error={errors["shipping.shippingCharge"]}
          />

          <Field
            label="COD Charge (₹)"
            type="number"
            min="0"
            value={settings.shipping.codCharge}
            onChange={(event) =>
              updateField("shipping", "codCharge", event.target.value)
            }
            error={errors["shipping.codCharge"]}
            disabled={!settings.shipping.codEnabled}
          />

          <Field
            label="Return Window (Days)"
            type="number"
            min="0"
            value={settings.shipping.returnWindowDays}
            onChange={(event) =>
              updateField(
                "shipping",
                "returnWindowDays",
                event.target.value
              )
            }
            error={errors["shipping.returnWindowDays"]}
          />

          <Field
            label="Minimum Delivery Days"
            type="number"
            min="0"
            value={settings.shipping.estimatedDeliveryMin}
            onChange={(event) =>
              updateField(
                "shipping",
                "estimatedDeliveryMin",
                event.target.value
              )
            }
          />

          <Field
            label="Maximum Delivery Days"
            type="number"
            min="0"
            value={settings.shipping.estimatedDeliveryMax}
            onChange={(event) =>
              updateField(
                "shipping",
                "estimatedDeliveryMax",
                event.target.value
              )
            }
            error={errors["shipping.estimatedDeliveryMax"]}
          />
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeader title="Checkout Preview" />

        <div className="rounded-2xl border border-[#eadbd4] bg-white p-5 text-sm text-[#5B3B32]">
          <div className="flex justify-between gap-4 border-b border-[#f0e5df] pb-3">
            <span>Standard Shipping</span>
            <strong>
              {Number(settings.shipping.shippingCharge || 0) === 0
                ? "Free"
                : `₹${settings.shipping.shippingCharge}`}
            </strong>
          </div>

          {settings.shipping.freeShippingEnabled && (
            <div className="flex justify-between gap-4 border-b border-[#f0e5df] py-3">
              <span>Free Shipping</span>
              <strong>
                Above ₹{settings.shipping.freeShippingLimit || 0}
              </strong>
            </div>
          )}

          {settings.shipping.codEnabled && (
            <div className="flex justify-between gap-4 pt-3">
              <span>Cash on Delivery</span>
              <strong>
                {Number(settings.shipping.codCharge || 0) === 0
                  ? "No extra charge"
                  : `₹${settings.shipping.codCharge}`}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className={cardClass}>
      <SectionHeader
        title="Social Media Links"
        description="Footer aur contact sections me dikhne wale social profiles."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {[
          ["instagram", "Instagram"],
          ["facebook", "Facebook"],
          ["pinterest", "Pinterest"],
          ["youtube", "YouTube"],
          ["twitter", "Twitter / X"],
        ].map(([field, label]) => (
          <Field
            key={field}
            label={label}
            value={settings.social[field]}
            onChange={(event) =>
              updateField("social", field, event.target.value)
            }
            error={errors[`social.${field}`]}
            placeholder={`https://${field}.com/...`}
            className={field === "twitter" ? "md:col-span-2" : ""}
          />
        ))}
      </div>
    </div>
  );

  const renderWebsiteTab = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <SectionHeader
          title="Website Controls"
          description="Storefront ke common display aur availability options."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Toggle
            label="Announcement Bar"
            description="Website ke top par promotional message dikhaye."
            checked={settings.website.announcementEnabled}
            onChange={(value) =>
              updateField("website", "announcementEnabled", value)
            }
          />

          <Toggle
            label="Maintenance Mode"
            description="Storefront temporarily unavailable show kare."
            checked={settings.website.maintenanceMode}
            onChange={(value) =>
              updateField("website", "maintenanceMode", value)
            }
          />

          <Toggle
            label="WhatsApp Floating Button"
            description="Customers ko quick WhatsApp contact option de."
            checked={settings.website.showWhatsappButton}
            onChange={(value) =>
              updateField("website", "showWhatsappButton", value)
            }
          />

          <Toggle
            label="Newsletter Section"
            description="Homepage ya footer me newsletter signup dikhaye."
            checked={settings.website.showNewsletter}
            onChange={(value) =>
              updateField("website", "showNewsletter", value)
            }
          />
        </div>

        <div className="mt-6 grid gap-5">
          <Field
            label="Announcement Text"
            value={settings.website.announcementText}
            onChange={(event) =>
              updateField(
                "website",
                "announcementText",
                event.target.value
              )
            }
            disabled={!settings.website.announcementEnabled}
            placeholder="Free shipping on orders above ₹999"
          />

          <Field
            label="Footer Copyright"
            value={settings.website.footerCopyright}
            onChange={(event) =>
              updateField(
                "website",
                "footerCopyright",
                event.target.value
              )
            }
          />
        </div>
      </div>

      {settings.website.maintenanceMode && (
        <div className="rounded-3xl border border-yellow-300 bg-yellow-50 p-5">
          <h3 className="font-bold text-yellow-800">
            Maintenance mode enabled
          </h3>

          <p className="mt-1 text-sm leading-6 text-yellow-700">
            Is frontend me maintenance mode tabhi kaam karega jab storefront
            isi saved setting ko read karega.
          </p>
        </div>
      )}
    </div>
  );

  const renderSeoTab = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <SectionHeader
          title="Search Engine Settings"
          description="Default homepage metadata aur tracking identifiers."
        />

        <div className="grid gap-5">
          <Field
            label="Meta Title"
            value={settings.seo.metaTitle}
            onChange={(event) =>
              updateField("seo", "metaTitle", event.target.value.slice(0, 70))
            }
            hint={`${settings.seo.metaTitle.length}/70 characters`}
          />

          <Field
            as="textarea"
            rows="4"
            label="Meta Description"
            value={settings.seo.metaDescription}
            onChange={(event) =>
              updateField(
                "seo",
                "metaDescription",
                event.target.value.slice(0, 180)
              )
            }
            hint={`${settings.seo.metaDescription.length}/180 characters`}
          />

          <Field
            as="textarea"
            rows="3"
            label="Meta Keywords"
            value={settings.seo.metaKeywords}
            onChange={(event) =>
              updateField("seo", "metaKeywords", event.target.value)
            }
            placeholder="Indian fashion, ethnic wear, sarees"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Google Analytics ID"
              value={settings.seo.googleAnalyticsId}
              onChange={(event) =>
                updateField(
                  "seo",
                  "googleAnalyticsId",
                  event.target.value
                )
              }
              placeholder="G-XXXXXXXXXX"
            />

            <Field
              label="Facebook Pixel ID"
              value={settings.seo.facebookPixelId}
              onChange={(event) =>
                updateField(
                  "seo",
                  "facebookPixelId",
                  event.target.value
                )
              }
              placeholder="1234567890"
            />
          </div>

          <Field
            label="Google Verification Code"
            value={settings.seo.googleVerificationCode}
            onChange={(event) =>
              updateField(
                "seo",
                "googleVerificationCode",
                event.target.value
              )
            }
            placeholder="Verification meta content value"
          />
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeader title="Google Preview" />

        <div className="max-w-2xl rounded-2xl border border-[#eadbd4] bg-white p-5">
          <p className="text-sm text-green-700">
            pariktafashion.com
          </p>

          <h3 className="mt-1 text-xl font-medium text-blue-700">
            {settings.seo.metaTitle || settings.store.storeName}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {settings.seo.metaDescription ||
              "Your homepage description will appear here."}
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className={cardClass}>
      <SectionHeader
        title="Notification Preferences"
        description="Admin aur customer communication ke basic toggles."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Toggle
          label="Order Placed Email"
          description="New order place hone par customer email."
          checked={settings.notifications.orderPlacedEmail}
          onChange={(value) =>
            updateField("notifications", "orderPlacedEmail", value)
          }
        />

        <Toggle
          label="Order Status Email"
          description="Order status change par customer update."
          checked={settings.notifications.orderStatusEmail}
          onChange={(value) =>
            updateField("notifications", "orderStatusEmail", value)
          }
        />

        <Toggle
          label="Low Stock Alert"
          description="Product stock threshold ke neeche aane par admin alert."
          checked={settings.notifications.lowStockAlert}
          onChange={(value) =>
            updateField("notifications", "lowStockAlert", value)
          }
        />

        <Toggle
          label="Customer Review Alert"
          description="New product review submit hone par admin alert."
          checked={settings.notifications.customerReviewAlert}
          onChange={(value) =>
            updateField("notifications", "customerReviewAlert", value)
          }
        />

        <Toggle
          label="Newsletter Enabled"
          description="Newsletter marketing option active rakho."
          checked={settings.notifications.newsletterEnabled}
          onChange={(value) =>
            updateField("notifications", "newsletterEnabled", value)
          }
        />
      </div>

      <div className="mt-6 max-w-md">
        <Field
          label="Low Stock Threshold"
          type="number"
          min="0"
          value={settings.notifications.lowStockThreshold}
          onChange={(event) =>
            updateField(
              "notifications",
              "lowStockThreshold",
              event.target.value
            )
          }
          error={errors["notifications.lowStockThreshold"]}
          disabled={!settings.notifications.lowStockAlert}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-[#eadbd4] bg-[#FDEAE6] p-4">
        <p className="text-sm leading-6 text-[#5B3B32]">
          Email aur alert toggles MongoDB me save honge. In toggles ke according
          actual emails aur alerts control karne ke liye order/review backend
          services ko settings document read karna hoga.
        </p>
      </div>
    </div>
  );

  const renderBackupTab = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <SectionHeader
          title="Settings Backup"
          description="Current settings ka JSON backup download ya restore karo."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={exportSettings}
            className="rounded-2xl border border-[#9A3F4D] bg-white px-5 py-4 font-bold text-[#9A3F4D]"
          >
            Export JSON
          </button>

          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="rounded-2xl bg-[#5B3B32] px-5 py-4 font-bold text-white"
          >
            Import JSON
          </button>

          <button
            type="button"
            onClick={resetSettings}
            className="rounded-2xl bg-red-500 px-5 py-4 font-bold text-white"
          >
            Reset Defaults
          </button>

          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={importSettings}
            className="hidden"
          />
        </div>
      </div>

      <div className={cardClass}>
        <SectionHeader title="Storage Information" />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-[#9b857c]">
              Storage
            </p>
            <p className="mt-2 font-bold text-[#5B3B32]">MongoDB API</p>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-[#9b857c]">
              Status
            </p>
            <p className="mt-2 font-bold text-[#5B3B32]">
              {isDirty ? "Unsaved Changes" : "Saved"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-[#9b857c]">
              Endpoint
            </p>
            <p className="mt-2 break-all font-mono text-sm text-[#5B3B32]">
              /api/admin/settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent = {
    store: renderStoreTab,
    contact: renderContactTab,
    shipping: renderShippingTab,
    social: renderSocialTab,
    website: renderWebsiteTab,
    seo: renderSeoTab,
    notifications: renderNotificationsTab,
    backup: renderBackupTab,
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#eadbd4] border-t-[#9A3F4D]" />
          <h2 className="heading-font mt-4 text-3xl text-[#5B3B32]">
            Loading Settings...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {toast && (
        <div className="fixed right-5 top-5 z-[500] rounded-2xl bg-[#5B3B32] px-5 py-4 font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#BFA996]">
            Administration
          </p>

          <h1 className="heading-font mt-1 text-4xl text-[#5B3B32]">
            Store Settings
          </h1>

          <p className="mt-2 text-[#8b746b]">
            Store details, shipping, website controls and SEO manage karo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isDirty
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isDirty ? "Unsaved Changes" : "All Changes Saved"}
          </span>

          <button
            type="button"
            onClick={discardChanges}
            disabled={!isDirty || saving}
            className="rounded-xl border border-[#9A3F4D] bg-white px-5 py-3 font-semibold text-[#9A3F4D] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving || !isDirty}
            className="rounded-xl bg-[#9A3F4D] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-3 shadow-sm xl:sticky xl:top-5">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#9A3F4D] text-white shadow"
                    : "text-[#5B3B32] hover:bg-[#FDEAE6]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main>{tabContent[activeTab]()}</main>
      </div>

      {isDirty && (
        <div className="fixed bottom-5 left-1/2 z-[450] flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 flex-col gap-3 rounded-2xl border border-[#eadbd4] bg-white p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-[#5B3B32]">You have unsaved changes</p>
            <p className="text-sm text-[#8b746b]">
              Settings apply karne ke liye save karo.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={discardChanges}
              disabled={saving}
              className="rounded-xl border border-[#9A3F4D] px-4 py-2 font-semibold text-[#9A3F4D]"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="rounded-xl bg-[#9A3F4D] px-5 py-2 font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsAdmin;