import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      email === "admin@parikta.com" &&
      password === "Parikta@2026"
    ) {
      localStorage.setItem("parikta_admin", "true");
      navigate("/admin-dashboard");
    } else {
      alert("Invalid Login");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ee] flex items-center justify-center p-5">
      <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-8 w-full max-w-md">
        <h1 className="heading-font text-5xl text-center text-[#9A3F4D]">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#eadbd4] rounded-xl p-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#eadbd4] rounded-xl p-4"
          />

          <button
            type="submit"
            className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;