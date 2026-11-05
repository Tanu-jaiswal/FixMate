import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import { useAuth } from "./useAuth";

const providerActions = {
  pending: [["accepted", "Accept"], ["rejected", "Decline"]],
  accepted: [["in_progress", "Start work"]],
  in_progress: [["completed", "Mark complete"]],
};

function Booking({ selectedService, onClearSelection, onMessage }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadedForUser, setLoadedForUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const loading = Boolean(user) && loadedForUser !== user.id;

  useEffect(() => {
    let active = true;
    if (!user) {
      return () => {
        active = false;
      };
    }

    const endpoint = user.role === "provider" ? "/bookings/provider" : "/bookings/mine";
    apiRequest(endpoint)
      .then(({ bookings: result }) => {
        if (active) {
          setBookings(result);
          setError("");
          setLoadedForUser(user.id);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setLoadedForUser(user.id);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function submitBooking(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const { booking } = await apiRequest("/bookings", {
        method: "POST",
        body: {
          serviceId: selectedService._id,
          scheduledAt: new Date(formData.get("scheduledAt")).toISOString(),
          address: formData.get("address"),
          details: formData.get("details"),
        },
      });
      setBookings((current) => [booking, ...current]);
      onClearSelection();
      onMessage("Booking request sent. You can follow its status here.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelBooking(bookingId) {
    setError("");
    try {
      const { booking } = await apiRequest(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      setBookings((current) => current.map((item) => item._id === booking._id ? booking : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeStatus(bookingId, status) {
    setError("");
    try {
      const { booking } = await apiRequest(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: { status },
      });
      setBookings((current) => current.map((item) => item._id === booking._id ? booking : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="booking-section">
      <div className="booking-container">
        <div className="booking-header">
          <span>FIXMATE BOOKINGS</span>
          <h2>{user?.role === "provider" ? "Booking requests" : "Your bookings"}</h2>
          <p>
            {user?.role === "provider"
              ? "Review customer requests and keep each booking status up to date."
              : "Request a service and track its progress from your account."}
          </p>
        </div>

        {error && <p className="form-message is-error" role="alert">{error}</p>}

        {!user && (
          <p className="empty-state">
            {selectedService
              ? `Sign in to request ${selectedService.name}. Your selected service will be kept for this visit.`
              : "Sign in as a customer to create and manage bookings."}
          </p>
        )}

        {user?.role === "user" && selectedService && (
          <form className="booking-form" onSubmit={submitBooking}>
            <div className="selected-service">
              <div>
                <strong>{selectedService.name}</strong>
                <span>{selectedService.category} · {selectedService.city}</span>
              </div>
              <strong>₹{Number(selectedService.price).toLocaleString("en-IN")} / visit</strong>
              <button className="text-button" type="button" onClick={onClearSelection}>Remove</button>
            </div>
            <label htmlFor="booking-date">Date and Time</label>
            <input id="booking-date" name="scheduledAt" type="datetime-local" required />
            <label htmlFor="booking-address">Service Address</label>
            <textarea id="booking-address" name="address" maxLength="500" rows="3" required />
            <label htmlFor="booking-details">Describe the work needed</label>
            <textarea id="booking-details" name="details" maxLength="1500" rows="4" required />
            <button type="submit" disabled={submitting}>
              {submitting ? "Sending request…" : "Confirm Booking Request"}
            </button>
          </form>
        )}

        {user?.role === "provider" && (
          <p className="empty-state">Manage your profile and publish services in the provider workspace above.</p>
        )}

        {user && (
          <div className="booking-list">
            <h3>{user.role === "provider" ? "Requests" : "Booking history"}</h3>
            {loading && <p className="loading-message" role="status">Loading bookings…</p>}
            {!loading && bookings.length === 0 && (
              <p className="empty-state">
                {user.role === "provider" ? "No booking requests yet." : "You don&apos;t have any bookings yet."}
              </p>
            )}
            {bookings.map((booking) => (
              <article className="booking-item" key={booking._id}>
                <div className="booking-item-header">
                  <div>
                    <h4>{booking.service?.name || "Service booking"}</h4>
                    <p>
                      {user.role === "provider"
                        ? `Customer: ${booking.customer?.name || "Customer"}`
                        : `Provider: ${booking.provider?.user?.name || "Local professional"}`}
                    </p>
                  </div>
                  <span className={`status-pill status-${booking.status}`}>{booking.status.replace("_", " ")}</span>
                </div>
                <p>{new Date(booking.scheduledAt).toLocaleString()}</p>
                <p>{booking.address}</p>
                <p>{booking.details}</p>
                {user.role === "user" && ["pending", "accepted"].includes(booking.status) && (
                  <button className="secondary-button" type="button" onClick={() => cancelBooking(booking._id)}>
                    Cancel booking
                  </button>
                )}
                {user.role === "provider" && (providerActions[booking.status] || []).map(([status, label]) => (
                  <button
                    className={status === "rejected" ? "secondary-button" : "status-action"}
                    key={status}
                    type="button"
                    onClick={() => changeStatus(booking._id, status)}
                  >
                    {label}
                  </button>
                ))}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Booking;
