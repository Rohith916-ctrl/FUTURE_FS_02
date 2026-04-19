import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "admin@mini-crm.local", password: "Admin@12345" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background" />
      <section className="auth-shell glass-card">
        <div className="brand-mark">
          <div className="brand-dot" />
          <span>Mini CRM</span>
        </div>
        <h1>Admin login</h1>
        <p className="auth-copy">Securely manage incoming leads, notes, and follow-ups from one polished dashboard.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="admin@company.com" required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
          </label>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <Spinner label="Signing in..." /> : "Sign in"}
          </button>
        </form>

        <div className="auth-hint">
          <span>Default demo account</span>
          <strong>admin@mini-crm.local / Admin@12345</strong>
        </div>
      </section>
    </main>
  );
}