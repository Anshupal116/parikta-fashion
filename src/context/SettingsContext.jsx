import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getPublicSettings } from "../services/settingsService";

const SettingsContext = createContext(null);

const defaultSettings = {
  store: {
    storeName: "Parikta Fashion",
    tagline: "Timeless Indian Elegance",
    logoUrl: "",
    faviconUrl: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
  },

  contact: {
    displayPhone: "+91 9711111111",
    whatsapp: "919711111111",
    supportEmail: "support@pariktafashion.com",
    orderEmail: "orders@pariktafashion.com",
    supportHours:
      "Monday to Saturday, 10:00 AM - 7:00 PM",
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
    freeShippingLimit: 999,
    shippingCharge: 80,
    codEnabled: true,
    codCharge: 0,
    estimatedDeliveryMin: 3,
    estimatedDeliveryMax: 7,
    returnWindowDays: 7,
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
    announcementText:
      "Free shipping on orders above ₹999",
    maintenanceMode: false,
    showWhatsappButton: true,
    showNewsletter: true,
    footerCopyright: `© ${new Date().getFullYear()} Parikta Fashion. All rights reserved.`,
  },

  seo: {
    metaTitle:
      "Parikta Fashion | Premium Indian Wear",
    metaDescription:
      "Shop premium Indian ethnic wear, sarees, suits and curated fashion at Parikta Fashion.",
    metaKeywords:
      "Indian fashion, ethnic wear, sarees, suits, Parikta Fashion",
    googleAnalyticsId: "",
    facebookPixelId: "",
    googleVerificationCode: "",
  },
};

const mergeSettings = (incoming = {}) => ({
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
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError("");

      const response = await getPublicSettings();

      if (!response?.success || !response?.settings) {
        throw new Error(
          response?.message ||
            "Website settings load failed"
        );
      }

      setSettings(
        mergeSettings(response.settings)
      );

      return {
        success: true,
        settings: response.settings,
      };
    } catch (error) {
      console.error(
        "Public settings load error:",
        error
      );

      setSettings(defaultSettings);
      setSettingsError(
        error.response?.data?.message ||
          error.message ||
          "Website settings load failed"
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Website settings load failed",
      };
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const faviconUrl =
      settings.store?.faviconUrl;

    if (!faviconUrl) return;

    let favicon = document.querySelector(
      'link[rel="icon"]'
    );

    if (!favicon) {
      favicon =
        document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = faviconUrl;
  }, [settings.store?.faviconUrl]);

  useEffect(() => {
    const title =
      settings.seo?.metaTitle ||
      settings.store?.storeName;

    if (title) {
      document.title = title;
    }

    const updateMeta = (
      name,
      content
    ) => {
      if (!content) return;

      let element =
        document.querySelector(
          `meta[name="${name}"]`
        );

      if (!element) {
        element =
          document.createElement("meta");
        element.setAttribute(
          "name",
          name
        );
        document.head.appendChild(
          element
        );
      }

      element.setAttribute(
        "content",
        content
      );
    };

    updateMeta(
      "description",
      settings.seo?.metaDescription
    );

    updateMeta(
      "keywords",
      settings.seo?.metaKeywords
    );
  }, [
    settings.seo?.metaTitle,
    settings.seo?.metaDescription,
    settings.seo?.metaKeywords,
    settings.store?.storeName,
  ]);

  const formattedAddress = useMemo(() => {
    return [
      settings.address?.line1,
      settings.address?.line2,
      settings.address?.city,
      settings.address?.state,
      settings.address?.pincode,
      settings.address?.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [settings.address]);

  const whatsappUrl = useMemo(() => {
    const number = String(
      settings.contact?.whatsapp || ""
    ).replace(/\D/g, "");

    return number
      ? `https://wa.me/${number}`
      : "";
  }, [settings.contact?.whatsapp]);

  const value = {
    settings,
    settingsLoading,
    settingsError,
    loadSettings,
    setSettings,

    store: settings.store,
    contact: settings.contact,
    address: settings.address,
    shipping: settings.shipping,
    social: settings.social,
    website: settings.website,
    seo: settings.seo,

    formattedAddress,
    whatsappUrl,
  };

  return (
    <SettingsContext.Provider
      value={value}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context =
    useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}

export { defaultSettings };