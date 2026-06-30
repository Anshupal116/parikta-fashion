import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Container from "../../components/Container";
import { useCustomer } from "../../context/CustomerContext";

function Register() {
  const navigate = useNavigate();
  const { registerCustomer } = useCustomer();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await registerCustomer(form);

    if (response.success) {
      alert("Account created ✅");
      navigate("/");
    } else {
      alert(response.message || "Register failed");
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14">
        <Container>
          <div className="max-w-md mx-auto bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8">
            <h1 className="heading-font text-5xl text-[#5B3B32] text-center">
              Create Account
            </h1>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none"
              />

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none"
              />

              <button className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold">
                CREATE ACCOUNT
              </button>
            </form>

            <p className="text-center text-[#6d554d] mt-6">
              Already have account?{" "}
              <Link to="/login" className="text-[#9A3F4D] font-bold">
                Login
              </Link>
            </p>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default Register;