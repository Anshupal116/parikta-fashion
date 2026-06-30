import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdmin();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await loginAdmin(form);

      if (response.success) {
        navigate("/admin-dashboard");
      } else {
        alert(response.message || "Invalid admin login");
      }
    } catch (error) {
      console.log(error);
      alert("Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ee] flex items-center justify-center p-5">
      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8 w-full max-w-md">
        <h1 className="heading-font text-5xl text-center text-[#9A3F4D]">
          Admin Login
        </h1>

        <p className="text-center text-[#8b746b] mt-3">
          Secure Parikta Fashion admin access
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-[#eadbd4] rounded-xl p-4 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold disabled:opacity-60"
          >
            {loading ? "LOGIN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;