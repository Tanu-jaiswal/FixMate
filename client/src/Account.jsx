import { useState } from "react";
import { apiRequest } from "./api";
import { useAuth } from "./useAuth";

function Account() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      const { user: updatedUser } = await apiRequest("/auth/me", {
        method: "PATCH",
        body: {
          name: formData.get("name"),
          phone: formData.get("phone"),
          address: formData.get("address"),
        },
      });
      setUser(updatedUser);
      setMessage("Your profile has been updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="account-section">
      <div className="account-card">
        <div className="section-title">
          <h2>Your profile</h2>
          <p>Update the contact details used for your FixMate account.</p>
        </div>
        {error && <p className="form-message is-error" role="alert">{error}</p>}
        {message && <p className="form-message" role="status">{message}</p>}
        <form className="auth-form" onSubmit={saveProfile}>
          <label htmlFor="account-name">Full name</label>
          <input id="account-name" name="name" defaultValue={user.name} minLength="2" maxLength="100" required />
          <label htmlFor="account-email">Email address</label>
          <input id="account-email" type="email" value={user.email} readOnly />
          <label htmlFor="account-phone">Phone number</label>
          <input id="account-phone" name="phone" type="tel" defaultValue={user.phone || ""} maxLength="30" />
          <label htmlFor="account-address">Address</label>
          <textarea id="account-address" name="address" defaultValue={user.address || ""} maxLength="500" rows="3" />
          <button className="login-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Account;
