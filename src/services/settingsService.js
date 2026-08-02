import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const publicSettingsApi = `${API_URL}/settings`;
const adminSettingsApi = `${API_URL}/admin/settings`;

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Public storefront settings.
 * Used by Navbar, Footer, Contact, Checkout, SEO, etc.
 */
export const getPublicSettings = async () => {
  const response = await axios.get(publicSettingsApi);
  return response.data;
};

/**
 * Full settings for the admin panel.
 */
export const getAdminSettings = async (token) => {
  const response = await axios.get(
    adminSettingsApi,
    authConfig(token)
  );

  return response.data;
};

/**
 * Save all settings from SettingsAdmin.
 */
export const updateAdminSettings = async (
  settings,
  token
) => {
  const response = await axios.put(
    adminSettingsApi,
    { settings },
    authConfig(token)
  );

  return response.data;
};

/**
 * Restore backend defaults.
 */
export const resetAdminSettings = async (token) => {
  const response = await axios.post(
    `${adminSettingsApi}/reset`,
    {},
    authConfig(token)
  );

  return response.data;
};