import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./api";

const initialData = {
  statistics: null,
  users: [],
  providers: [],
  services: [],
  bookings: [],
};

function AdminDashboard() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    const [overview, users, providers, services, bookings] = await Promise.all([
      apiRequest("/admin/overview"),
      apiRequest("/admin/users"),
      apiRequest("/admin/providers"),
      apiRequest("/admin/services"),
      apiRequest("/admin/bookings"),
    ]);
    return {
      statistics: overview.statistics,
      users: users.users,
      providers: providers.providers,
      services: services.services,
      bookings: bookings.bookings,
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchDashboard());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchDashboard]);

  async function setServiceAvailability(service) {
    setError("");
    setMessage("");
    try {
      await apiRequest(`/admin/services/${service._id}/status`, {
        method: "PATCH",
        body: { isActive: !service.isActive },
      });
      setMessage(`${service.name} is now ${service.isActive ? "hidden" : "visible"}.`);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const statistics = data.statistics;

  return (
    <section className="admin-section">
      <div className="section-title">
        <span className="about-label">FIXMATE ADMINISTRATION</span>
        <h2>Platform overview</h2>
        <p>Review accounts, service listings, and booking activity.</p>
      </div>
      {error && <p className="form-message is-error" role="alert">{error}</p>}
      {message && <p className="form-message" role="status">{message}</p>}
      {loading && <p className="loading-message" role="status">Loading administration data…</p>}
      {statistics && (
        <>
          <div className="admin-stat-grid">
            {[
              ["Customers", statistics.customers],
              ["Providers", statistics.providers],
              ["Active services", statistics.activeServices],
              ["Bookings", statistics.bookings],
            ].map(([label, value]) => (
              <article className="admin-stat-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <div className="admin-status-summary">
            <h3>Bookings by status</h3>
            <div>
              {Object.entries(statistics.bookingStatuses).map(([status, count]) => (
                <span className={`status-pill status-${status}`} key={status}>
                  {status.replaceAll("_", " ")} · {count}
                </span>
              ))}
              {Object.keys(statistics.bookingStatuses).length === 0 && (
                <p className="empty-state">No bookings have been created yet.</p>
              )}
            </div>
          </div>

          <section className="admin-panel">
            <h3>Service listings</h3>
            {data.services.length === 0 ? <p className="empty-state">No service listings found.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Service</th><th>Provider</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {data.services.map((service) => (
                      <tr key={service._id}>
                        <td>{service.name}<small>{service.category}</small></td>
                        <td>{service.provider?.user?.name || "Unavailable"}</td>
                        <td>{service.city}</td>
                        <td>{service.isActive ? "Visible" : "Hidden"}</td>
                        <td>
                          <button className="secondary-button" type="button" onClick={() => setServiceAvailability(service)}>
                            {service.isActive ? "Hide listing" : "Restore listing"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <h3>Customers and providers</h3>
            {data.users.length === 0 ? <p className="empty-state">No customer or provider accounts found.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                  <tbody>
                    {data.users.map((account) => (
                      <tr key={account._id}>
                        <td>{account.name}</td>
                        <td>{account.email}</td>
                        <td>{account.role}</td>
                        <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <h3>Provider profiles ({data.providers.length})</h3>
            {data.providers.length === 0 ? <p className="empty-state">No provider profiles found.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Provider</th><th>Specialties</th><th>Location</th><th>Availability</th></tr></thead>
                  <tbody>
                    {data.providers.map((provider) => (
                      <tr key={provider._id}>
                        <td>{provider.user?.name || "Unavailable"}</td>
                        <td>{provider.specialties.join(", ")}</td>
                        <td>{provider.city}</td>
                        <td>{provider.isActive ? "Active" : "Hidden"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <h3>All bookings</h3>
            {data.bookings.length === 0 ? <p className="empty-state">No bookings found.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Service</th><th>Customer</th><th>Provider</th><th>Scheduled</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.service?.name || "Service unavailable"}<small>{booking.service?.category}</small></td>
                        <td>{booking.customer?.name || "Unavailable"}</td>
                        <td>{booking.provider?.user?.name || "Unavailable"}</td>
                        <td>{new Date(booking.scheduledAt).toLocaleString()}</td>
                        <td><span className={`status-pill status-${booking.status}`}>{booking.status.replaceAll("_", " ")}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default AdminDashboard;
