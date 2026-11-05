import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "./api";

function Login({ onAuthenticated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const { user } = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email: formData.get("email"),
          password: formData.get("password"),
        },
      });
      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-section">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to manage your FixMate account</p>
        </div>
        {error && <p className="form-message is-error" role="alert">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength="254"
            required
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="register-text">
          Don&apos;t have an account? <Link to="/register" state={location.state}>Create one</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
