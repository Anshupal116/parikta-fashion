import { useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

function Customize() {
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    dressType: "",
    fabric: "",
    color: "#9A3F4D",
    bust: "",
    waist: "",
    hip: "",
    shoulder: "",
    length: "",
    notes: "",
  });

  const dressTypes = ["Suit", "Lehenga", "Saree", "Kurti", "Gown"];
  const fabrics = ["Georgette", "Cotton", "Silk", "Velvet", "Chiffon"];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Custom Design Request Submitted Successfully ✅");
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14">
        <Container>
          <div className="text-center mb-10">
            <p className="text-[#BFA996] font-semibold tracking-[0.25em]">
              CUSTOM MADE
            </p>

            <h1 className="heading-font text-5xl text-[#5B3B32] mt-3">
              Customize Your Dream Outfit
            </h1>

            <p className="text-[#8b746b] mt-3">
              Select design, fabric, color, measurements and upload reference image.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid lg:grid-cols-[65%_35%] gap-8 items-start"
          >
            <div className="bg-[#fffaf7] rounded-3xl shadow-sm border border-[#eadbd4] p-6 md:p-8 space-y-8">
              <div>
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                  Personal Details
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    name="name"
                    placeholder="Customer Name"
                    value={form.name}
                    onChange={handleChange}
                    className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                    required
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                  Choose Dress Type
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {dressTypes.map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setForm({ ...form, dressType: type })}
                      className={`border rounded-2xl p-5 font-bold transition ${
                        form.dressType === type
                          ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                          : "bg-white border-[#eadbd4] text-[#5B3B32] hover:border-[#9A3F4D]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                  Choose Fabric
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {fabrics.map((fabric) => (
                    <button
                      type="button"
                      key={fabric}
                      onClick={() => setForm({ ...form, fabric })}
                      className={`border rounded-2xl p-5 font-bold transition ${
                        form.fabric === fabric
                          ? "bg-[#5B3B32] text-white border-[#5B3B32]"
                          : "bg-white border-[#eadbd4] text-[#5B3B32] hover:border-[#5B3B32]"
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                  Color Preference
                </h2>

                <div className="flex items-center gap-5">
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="w-20 h-14 border border-[#eadbd4] rounded-xl cursor-pointer"
                  />

                  <input
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Color code or color name"
                    className="border border-[#eadbd4] rounded-xl p-4 flex-1 outline-none focus:border-[#9A3F4D] bg-white"
                  />
                </div>
              </div>

              <div>
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                  Measurements
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    ["bust", "Bust"],
                    ["waist", "Waist"],
                    ["hip", "Hip"],
                    ["shoulder", "Shoulder"],
                    ["length", "Length"],
                  ].map(([name, label]) => (
                    <input
                      key={name}
                      type="text"
                      name={name}
                      placeholder={label}
                      value={form[name]}
                      onChange={handleChange}
                      className="border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                    />
                  ))}
                </div>

                <p className="text-[#8b746b] text-sm mt-3">
                  Measurements should be in inches.
                </p>
              </div>

              <div>
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                  Upload Reference Image
                </h2>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-[#eadbd4] rounded-xl p-4 bg-white"
                />

                {preview && (
                  <img
                    src={preview}
                    alt="Reference Preview"
                    className="mt-5 w-56 h-64 object-cover rounded-2xl border border-[#eadbd4]"
                  />
                )}
              </div>

              <div>
                <h2 className="heading-font text-3xl text-[#5B3B32] mb-5">
                  Design Instructions
                </h2>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write embroidery, sleeve style, neck design, fitting or any special instruction..."
                  className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none focus:border-[#9A3F4D] bg-white"
                />
              </div>
            </div>

            <aside className="bg-[#fffaf7] rounded-3xl shadow-sm border border-[#eadbd4] p-6 lg:sticky lg:top-28">
              <h2 className="heading-font text-3xl text-[#5B3B32]">
                Custom Summary
              </h2>

              <div className="mt-6 space-y-4 text-[#5B3B32]">
                <div className="flex justify-between">
                  <span>Dress Type</span>
                  <span className="font-semibold">
                    {form.dressType || "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Fabric</span>
                  <span className="font-semibold">
                    {form.fabric || "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Color</span>
                  <span
                    className="w-7 h-7 rounded-full border border-[#eadbd4]"
                    style={{ backgroundColor: form.color }}
                  ></span>
                </div>
              </div>

              <div className="bg-[#FDEAE6] border border-[#eadbd4] rounded-2xl p-5 mt-7">
                <h3 className="font-bold text-lg text-[#5B3B32]">
                  Estimated Price
                </h3>

                <p className="text-[#9A3F4D] text-3xl font-bold mt-2">
                  ₹2,500 - ₹8,000
                </p>

                <p className="text-[#8b746b] mt-2 text-sm">
                  Final price depends on fabric, embroidery and customization.
                </p>
              </div>

              <div className="mt-7 bg-white rounded-2xl p-5 border border-[#eadbd4]">
                <h3 className="font-bold text-[#5B3B32]">
                  Measurement Guide
                </h3>

                <ul className="text-sm text-[#8b746b] mt-3 space-y-2">
                  <li>• Bust: Full chest round measurement</li>
                  <li>• Waist: Natural waist round measurement</li>
                  <li>• Hip: Full hip round measurement</li>
                  <li>• Length: Shoulder to desired outfit length</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold text-lg mt-7 hover:bg-[#7d3140]"
              >
                Submit Custom Order
              </button>
            </aside>
          </form>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default Customize;