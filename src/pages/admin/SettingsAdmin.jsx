import { useEffect, useState } from "react";

const defaultSettings = {
  storeName: "Parikta Fashion",
  whatsapp: "919711111111",
  phone: "+91 9711111111",
  email: "support@pariktafashion.com",
  instagram: "https://instagram.com/",
  freeShippingLimit: "999",
  shippingCharge: "80",
  address: "India",
};

function SettingsAdmin() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const savedSettings = JSON.parse(
      localStorage.getItem("parikta_store_settings")
    );

    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const saveSettings = (e) => {
    e.preventDefault();

    localStorage.setItem(
      "parikta_store_settings",
      JSON.stringify(settings)
    );

    alert("Settings saved successfully ✅");
  };

  const resetSettings = () => {
    const ok = window.confirm("Reset settings to default?");
    if (!ok) return;

    localStorage.setItem(
      "parikta_store_settings",
      JSON.stringify(defaultSettings)
    );

    setSettings(defaultSettings);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Store Settings
        </h1>

        <p className="text-[#8b746b] mt-2">
          Manage store contact details, shipping and social links.
        </p>
      </div>

      <form
        onSubmit={saveSettings}
        className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8"
      >
        <h2 className="heading-font text-3xl text-[#5B3B32] mb-6">
          Basic Details
        </h2>

        <div className="grid grid-cols-2 gap-5">
          <input
            name="storeName"
            value={settings.storeName}
            onChange={handleChange}
            placeholder="Store Name"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="phone"
            value={settings.phone}
            onChange={handleChange}
            placeholder="Display Phone Number"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="whatsapp"
            value={settings.whatsapp}
            onChange={handleChange}
            placeholder="WhatsApp Number with country code"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="email"
            value={settings.email}
            onChange={handleChange}
            placeholder="Support Email"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="instagram"
            value={settings.instagram}
            onChange={handleChange}
            placeholder="Instagram Link"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none col-span-2"
          />

          <textarea
            name="address"
            value={settings.address}
            onChange={handleChange}
            placeholder="Store Address"
            rows="4"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none col-span-2"
          />
        </div>

        <h2 className="heading-font text-3xl text-[#5B3B32] mt-10 mb-6">
          Shipping Settings
        </h2>

        <div className="grid grid-cols-2 gap-5">
          <input
            name="freeShippingLimit"
            type="number"
            value={settings.freeShippingLimit}
            onChange={handleChange}
            placeholder="Free Shipping Limit"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="shippingCharge"
            type="number"
            value={settings.shippingCharge}
            onChange={handleChange}
            placeholder="Shipping Charge"
            className="border border-[#eadbd4] rounded-xl p-4 outline-none"
          />
        </div>

        <div className="mt-8 bg-[#FDEAE6] border border-[#eadbd4] rounded-2xl p-5">
          <h3 className="font-bold text-[#5B3B32] mb-3">
            Current Preview
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm text-[#5B3B32]">
            <p>
              <strong>Store:</strong> {settings.storeName}
            </p>
            <p>
              <strong>Phone:</strong> {settings.phone}
            </p>
            <p>
              <strong>WhatsApp:</strong> {settings.whatsapp}
            </p>
            <p>
              <strong>Email:</strong> {settings.email}
            </p>
            <p>
              <strong>Free Shipping:</strong> Above ₹
              {settings.freeShippingLimit}
            </p>
            <p>
              <strong>Shipping Charge:</strong> ₹
              {settings.shippingCharge}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold"
          >
            SAVE SETTINGS
          </button>

          <button
            type="button"
            onClick={resetSettings}
            className="bg-[#5B3B32] text-white px-8 py-4 rounded-xl font-bold"
          >
            RESET DEFAULT
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsAdmin;