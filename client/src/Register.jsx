import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "./api";

function Register({ onAuthenticated }) {
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role,
    };

    if (role === "provider") {
      payload.city = formData.get("city");
      payload.experienceYears = Number(formData.get("experienceYears"));
      payload.specialties = String(formData.get("specialties"))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      payload.bio = formData.get("bio");
    }

    try {
      const { user } = await apiRequest("/auth/register", {
        method: "POST",
        body: payload,
      });
      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p>Join FixMate to find or offer trusted local services.</p>
        {error && <p className="form-message is-error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full Name</label>
          <input id="register-name" name="name" type="text" autoComplete="name" minLength="2" maxLength="100" required />
          <label htmlFor="register-email">Email Address</label>
          <input id="register-email" name="email" type="email" autoComplete="email" maxLength="254" required />
          <label htmlFor="register-phone">Phone Number</label>
          <input id="register-phone" name="phone" type="tel" autoComplete="tel" maxLength="30" />
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength="8"
            maxLength="128"
            required
          />
          <label htmlFor="register-role">Register As</label>
          <select
            id="register-role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="user">Customer</option>
            <option value="provider">Service Provider</option>
          </select>

          {role === "provider" && (
            <div className="provider-registration-fields">
              <label htmlFor="register-city">Service City</label>
              <input id="register-city" name="city" type="text" maxLength="100" required />
              <label htmlFor="register-specialties">Services Offered</label>
              <input
                id="register-specialties"
                name="specialties"
                type="text"
                placeholder="Plumbing, Electrical"
                required
              />
              <label htmlFor="register-experience">Years of Experience</label>
              <input id="register-experience" name="experienceYears" type="number" min="0" max="80" defaultValue="0" required />
              <label htmlFor="register-bio">About Your Work</label>
              <textarea id="register-bio" name="bio" maxLength="1000" rows="3" />
            </div>
          )}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="auth-bottom">
          Already have an account? <Link to="/login" state={location.state}>Sign in</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;